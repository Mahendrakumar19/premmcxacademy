import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import jwt from 'jsonwebtoken';
import { getUserCourses } from '@/lib/moodle-api';

// JWT secret - use a strong secret in production
const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'your-secret-key-change-in-production';
const TOKEN_EXPIRY = '2h'; // Token valid for 2 hours
const REFRESH_TOKEN_EXPIRY = '7d'; // Refresh token valid for 7 days

/**
 * GET /api/secure-streaming/token
 * Generate a secure JWT token for video streaming
 * 
 * Query params:
 *   - courseId: number (required)
 *   - moduleId: number (required)
 * 
 * Authorization: Requires next-auth session + course enrollment
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized - Please log in' }, { status: 401 });
    }

    // 2. Get and validate parameters
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    const moduleId = searchParams.get('moduleId');

    if (!courseId || !moduleId) {
      return NextResponse.json(
        { error: 'Missing required parameters: courseId and moduleId' },
        { status: 400 }
      );
    }

    const courseIdNum = parseInt(courseId);
    const moduleIdNum = parseInt(moduleId);

    if (isNaN(courseIdNum) || isNaN(moduleIdNum)) {
      return NextResponse.json(
        { error: 'Invalid courseId or moduleId - must be numbers' },
        { status: 400 }
      );
    }

    // 3. Verify enrollment in the course
    const userId = parseInt(session.user.id);
    const userToken = (session.user as any)?.token;

    if (!userToken) {
      return NextResponse.json(
        { error: 'Moodle token not available in session' },
        { status: 400 }
      );
    }

    try {
      const userCourses = await getUserCourses(userId, userToken);
      const isEnrolled = userCourses.some((course: any) => course.id === courseIdNum);

      if (!isEnrolled) {
        console.warn(`[SecureStreaming] User ${userId} attempted to access course ${courseIdNum} without enrollment`);
        return NextResponse.json(
          { error: 'Access denied - You must be enrolled in this course' },
          { status: 403 }
        );
      }

      console.log(`[SecureStreaming] ✓ User ${userId} verified for course ${courseIdNum}, module ${moduleIdNum}`);
    } catch (enrollError) {
      console.error('[SecureStreaming] Enrollment verification failed:', enrollError);
      return NextResponse.json(
        { error: 'Failed to verify course enrollment' },
        { status: 500 }
      );
    }

    // 4. Generate JWT token with claims
    const tokenPayload = {
      userId,
      courseId: courseIdNum,
      moduleId: moduleIdNum,
      email: session.user.email,
      iat: Math.floor(Date.now() / 1000),
    };

    const accessToken = jwt.sign(tokenPayload, JWT_SECRET, {
      expiresIn: TOKEN_EXPIRY,
      issuer: 'lms-liquid-glass',
      subject: userId.toString(),
    });

    // Generate refresh token (simplified - in production, store in database)
    const refreshTokenPayload = {
      userId,
      type: 'refresh',
    };

    const refreshToken = jwt.sign(refreshTokenPayload, JWT_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRY,
      issuer: 'lms-liquid-glass',
    });

    // 5. Return token response
    return NextResponse.json(
      {
        token: accessToken,
        expires_in: 7200, // 2 hours in seconds
        token_type: 'Bearer',
        refresh_token: refreshToken,
        courseId: courseIdNum,
        moduleId: moduleIdNum,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, private',
          'Pragma': 'no-cache',
        },
      }
    );

  } catch (error) {
    console.error('[SecureStreaming] Error generating token:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/secure-streaming/token/refresh
 * Refresh an expired access token using refresh token
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { refresh_token } = body;

    if (!refresh_token) {
      return NextResponse.json(
        { error: 'Missing refresh_token' },
        { status: 400 }
      );
    }

    // Verify refresh token
    const decoded = jwt.verify(refresh_token, JWT_SECRET) as any;

    if (decoded.type !== 'refresh') {
      return NextResponse.json(
        { error: 'Invalid refresh token' },
        { status: 401 }
      );
    }

    // Check session still valid
    const session = await getServerSession(authOptions);
    if (!session?.user || parseInt(session.user.id) !== decoded.userId) {
      return NextResponse.json(
        { error: 'Session expired - please log in again' },
        { status: 401 }
      );
    }

    // Generate new access token (keep same claims as original)
    const newToken = jwt.sign(
      {
        userId: decoded.userId,
        iat: Math.floor(Date.now() / 1000),
      },
      JWT_SECRET,
      {
        expiresIn: TOKEN_EXPIRY,
        issuer: 'lms-liquid-glass',
        subject: decoded.userId.toString(),
      }
    );

    return NextResponse.json({
      token: newToken,
      expires_in: 7200,
      token_type: 'Bearer',
    });

  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { error: 'Invalid or expired refresh token' },
        { status: 401 }
      );
    }
    console.error('[SecureStreaming] Refresh token error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
