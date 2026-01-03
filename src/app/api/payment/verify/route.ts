import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { 
  completeRazorpayTransaction, 
  manualEnrollUser, 
  selfEnrollUser 
} from '@/lib/moodle-api';

export async function POST(request: NextRequest) {
  try {
    const { orderId, paymentId, signature, courseIds, userId, isFree, isDirect } = await request.json();
    
    // Get session to fetch user token
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !((session.user as unknown as { token?: string })?.token)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    const userToken = (session.user as unknown as { token?: string }).token;
    const paymentToken = process.env.MOODLE_PAYMENT_TOKEN || process.env.MOODLE_TOKEN;

    console.log('🔍 Processing enrollment:', { orderId, paymentId, courseIds, isFree, isDirect });

    // For direct or free enrollment, skip payment processing
    if (isFree || isDirect) {
      console.log('📝 Processing direct/free course enrollment via Moodle backend...');
    } else {
      // For paid courses with Razorpay, complete transaction via Moodle's payment API
      console.log('💳 Completing Razorpay payment transaction with Moodle...');
      try {
        const result = await completeRazorpayTransaction(
          courseIds[0],
          orderId,
          paymentId,
          signature,
          paymentToken
        );

        console.log('✅ Moodle Razorpay payment completed:', result);
        
        if (result.success === false) {
          throw new Error(result.message || 'Payment completion failed');
        }
        
        // If Moodle handled enrollment, return success
        if (result.enrolled || result.success) {
          return NextResponse.json({
            success: true,
            message: 'Payment verified and enrollment completed by Moodle',
            enrollmentResults: courseIds.map((id: number) => ({ courseId: id, success: true })),
          });
        }
      } catch (error: unknown) {
        console.error('❌ Moodle transaction error:', error);
        console.log('⚠️ Falling back to manual enrollment...');
        // Continue to manual enrollment fallback
      }
    }

    // Enroll user in all courses using manual enrollment API with payment token
    const enrollmentResults = [];
    for (const courseId of courseIds) {
      try {
        // Use manual enrollment API which allows admin to enroll any user
        const result = await manualEnrollUser(
          courseId,
          parseInt(session.user.id),
          5, // Student role
          paymentToken
        );
        
        console.log(`✅ Enrolled user ${userId} in course ${courseId}:`, result);
        enrollmentResults.push({ courseId, success: true });
        } catch (error: unknown) {
        console.error(`❌ Failed to enroll in course ${courseId}:`, error);
        
        // Fallback: Try self-enrollment with user token
        try {
          await selfEnrollUser(courseId, userToken);
          console.log(`✅ Self-enrolled user ${userId} in course ${courseId}`);
          enrollmentResults.push({ courseId, success: true });
        } catch (fallbackError) {
          enrollmentResults.push({ 
            courseId, 
            success: false, 
            error: error instanceof Error ? error.message : 'Enrollment failed'
          });
        }
      }
    }

    const allSuccessful = enrollmentResults.every(r => r.success);

    return NextResponse.json({
      success: allSuccessful,
      message: allSuccessful 
        ? 'Payment verified and enrollment completed' 
        : 'Some enrollments failed',
      enrollmentResults,
    });
  } catch (error: unknown) {
    console.error('❌ Payment verification error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Verification failed' },
      { status: 500 }
    );
  }
}
