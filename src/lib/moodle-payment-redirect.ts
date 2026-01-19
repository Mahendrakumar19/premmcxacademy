/**
 * Moodle Payment Redirect Handler
 * Forces users back to the LMS after payment completion in Moodle
 * 
 * Three implementation strategies:
 * 1. Customize Moodle Enrol Fee Plugin - Return URL configuration
 * 2. Inject JavaScript redirect on Moodle success page
 * 3. Use Moodle callback API endpoints
 */

import { callMoodleAPI } from './moodle-api';

/**
 * STRATEGY 1: Configure Return URL in Moodle Enrol Fee Plugin
 * 
 * In Moodle Admin:
 * 1. Go to: Administration > Plugins > Enrolment > Manage enrol plugins > Fee
 * 2. In "Course Return URL" field, add:
 *    https://your-lms.com/api/payment-success?courseId={courseid}&userId={userid}
 * 
 * This redirects users back to your site immediately after payment
 */
export const MOODLE_PAYMENT_REDIRECT_CONFIG = {
  // Add this to Moodle Fee plugin settings
  returnUrlTemplate: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/payment-success?courseId={courseid}&userId={userid}`,
  
  // Alternative with more parameters
  returnUrlFull: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/payment-success?courseId={courseid}&userId={userid}&transactionId={transactionid}`,
};

/**
 * STRATEGY 2: Update Moodle Enrolment Fee Instance with Custom Return URL
 * 
 * This updates the enrolment instance configuration in Moodle
 * Requires admin token with course:enrol capability
 */
export async function updateEnrolmentReturnUrl(
  courseId: number,
  returnUrl: string,
  adminToken?: string
): Promise<boolean> {
  try {
    console.log(`🔄 Updating enrolment return URL for course ${courseId}...`);
    console.log(`📍 Return URL: ${returnUrl}`);

    // Get current enrolment instances
    const instances = await callMoodleAPI(
      'core_enrol_get_course_enrolment_methods',
      { courseid: courseId },
      adminToken
    );

    if (!Array.isArray(instances)) {
      console.error('❌ No enrolment methods found');
      return false;
    }

    // Find fee enrolment instance
    const feeInstance = instances.find((i: any) => i.enrol === 'fee');
    if (!feeInstance) {
      console.error('❌ Fee enrolment not configured for this course');
      return false;
    }

    // Update the instance with custom data containing return URL
    const customData = {
      ...(feeInstance.customdata ? JSON.parse(feeInstance.customdata) : {}),
      returnurl: returnUrl,
    };

    const result = await callMoodleAPI(
      'core_enrol_update_enrolment_instance',
      {
        id: feeInstance.id,
        customdata: JSON.stringify(customData),
        courseid: courseId,
        enrol: 'fee',
      },
      adminToken
    );

    console.log('✅ Return URL updated successfully');
    return true;
  } catch (error) {
    console.error('❌ Error updating return URL:', error);
    return false;
  }
}

/**
 * STRATEGY 3: Generate Moodle Payment Success Redirect URL
 * 
 * Use this when building the Moodle payment URL from your app
 */
export function generateMoodlePaymentRedirectUrl(
  courseId: number,
  userId: number,
  moodleUrl: string = process.env.MOODLE_URL || 'http://localhost'
): string {
  // Moodle payment success typically redirects to:
  // /course/view.php?id={courseid}
  // Or to custom return URL if configured
  
  const cleanMoodleUrl = moodleUrl.replace(/\/$/, '');
  const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/payment-success`;
  
  return `${cleanMoodleUrl}/enrol/fee/returnurl.php?courseid=${courseId}&userid=${userId}&returnurl=${encodeURIComponent(returnUrl)}`;
}

/**
 * STRATEGY 2: Generate JavaScript Redirect Code for Moodle Page Injection
 * 
 * This code can be injected into Moodle's footer to force redirect
 * Place in: Appearance > Additional HTML > Footer
 */
export function generateMoodleRedirectJavaScript(
  lmsUrl: string = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
): string {
  return `
    <script>
      // Moodle Payment Redirect Handler
      (function() {
        // Check if payment success page
        const urlParams = new URLSearchParams(window.location.search);
        const courseId = urlParams.get('id') || urlParams.get('courseid');
        
        // Detect payment success page patterns
        const isPaymentSuccess = 
          window.location.pathname.includes('/enrol/') ||
          window.location.pathname.includes('/payment/') ||
          document.body.textContent.includes('successfully enrolled');
        
        if (isPaymentSuccess && courseId) {
          console.log('🔄 Redirecting back to LMS after payment...');
          
          // Get user ID from page if available
          const userIdElement = document.querySelector('[data-user-id]');
          const userId = userIdElement?.dataset.userId || 'current';
          
          // Redirect after 2 seconds to allow Moodle to process
          setTimeout(() => {
            window.location.href = '${lmsUrl}/payment-success?courseId=' + courseId + '&userId=' + userId;
          }, 2000);
        }
      })();
    </script>
  `;
}

/**
 * STRATEGY 3: Moodle Payment Callback Webhook Handler
 * 
 * Moodle can send payment notifications to your server
 * Configure in: Administration > Plugins > Payment gateways > Razorpay > Webhook
 */
export async function handleMoodlePaymentCallback(
  paymentData: {
    paymentId: string;
    courseId: number;
    userId: number;
    amount: number;
    currency: string;
    status: 'complete' | 'failed' | 'pending';
    timestamp: number;
  }
): Promise<{ success: boolean; redirectUrl: string }> {
  try {
    console.log('📦 Moodle payment callback received:', paymentData);

    if (paymentData.status === 'complete') {
      const lmsUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const redirectUrl = `${lmsUrl}/my-courses?enrolled=true&courseId=${paymentData.courseId}`;
      
      console.log('✅ Payment successful, redirecting to:', redirectUrl);
      return { success: true, redirectUrl };
    } else {
      const lmsUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const redirectUrl = `${lmsUrl}/cart?payment=failed&courseId=${paymentData.courseId}`;
      
      console.log('❌ Payment failed, redirecting to:', redirectUrl);
      return { success: false, redirectUrl };
    }
  } catch (error) {
    console.error('❌ Error handling payment callback:', error);
    throw error;
  }
}

/**
 * Get recommended return URL based on context
 */
export function getRecommendedReturnUrl(
  courseId: number,
  context: 'success' | 'cancel' = 'success'
): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  if (context === 'success') {
    return `${baseUrl}/my-courses?enrolled=true&courseId=${courseId}`;
  } else {
    return `${baseUrl}/cart?payment=failed&courseId=${courseId}`;
  }
}

/**
 * Extract Moodle payment parameters from URL
 */
export function extractMoodlePaymentParams(searchParams: URLSearchParams) {
  return {
    courseId: searchParams.get('id') || searchParams.get('courseid'),
    userId: searchParams.get('userid'),
    paymentId: searchParams.get('paymentid'),
    sessionId: searchParams.get('sesskey'),
    status: searchParams.get('status') || 'unknown',
    transactionId: searchParams.get('transactionid'),
  };
}
