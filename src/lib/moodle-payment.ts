/**
 * Moodle Payment Gateway Integration
 * 
 * This module integrates with Moodle's payment gateway system,
 * specifically configured to work with the Razorpay payment gateway plugin.
 */

import { callMoodle } from './moodle';
import type { MoodleEnrolmentInstance } from '@/types/moodle';
import crypto from 'crypto';

/**
 * Get payment information for a course
 * This fetches the fee enrolment method configuration from Moodle
 */
export async function getCoursePaymentInfo(
  courseid: number,
  token?: string
): Promise<{ cost: string; currency: string } | null> {
  try {
    const enrolments = await callMoodle<MoodleEnrolmentInstance[]>(
      'core_enrol_get_course_enrolment_methods',
      { courseid },
      token
    );

    // Debug: log all enrolment methods returned to a file
    try {
      const fs = await import('fs');
      const path = await import('path');
      const logPath = path.resolve(process.cwd(), 'moodle-enrolments.log');
      const logEntry = `Enrolment methods for course ${courseid}: ${JSON.stringify(enrolments, null, 2)}\n`;
      fs.appendFileSync(logPath, logEntry, 'utf8');
    } catch (logErr) {
      console.error('Failed to write enrolment log:', logErr);
    }

    // Find the fee enrolment method with payment gateway
    const feeEnrolment = enrolments.find(
      (enrol) => enrol.enrol === 'fee' && enrol.status === 0 && enrol.cost
    );

    if (feeEnrolment && feeEnrolment.cost) {
      return {
        cost: feeEnrolment.cost,
        currency: feeEnrolment.currency || 'INR',
      };
    }

    return null;
  } catch (error) {
    console.error(`Error fetching payment info for course ${courseid}:`, error);
    return null;
  }
}

/**
 * Get payment accounts configured in Moodle
 */
export async function getPaymentAccounts(token?: string) {
  try {
    return await callMoodle<unknown>(
      'core_payment_get_available_gateways',
      {},
      token
    );
  } catch (error) {
    console.error('Error fetching payment accounts:', error);
    return [];
  }
}

/**
 * Process enrollment after successful payment via Moodle
 * This uses Moodle's enrolment API
 */
export async function processEnrollmentWithPayment(
  userid: number,
  courseid: number,
  paymentId: string,
  orderId: string,
  token?: string
): Promise<boolean> {
  try {
    // Enroll the user using Moodle's manual enrolment
    await callMoodle(
      'enrol_manual_enrol_users',
      {
        enrolments: [
          {
            roleid: 5, // Student role
            userid: userid,
            courseid: courseid,
          },
        ],
      },
      token
    );

    // Log the payment transaction (you may want to store this in Moodle's payment tables)
    console.log('Payment processed successfully:', {
      userid,
      courseid,
      paymentId,
      orderId,
      timestamp: new Date().toISOString(),
    });

    return true;
  } catch (error) {
    console.error('Error processing enrollment with payment:', error);
    return false;
  }
}

/**
 * Check if a course requires payment
 */
export async function courseRequiresPayment(
  courseid: number,
  token?: string
): Promise<boolean> {
  const paymentInfo = await getCoursePaymentInfo(courseid, token);
  return paymentInfo !== null && parseFloat(paymentInfo.cost) > 0;
}

/**
 * Get all courses with their payment information
 */
export async function getCoursesWithPaymentInfo(
  token?: string
): Promise<Array<{
  id: number;
  fullname: string;
  shortname: string;
  summary?: string;
  fee?: string;
  cost?: string;
  currency?: string;
  requiresPayment: boolean;
}>> {
  try {
    interface MoodleCourse {
      id: number;
      fullname: string;
      shortname: string;
      summary?: string;
      // Add other fields as needed based on Moodle's course object
    }

    const courses = await callMoodle<MoodleCourse[]>(
      'core_course_get_courses',
      {},
      token
    );

    const coursesWithPayment = await Promise.all(
      courses.map(async (course) => {
        const paymentInfo = await getCoursePaymentInfo(course.id, token);
        
        return {
          ...course,
          cost: paymentInfo?.cost,
          currency: paymentInfo?.currency,
          requiresPayment: paymentInfo !== null && parseFloat(paymentInfo.cost || '0') > 0,
        };
      })
    );

    return coursesWithPayment;
  } catch (error) {
    console.error('Error fetching courses with payment info:', error);
    throw error;
  }
}

/**
 * Validate Razorpay payment signature
 */
export function validateRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string,
  secret: string
): boolean {
  const generatedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
  
  return generatedSignature === signature;
}
