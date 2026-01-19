/**
 * Moodle Payment Redirect Configuration Helper
 * 
 * This utility provides functions to:
 * 1. Check current Moodle configuration
 * 2. Update Moodle Fee plugin return URLs
 * 3. Test redirect flow
 */

import { callMoodleAPI } from './moodle-api';

export interface MoodlePluginSettings {
  name: string;
  version?: string;
  enabled: boolean;
  settings?: {
    [key: string]: string | number | boolean;
  };
}

export interface EnrolmentInstanceConfig {
  id: number;
  courseid: number;
  enrol: string;
  status: number;
  name?: string;
  customdata?: any;
}

/**
 * Get current Fee plugin configuration from Moodle
 */
export async function getMoodleFeePluginConfig(
  token?: string
): Promise<MoodlePluginSettings | null> {
  try {
    console.log('🔍 Checking Moodle Fee plugin configuration...');

    // Get all enrol plugins
    const plugins = await callMoodleAPI(
      'tool_installedplugins_list',
      { plugin: 'enrol_fee' },
      token
    );

    if (plugins && Array.isArray(plugins)) {
      const feePlugin = plugins.find(
        (p: any) => p.component === 'enrol_fee' || p.plugin === 'fee'
      );

      if (feePlugin) {
        console.log('✅ Fee plugin found:', feePlugin);
        return {
          name: 'Fee Enrolment',
          version: feePlugin.version,
          enabled: feePlugin.enabled !== '0',
          settings: feePlugin,
        };
      }
    }

    console.warn('⚠️ Fee plugin not found or disabled');
    return null;
  } catch (error) {
    console.error('❌ Error checking plugin config:', error);
    return null;
  }
}

/**
 * Check if a course has fee enrolment configured
 */
export async function checkCoursePaymentSetup(
  courseId: number,
  token?: string
): Promise<{
  configured: boolean;
  enabled: boolean;
  cost?: string;
  currency?: string;
  instanceId?: number;
  customdata?: any;
}> {
  try {
    console.log(`🔍 Checking payment setup for course ${courseId}...`);

    const instances = await callMoodleAPI(
      'core_enrol_get_course_enrolment_methods',
      { courseid: courseId },
      token
    );

    if (!Array.isArray(instances)) {
      return { configured: false, enabled: false };
    }

    const feeInstance = instances.find(
      (i: any) => i.enrol === 'fee' || i.type === 'fee'
    );

    if (!feeInstance) {
      console.warn(`⚠️ No fee enrolment configured for course ${courseId}`);
      return { configured: false, enabled: false };
    }

    const config = {
      configured: true,
      enabled: feeInstance.status === 0,
      cost: feeInstance.cost || '0',
      currency: feeInstance.currency || 'INR',
      instanceId: feeInstance.id || feeInstance.instance,
      customdata: feeInstance.customdata,
    };

    console.log(`✅ Payment configured for course ${courseId}:`, config);
    return config;
  } catch (error) {
    console.error(`❌ Error checking payment setup:`, error);
    return { configured: false, enabled: false };
  }
}

/**
 * Get all courses that have payment configured
 */
export async function getCoursesWithPaymentSetup(
  courseIds: number[],
  token?: string
): Promise<
  Array<{
    courseId: number;
    configured: boolean;
    cost?: string;
    currency?: string;
  }>
> {
  try {
    console.log(`🔍 Checking payment setup for ${courseIds.length} courses...`);

    const results = await Promise.all(
      courseIds.map((courseId) => checkCoursePaymentSetup(courseId, token))
    );

    return courseIds.map((courseId, index) => ({
      courseId,
      ...results[index],
    }));
  } catch (error) {
    console.error('❌ Error checking courses:', error);
    return [];
  }
}

/**
 * Generate Moodle return URL for a course
 */
export function generateMoodleReturnUrl(
  courseId: number,
  context: 'success' | 'cancel' = 'success'
): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const path =
    context === 'success'
      ? '/api/payment-success'
      : '/api/payment-failed';

  return `${baseUrl}${path}?courseId=${courseId}&status=${context === 'success' ? 'complete' : 'failed'}`;
}

/**
 * Provide setup instructions for Moodle admin
 */
export function getSetupInstructions(
  returnUrl: string,
  courseId?: number
): string {
  return `
╔════════════════════════════════════════════════════════════════╗
║     Moodle Fee Plugin Return URL Configuration                 ║
╚════════════════════════════════════════════════════════════════╝

STEP 1: Access Moodle Admin Panel
  1. Login to Moodle as Administrator
  2. Navigate to: Administration → Plugins → Enrolment
  3. Click "Manage enrol plugins"
  4. Find "Fee" plugin and click its settings/gear icon

STEP 2: Configure Return URL
  In the "Fee" plugin settings page, look for:
  - "Course Return URL" 
  - "Return URL"
  - "Success URL"
  
  Set the value to:
  ${returnUrl}

STEP 3: Supported Placeholders
  {courseid}      - Current course ID
  {userid}        - Current user ID
  {coursename}    - Course full name
  {transactionid} - Transaction ID (if available)
  {paymentid}     - Payment ID (Razorpay only)

STEP 4: Example with Placeholders
  ${returnUrl}?courseId={courseid}&userId={userid}&status=complete

STEP 5: Save & Test
  1. Click "Save Changes"
  2. Select a paid course: /course/view.php?id=${courseId || 2}
  3. Click "Enrol Me"
  4. Complete the payment (use test card if available)
  5. You should be redirected to:
     ${returnUrl}

STEP 6: Verify Setup
  - Check if user was enrolled in course
  - Check if browser redirected back to LMS
  - Check server logs for payment-success handler
  - Check Moodle logs for enrolment records

TROUBLESHOOTING:
  ✓ If not redirecting, check Moodle version (3.11+)
  ✓ Verify Fee plugin is enabled in Admin → Plugins
  ✓ Check Moodle logs for errors: Admin → Reports → Logs
  ✓ Test URL manually: ${returnUrl}?courseId=2

QUESTIONS?
  - Check: PAYMENT_REDIRECT_GUIDE.md
  - Enable debugging: Admin → Development → Debug messages
  - Check Moodle Razorpay plugin documentation
`;
}

/**
 * Validate redirect URL format
 */
export function validateRedirectUrl(url: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check HTTPS for production
  if (
    process.env.NODE_ENV === 'production' &&
    !url.startsWith('https://')
  ) {
    errors.push(
      'Production URLs must use HTTPS. Update your return URL to use https://'
    );
  }

  // Check for required path
  if (!url.includes('/api/payment-')) {
    errors.push(
      'Return URL should include /api/payment-success or /api/payment-failed path'
    );
  }

  // Check for courseId parameter
  if (!url.includes('{courseid}') && !url.includes('courseId=')) {
    errors.push(
      'Return URL should include course ID parameter: {courseid} or courseId=...'
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Generate a test payment redirect
 */
export function generateTestPaymentRedirect(
  courseId: number,
  userId: number,
  status: 'complete' | 'failed' = 'complete'
): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${baseUrl}/api/payment-success?courseId=${courseId}&userId=${userId}&status=${status}&transactionId=TEST_${Date.now()}`;
}

/**
 * Create a summary of current payment redirect setup
 */
export async function generatePaymentSetupSummary(
  courseIds: number[],
  token?: string
): Promise<string> {
  const results = await getCoursesWithPaymentSetup(courseIds, token);

  let summary = `
╔════════════════════════════════════════════════════════════════╗
║        Payment Setup Summary                                   ║
╚════════════════════════════════════════════════════════════════╝

Your LMS URL: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}
Payment Success Handler: /api/payment-success

COURSE PAYMENT STATUS:
`;

  results.forEach((result) => {
    const status = result.configured ? '✅' : '❌';
    const info =
      result.configured ?
      `(${result.currency} ${result.cost})` :
      '(Not configured)';
    summary += `\n  ${status} Course ${result.courseId} ${info}`;
  });

  const configuredCount = results.filter((r) => r.configured).length;
  summary += `\n\nConfigured Courses: ${configuredCount}/${results.length}\n`;

  if (configuredCount === 0) {
    summary += `
⚠️  NO COURSES CONFIGURED FOR PAYMENT!

ACTION REQUIRED:
1. Go to each course
2. Enable "Fee" enrolment method
3. Set course cost in Settings → Enrolment Fee
4. Configure Razorpay payment gateway in Moodle

See PAYMENT_REDIRECT_GUIDE.md for complete setup instructions.
`;
  } else {
    summary += `
✅ PAYMENT SETUP CONFIGURED

Next Steps:
1. Add return URL to Moodle Fee plugin settings:
   ${generateMoodleReturnUrl(courseIds[0])}

2. Test payment flow in each course

3. Monitor /api/payment-success endpoint for redirects
`;
  }

  return summary;
}

/**
 * CLI helper - can be used as npm script
 */
export async function runPaymentSetupDiagnostics(
  courseIds: number[] = [2, 3, 4],
  token?: string
): Promise<void> {
  console.log('🔍 Running Payment Setup Diagnostics...\n');

  try {
    // Check plugin config
    const pluginConfig = await getMoodleFeePluginConfig(token);
    if (pluginConfig) {
      console.log('✅ Fee plugin is installed and enabled\n');
    } else {
      console.log('⚠️  Fee plugin not found or disabled\n');
    }

    // Check course configurations
    const courseSetup = await generatePaymentSetupSummary(courseIds, token);
    console.log(courseSetup);

    // Generate setup instructions
    const instructions = getSetupInstructions(
      generateMoodleReturnUrl(courseIds[0]),
      courseIds[0]
    );
    console.log('\n' + instructions);
  } catch (error) {
    console.error('❌ Diagnostics failed:', error);
  }
}
