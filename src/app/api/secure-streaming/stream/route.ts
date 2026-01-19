import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'your-secret-key-change-in-production';
const MOODLE_URL = process.env.NEXT_PUBLIC_MOODLE_URL || '';
const MOODLE_TOKEN = process.env.MOODLE_TOKEN || '';

interface TokenPayload {
  userId: number;
  courseId: number;
  moduleId: number;
  email?: string;
  iat: number;
  exp: number;
}

/**
 * GET /api/secure-streaming/stream
 * Proxy HLS video segments and playlists with JWT token validation
 * 
 * Query params:
 *   - token: string (JWT token, required)
 *   - type: 'master' | 'playlist' | 'segment' (required)
 *   - file: string (video file path, required)
 *   - courseId: number (required)
 *   - moduleId: number (required)
 * 
 * Returns: Video content stream with proper CORS headers
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const type = searchParams.get('type');
    const file = searchParams.get('file');
    const courseId = searchParams.get('courseId');
    const moduleId = searchParams.get('moduleId');

    // 1. Validate required parameters
    if (!token || !type || !file || !courseId || !moduleId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400, headers: corsHeaders() }
      );
    }

    // 2. Verify JWT token
    let decoded: TokenPayload;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    } catch (error) {
      console.error('[SecureStreaming] Token verification failed:', error);
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401, headers: corsHeaders() }
      );
    }

    // 3. Verify token matches requested course and module
    const reqCourseId = parseInt(courseId);
    const reqModuleId = parseInt(moduleId);

    if (decoded.courseId !== reqCourseId || decoded.moduleId !== reqModuleId) {
      console.warn(
        `[SecureStreaming] Token mismatch - Token: course=${decoded.courseId}, module=${decoded.moduleId} | Request: course=${reqCourseId}, module=${reqModuleId}`
      );
      return NextResponse.json(
        { error: 'Token does not match requested resource' },
        { status: 403, headers: corsHeaders() }
      );
    }

    // 4. Construct Moodle video URL based on type
    let videoUrl: string;
    const safeFileName = encodeURIComponent(file);

    if (type === 'master' || type === 'playlist') {
      // HLS master playlist or variant playlist
      videoUrl = `${MOODLE_URL}/webservice/pluginfile.php/${courseId}/${moduleId}/${safeFileName}?token=${MOODLE_TOKEN}`;
    } else if (type === 'segment') {
      // HLS video segment (.ts file)
      videoUrl = `${MOODLE_URL}/webservice/pluginfile.php/${courseId}/${moduleId}/${safeFileName}?token=${MOODLE_TOKEN}`;
    } else {
      return NextResponse.json(
        { error: 'Invalid type parameter' },
        { status: 400, headers: corsHeaders() }
      );
    }

    // 5. Fetch video content from Moodle
    const videoResponse = await fetch(videoUrl, {
      headers: {
        'User-Agent': 'LMS-NextJS-Proxy/1.0',
      },
    });

    if (!videoResponse.ok) {
      console.error(
        `[SecureStreaming] Moodle fetch failed: ${videoResponse.status} ${videoResponse.statusText}`
      );
      return NextResponse.json(
        { error: 'Video not found or access denied' },
        { status: videoResponse.status, headers: corsHeaders() }
      );
    }

    // 6. Stream the video content with appropriate headers
    const contentType = videoResponse.headers.get('content-type') || getContentType(type);
    const contentLength = videoResponse.headers.get('content-length');

    const headers: HeadersInit = {
      ...corsHeaders(),
      'Content-Type': contentType,
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=3600',
    };

    if (contentLength) {
      headers['Content-Length'] = contentLength;
    }

    // Log access for analytics
    logStreamAccess(decoded.userId, reqCourseId, reqModuleId, type, file);

    // Return the video stream
    return new NextResponse(videoResponse.body, {
      status: 200,
      headers,
    });

  } catch (error) {
    console.error('[SecureStreaming] Stream error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders() }
    );
  }
}

/**
 * Handle OPTIONS preflight for CORS
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(),
  });
}

/**
 * CORS headers for secure streaming
 */
function corsHeaders(): HeadersInit {
  return {
    'Access-Control-Allow-Origin': process.env.NEXTAUTH_URL || '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}

/**
 * Get content type based on stream type
 */
function getContentType(type: string): string {
  switch (type) {
    case 'master':
    case 'playlist':
      return 'application/vnd.apple.mpegurl';
    case 'segment':
      return 'video/MP2T';
    default:
      return 'application/octet-stream';
  }
}

/**
 * Log video streaming access for analytics
 * In production, this should write to database or analytics service
 */
function logStreamAccess(
  userId: number,
  courseId: number,
  moduleId: number,
  type: string,
  file: string
): void {
  const logEntry = {
    timestamp: new Date().toISOString(),
    userId,
    courseId,
    moduleId,
    type,
    file,
    ip: 'proxy', // In production, get from request headers
  };

  // For now, just console log. In production, save to database
  console.log('[SecureStreaming] Access:', JSON.stringify(logEntry));
}
