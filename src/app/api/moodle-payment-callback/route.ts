import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { callMoodleAPI } from '@/lib/moodle-api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    const userId = searchParams.get('userId');
    const paymentStatus = searchParams.get('status') || 'unknown';
    const paymentId = searchParams.get('paymentId');
    const transactionId = searchParams.get('transactionId');

    if (!courseId) {
      return NextResponse.redirect(
        new URL('/cart?error=missing-course-id', request.url)
      );
    }

    // Verify user session
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.redirect(
        new URL('/auth/login?callbackUrl=/cart', request.url)
      );
    }

    const userToken = (session.user as any).token;
    
    if (!userToken) {
      return NextResponse.redirect(
        new URL('/cart?error=missing-user-token', request.url)
      );
    }

    // Check enrollment status in learning platform
    let isEnrolled = false;
    try {
      const enrolledCourses = await callMoodleAPI(  // This calls the backend API
        'core_enrol_get_users_courses', 
        { userid: session.user.id }, 
        userToken
      );
      
      isEnrolled = Array.isArray(enrolledCourses) && 
                  enrolledCourses.some((course: any) => course.id == courseId);
    } catch (error) {
      console.error('Error checking enrollment:', error);
      // Don't fail the process if enrollment check fails
    }

    // Build redirect URL with payment status
    let redirectUrl;
    if (paymentStatus === 'success' || isEnrolled) {
      redirectUrl = `/my-courses?enrolled=true&courseId=${courseId}`;
    } else {
      redirectUrl = `/cart?payment=failed&courseId=${courseId}&status=${paymentStatus}`;
    }

    return NextResponse.redirect(new URL(redirectUrl, request.url));
  } catch (error) {
    console.error('Payment callback error:', error);
    return NextResponse.redirect(
      new URL('/cart?error=callback-failed', request.url)
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { courseId, userId, paymentStatus, paymentId, transactionId } = body;

    if (!courseId) {
      return NextResponse.json(
        { error: 'Missing course ID' },
        { status: 400 }
      );
    }

    // Process payment confirmation from learning platform
    // This would typically be a webhook from the learning platform
    console.log('Payment webhook received:', { courseId, paymentStatus, paymentId, transactionId });

    // Verify user and enrollment status
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is enrolled in the course
    const userToken = (session.user as any).token;
    let isEnrolled = false;
    
    try {
      const enrolledCourses = await callMoodleAPI(
        'core_enrol_get_users_courses', 
        { userid: session.user.id }, 
        userToken
      );
      
      isEnrolled = Array.isArray(enrolledCourses) && 
                  enrolledCourses.some((course: any) => course.id == courseId);
    } catch (error) {
      console.error('Error checking enrollment:', error);
    }

    return NextResponse.json({ 
      success: true, 
      enrolled: isEnrolled,
      courseId 
    });
  } catch (error) {
    console.error('Payment webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}