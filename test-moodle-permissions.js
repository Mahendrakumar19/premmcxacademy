/**
 * Test Script: Verify Moodle Token Permissions
 * 
 * This script tests if your MOODLE_TOKEN has the necessary permissions
 * to enroll users in courses after payment.
 * 
 * Run: node test-moodle-permissions.js
 */

require('dotenv').config({ path: '.env.local' });

const MOODLE_URL = process.env.MOODLE_URL;
const MOODLE_TOKEN = process.env.MOODLE_TOKEN;

// Test email (use an actual registered user in your Moodle)
const TEST_EMAIL = 'test@example.com'; // CHANGE THIS to a real user email
const TEST_COURSE_ID = 1; // CHANGE THIS to a real course ID

async function testMoodlePermissions() {
  console.log('🧪 Testing Moodle Token Permissions...\n');
  console.log('📍 Moodle URL:', MOODLE_URL);
  console.log('🔑 Token:', MOODLE_TOKEN ? '✅ Found' : '❌ Missing');
  console.log('');

  if (!MOODLE_URL || !MOODLE_TOKEN) {
    console.error('❌ Missing MOODLE_URL or MOODLE_TOKEN in .env.local');
    process.exit(1);
  }

  // Test 1: Check if token is valid
  console.log('Test 1: Checking token validity...');
  try {
    const testParams = new URLSearchParams({
      wstoken: MOODLE_TOKEN,
      moodlewsrestformat: 'json',
      wsfunction: 'core_webservice_get_site_info',
    });

    const response = await fetch(`${MOODLE_URL}/webservice/rest/server.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: testParams,
    });

    const data = await response.json();

    if (data.exception || data.errorcode) {
      console.error('❌ Token is invalid or expired');
      console.error('Error:', data.message || data.errorcode);
      process.exit(1);
    }

    console.log('✅ Token is valid');
    console.log('   Site:', data.sitename);
    console.log('   User:', data.username, `(${data.firstname} ${data.lastname})`);
    console.log('   Functions:', data.functions ? `${data.functions.length} available` : 'Unknown');
    console.log('');
  } catch (error) {
    console.error('❌ Failed to connect to Moodle:', error.message);
    process.exit(1);
  }

  // Test 2: Check if user lookup works
  console.log('Test 2: Testing user lookup by email...');
  console.log(`   Searching for: ${TEST_EMAIL}`);
  try {
    const userParams = new URLSearchParams({
      wstoken: MOODLE_TOKEN,
      moodlewsrestformat: 'json',
      wsfunction: 'core_user_get_users',
      'criteria[0][key]': 'email',
      'criteria[0][value]': TEST_EMAIL,
    });

    const response = await fetch(`${MOODLE_URL}/webservice/rest/server.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: userParams,
    });

    const data = await response.json();

    if (data.exception || data.errorcode) {
      console.error('❌ User lookup failed');
      console.error('   Error:', data.message || data.errorcode);
      console.error('   This function may not be enabled for your token');
      process.exit(1);
    }

    if (!data.users || data.users.length === 0) {
      console.warn('⚠️  User lookup succeeded but no user found with email:', TEST_EMAIL);
      console.warn('   Please update TEST_EMAIL with a real user email');
      console.log('');
    } else {
      console.log('✅ User lookup works');
      console.log('   Found:', data.users[0].fullname, `(ID: ${data.users[0].id})`);
      console.log('');
    }
  } catch (error) {
    console.error('❌ User lookup failed:', error.message);
    process.exit(1);
  }

  // Test 3: Check if manual enrollment function is available
  console.log('Test 3: Testing manual enrollment capability...');
  console.log(`   Attempting to enroll user in course ${TEST_COURSE_ID}`);
  
  try {
    // First get user ID
    const userParams = new URLSearchParams({
      wstoken: MOODLE_TOKEN,
      moodlewsrestformat: 'json',
      wsfunction: 'core_user_get_users',
      'criteria[0][key]': 'email',
      'criteria[0][value]': TEST_EMAIL,
    });

    const userResponse = await fetch(`${MOODLE_URL}/webservice/rest/server.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: userParams,
    });

    const userData = await userResponse.json();

    if (!userData.users || userData.users.length === 0) {
      console.warn('⚠️  Skipping enrollment test (no user found)');
      console.log('');
      console.log('📋 Summary:');
      console.log('   ✅ Token is valid');
      console.log('   ✅ User lookup works');
      console.log('   ⚠️  Enrollment test skipped (update TEST_EMAIL and TEST_COURSE_ID)');
      return;
    }

    const userId = userData.users[0].id;

    // Try to enroll
    const enrollParams = new URLSearchParams({
      wstoken: MOODLE_TOKEN,
      moodlewsrestformat: 'json',
      wsfunction: 'enrol_manual_enrol_users',
      'enrolments[0][userid]': userId.toString(),
      'enrolments[0][courseid]': TEST_COURSE_ID.toString(),
      'enrolments[0][roleid]': '5', // Student role
    });

    const enrollResponse = await fetch(`${MOODLE_URL}/webservice/rest/server.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: enrollParams,
    });

    const enrollData = await enrollResponse.json();

    if (enrollData.exception || enrollData.errorcode) {
      if (enrollData.errorcode === 'wsaccessuserdeleted' || 
          enrollData.message?.includes('already enrolled')) {
        console.log('✅ Enrollment API is accessible');
        console.log('   Note: User may already be enrolled');
        console.log('');
      } else {
        console.error('❌ Enrollment failed');
        console.error('   Error:', enrollData.message || enrollData.errorcode);
        console.error('   Debug:', enrollData.debuginfo || 'No details');
        console.log('');
        console.log('💡 Possible issues:');
        console.log('   1. Token does not have enrol/manual:enrol capability');
        console.log('   2. Manual enrollment plugin is not enabled on this course');
        console.log('   3. Course ID is invalid');
        console.log('   4. User is already enrolled');
        process.exit(1);
      }
    } else {
      console.log('✅ Manual enrollment works!');
      console.log('   User', userId, 'enrolled in course', TEST_COURSE_ID);
      console.log('');
    }
  } catch (error) {
    console.error('❌ Enrollment test failed:', error.message);
    process.exit(1);
  }

  console.log('');
  console.log('🎉 All tests passed!');
  console.log('');
  console.log('✅ Your Moodle token has all required permissions:');
  console.log('   • Valid token');
  console.log('   • User lookup (core_user_get_users)');
  console.log('   • Manual enrollment (enrol_manual_enrol_users)');
  console.log('');
  console.log('✅ Payment enrollment flow should work correctly!');
}

// Run tests
testMoodlePermissions().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
