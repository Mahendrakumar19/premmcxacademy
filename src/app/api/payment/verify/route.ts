import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { enrollUserInCourse } from '@/lib/moodle-api';

export async function POST(request: NextRequest) {
  try {
    const { orderId, paymentId, signature, courseIds, userId } = await request.json();

    // Verify signature
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    if (generatedSignature !== signature) {
      return NextResponse.json(
        { success: false, error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Enroll user in all courses
    const enrollmentResults = [];
    for (const courseId of courseIds) {
      try {
        await enrollUserInCourse(userId, courseId, 5); // 5 = student role
        enrollmentResults.push({ courseId, success: true });
      } catch (error) {
        console.error(`Failed to enroll in course ${courseId}:`, error);
        enrollmentResults.push({ courseId, success: false });
      }
    }

    // Store payment record (in a real app, save to database)
    console.log('Payment verified and stored:', {
      userId,
      courseIds,
      paymentId,
      orderId,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      enrollmentResults,
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Verification failed' },
      { status: 500 }
    );
  }
}
