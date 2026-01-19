import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const MOODLE_URL = process.env.MOODLE_URL!;
const MOODLE_TOKEN = process.env.MOODLE_TOKEN!;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET!;

let transactionId = '';

export async function POST(request: NextRequest) {
  transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

  try {
    const body = await request.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      courseIds,
      userEmail,
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: 'Missing payment details' },
        { status: 400 }
      );
    }

    // Verify Razorpay signature
    const shasum = crypto.createHmac('sha256', RAZORPAY_KEY_SECRET);
    shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = shasum.digest('hex');

    if (digest !== razorpay_signature) {
      console.error('❌ Invalid payment signature');
      return NextResponse.json(
        { error: 'Invalid payment signature' },
        { status: 401 }
      );
    }

    console.log('✅ Payment signature verified:', razorpay_payment_id);

    // Payment verified successfully
    // Now enroll user in courses
    if (courseIds && courseIds.length > 0 && userEmail) {
      try {
        for (const courseId of courseIds) {
          await enrollUserInCourse(courseId, userEmail);
        }
        console.log('✅ User enrolled in all courses');
      } catch (enrollError) {
        console.error('Enrollment error:', enrollError);
        // Payment is verified, don't fail response
      }
    }

    return NextResponse.json({
      success: true,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      message: 'Payment verified successfully',
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: 'Payment verification failed' },
      { status: 500 }
    );
  }
}

async function enrollUserInCourse(courseId: number, userEmail: string) {
  try {
    // First, get the user ID from email
    const userParams = new URLSearchParams({
      wstoken: MOODLE_TOKEN,
      moodlewsrestformat: 'json',
      wsfunction: 'core_user_get_users',
      'criteria[0][key]': 'email',
      'criteria[0][value]': userEmail,
    });

    const userResponse = await fetch(`${MOODLE_URL}/webservice/rest/server.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: userParams,
    });

    const userData = await userResponse.json();

    if (!userData.users || userData.users.length === 0) {
      throw new Error(`User not found with email: ${userEmail}`);
    }

    const userId = userData.users[0].id;

    // Enroll user in course
    const enrollParams = new URLSearchParams({
      wstoken: MOODLE_TOKEN,
      moodlewsrestformat: 'json',
      wsfunction: 'enrol_manual_enrol_users',
      'enrolments[0][userid]': userId.toString(),
      'enrolments[0][courseid]': courseId.toString(),
      'enrolments[0][roleid]': '5', // Student role
    });

    const enrollResponse = await fetch(`${MOODLE_URL}/webservice/rest/server.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: enrollParams,
    });

    const enrollData = await enrollResponse.json();

    if (enrollData.exception) {
      console.error('Moodle enrollment error:', enrollData.message);
      throw new Error(enrollData.message);
    }

    console.log(`✅ User ${userEmail} enrolled in course ${courseId}`);
    return enrollData;
  } catch (error) {
    console.error(`Error enrolling user ${userEmail} in course ${courseId}:`, error);
    throw error;
  }
}
