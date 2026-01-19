import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { callMoodleAPI } from '@/lib/moodle-api';

/**
 * Payment Success Handler
 * Handles redirects from Moodle after payment completion
 * 
 * GET /api/payment-success?courseId=2&userId=123&status=complete
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    const userId = searchParams.get('userId');
    const status = searchParams.get('status') || 'complete';
    const transactionId = searchParams.get('transactionId');

    console.log('💰 Payment success handler triggered:', {
      courseId,
      userId,
      status,
      transactionId,
    });

    if (!courseId) {
      console.warn('⚠️ Missing courseId parameter');
      return NextResponse.redirect(
        new URL('/cart?error=missing-course-id', request.url)
      );
    }

    // Get current session
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      console.warn('⚠️ User not authenticated, redirecting to login');
      return NextResponse.redirect(
        new URL(
          `/auth/login?callbackUrl=${encodeURIComponent(`/payment-success?courseId=${courseId}`)}`,
          request.url
        )
      );
    }

    const userToken = (session.user as any).token;
    if (!userToken) {
      console.error('❌ No user token available');
      return NextResponse.redirect(
        new URL('/cart?error=no-token', request.url)
      );
    }

    // Verify enrollment in Moodle
    console.log(`🔍 Verifying enrollment for user ${session.user.id} in course ${courseId}...`);
    
    let isEnrolled = false;
    try {
      const enrolledCourses = await callMoodleAPI(
        'core_enrol_get_users_courses',
        { userid: session.user.id },
        userToken
      );

      isEnrolled =
        Array.isArray(enrolledCourses) &&
        enrolledCourses.some((course: any) => course.id === parseInt(courseId));

      if (isEnrolled) {
        console.log(`✅ User ${session.user.id} is enrolled in course ${courseId}`);
      } else {
        console.warn(`⚠️ User ${session.user.id} is NOT enrolled in course ${courseId}`);
      }
    } catch (error) {
      console.error('❌ Error verifying enrollment:', error);
      // Don't fail - allow redirect even if verification fails
    }

    // Build redirect URL based on enrollment status
    let redirectUrl: string;
    
    if (isEnrolled || status === 'complete') {
      redirectUrl = `/my-courses?enrolled=true&courseId=${courseId}`;
      console.log(`✅ Redirecting to courses: ${redirectUrl}`);
    } else {
      redirectUrl = `/cart?payment=failed&courseId=${courseId}&status=${status}`;
      console.log(`⚠️ Redirecting to cart with failure message: ${redirectUrl}`);
    }

    return NextResponse.redirect(new URL(redirectUrl, request.url));
  } catch (error) {
    console.error('❌ Payment success handler error:', error);
    return NextResponse.redirect(
      new URL('/cart?error=payment-handler-error', request.url)
    );
  }
}

/**
 * POST handler for webhook-style payments
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { courseId, userId, status, paymentId, transactionId } = body;

    console.log('📦 Payment webhook received:', body);

    if (!courseId) {
      return NextResponse.json(
        { error: 'Missing courseId' },
        { status: 400 }
      );
    }

    // Verify user session
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userToken = (session.user as any).token;
    if (!userToken) {
      return NextResponse.json(
        { error: 'No user token' },
        { status: 401 }
      );
    }

    // Check enrollment
    let isEnrolled = false;
    try {
      const enrolledCourses = await callMoodleAPI(
        'core_enrol_get_users_courses',
        { userid: session.user.id },
        userToken
      );

      isEnrolled =
        Array.isArray(enrolledCourses) &&
        enrolledCourses.some((course: any) => course.id === parseInt(courseId));
    } catch (error) {
      console.error('Error checking enrollment:', error);
    }

    const success = isEnrolled || status === 'complete';
    const redirectUrl = success
      ? `/my-courses?enrolled=true&courseId=${courseId}`
      : `/cart?payment=failed&courseId=${courseId}`;

    return NextResponse.json({
      success,
      isEnrolled,
      courseId: parseInt(courseId),
      status,
      paymentId,
      transactionId,
      redirectUrl,
      message: success
        ? 'Payment processed successfully'
        : 'Payment processing failed',
    });
  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
