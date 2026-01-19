import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import crypto from 'crypto';

const MOODLE_URL = process.env.MOODLE_URL!;
const MOODLE_TOKEN = process.env.MOODLE_TOKEN!;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET!;

export async function POST(request: NextRequest) {
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

    // Verify signature
    const shasum = crypto.createHmac('sha256', RAZORPAY_KEY_SECRET);
    shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = shasum.digest('hex');

    if (digest !== razorpay_signature) {
      return NextResponse.json(
        { error: 'Invalid payment signature' },
        { status: 401 }
      );
    }

    // Payment verified successfully
    // Store transaction details in your database
    // TODO: Add database transaction storage

    // Enroll user in courses via Moodle API
    if (courseIds && courseIds.length > 0) {
      try {
        for (const courseId of courseIds) {
          await enrollUserInCourse(courseId, userEmail);
        }
      } catch (enrollError) {
        console.error('Enrollment error:', enrollError);
        // Don't fail the response, payment is verified
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

    return enrollData;
  } catch (error) {
    console.error(`Error enrolling user ${userEmail} in course ${courseId}:`, error);
    throw error;
  }
}