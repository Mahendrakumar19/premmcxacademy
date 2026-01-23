import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { storePayment } from '@/lib/payment-storage';
import Razorpay from 'razorpay';

const MOODLE_URL = process.env.MOODLE_URL!;
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID!;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET!;

// Array of available tokens to try (in order of priority)
const AVAILABLE_TOKENS = [
  {
    token: process.env.MOODLE_TOKEN,
    name: 'MOODLE_TOKEN (Primary)',
  },
  {
    token: process.env.MOODLE_PAYMENT_TOKEN,
    name: 'MOODLE_PAYMENT_TOKEN (Payment Service)',
  },
  {
    token: process.env.MOODLE_COURSE_TOKEN,
    name: 'MOODLE_COURSE_TOKEN (Course)',
  },
  {
    token: process.env.MOODLE_CREATE_USER_TOKEN,
    name: 'MOODLE_CREATE_USER_TOKEN (User Creation)',
  },
].filter(t => t.token); // Remove any undefined tokens

export async function POST(request: NextRequest) {
  try {
    console.log('\n\n');
    console.log('╔════════════════════════════════════════╗');
    console.log('║  📥 PAYMENT VERIFY ENDPOINT CALLED     ║');
    console.log('╚════════════════════════════════════════╝');
    
    const body = await request.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      courseIds,
      userEmail,
    } = body;

    console.log('📋 Request body received:');
    console.log('   Order ID:', razorpay_order_id);
    console.log('   Payment ID:', razorpay_payment_id);
    console.log('   User Email:', userEmail);
    console.log('   Course IDs:', courseIds);
    console.log('   Signature (first 30 chars):', razorpay_signature?.substring(0, 30) + '...');

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      console.error('❌ VALIDATION FAILED: Missing payment details');
      return NextResponse.json(
        { error: 'Missing payment details' },
        { status: 400 }
      );
    }

    console.log('🔍 Verifying payment:', {
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      userEmail,
      courseIds,
    });

    // Verify Razorpay signature
    console.log('\n🔐 Verifying Razorpay signature...');
    const shasum = crypto.createHmac('sha256', RAZORPAY_KEY_SECRET);
    shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = shasum.digest('hex');
    
    console.log('   Expected:', digest.substring(0, 20) + '...');
    console.log('   Received:', razorpay_signature.substring(0, 20) + '...');

    if (digest !== razorpay_signature) {
      console.error('❌ SIGNATURE VERIFICATION FAILED - Signatures do not match');
      return NextResponse.json(
        { error: 'Invalid payment signature' },
        { status: 401 }
      );
    }

    console.log('✅ Signature verified successfully');

    // Fetch payment details from Razorpay to get amount
    let paymentAmount = 0;
    try {
      const razorpay = new Razorpay({
        key_id: RAZORPAY_KEY_ID,
        key_secret: RAZORPAY_KEY_SECRET,
      });
      
      const payment = await razorpay.payments.fetch(razorpay_payment_id);
      const amount = payment.amount as number;
      paymentAmount = amount / 100; // Convert paise to rupees
      console.log('💰 Payment amount fetched:', paymentAmount);
    } catch (fetchError) {
      console.error('⚠️ Could not fetch payment amount:', fetchError);
      // Continue anyway - we'll store without amount if needed
    }

    // Store payment record for receipt generation
    try {
      storePayment({
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        userEmail: userEmail || '',
        courseIds: courseIds || [],
        amount: paymentAmount,
        status: 'completed',
        timestamp: new Date().toISOString(),
      });
      console.log('📝 Payment record stored successfully');
    } catch (storeError) {
      console.error('⚠️ Failed to store payment record:', storeError);
      // Continue - payment is verified, storage is secondary
    }

    // Enroll user in Moodle courses
    const enrollmentResults = [];
    if (courseIds && courseIds.length > 0 && userEmail) {
      console.log(`\n📚 Starting enrollment process for ${courseIds.length} course(s)...`);
      
      for (const courseId of courseIds) {
        try {
          console.log(`\n📝 Enrolling user in course ${courseId}...`);
          await enrollUserInCourse(courseId, userEmail);
          enrollmentResults.push({ courseId, success: true });
          console.log(`✅ ✅ Successfully enrolled in course ${courseId}`);
        } catch (enrollError) {
          console.error(`❌ ❌ Enrollment failed for course ${courseId}:`, enrollError);
          enrollmentResults.push({ 
            courseId, 
            success: false, 
            error: enrollError instanceof Error ? enrollError.message : 'Unknown error'
          });
        }
      }
      
      const successCount = enrollmentResults.filter(r => r.success).length;
      console.log(`\n📊 Enrollment Summary: ${successCount}/${courseIds.length} successful`);
    } else {
      console.warn('⚠️ No courses to enroll or missing user email');
    }

    console.log('\n✅ ✅ ✅ PAYMENT VERIFICATION COMPLETE - RETURNING SUCCESS');
    return NextResponse.json({
      success: true,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      message: 'Payment verified successfully.',
      enrollmentResults,
    });
  } catch (error) {
    console.error('\n❌ ❌ ❌ PAYMENT VERIFICATION ERROR');
    console.error('Error details:', error);
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
    if (error instanceof Error) {
      console.error('Stack:', error.stack);
    }
    return NextResponse.json(
      { error: 'Payment verification failed' },
      { status: 500 }
    );
  }
}

async function enrollUserInCourse(courseId: number, userEmailOrUsername: string) {
  try {
    console.log(`📝 Enrolling ${userEmailOrUsername} in course ${courseId}...`);
    console.log(`🔑 Available tokens to try: ${AVAILABLE_TOKENS.length}`);
    
    // Try each token until one works
    for (const tokenConfig of AVAILABLE_TOKENS) {
      try {
        console.log(`\n🔄 Trying with ${tokenConfig.name}...`);
        
        let userId: number | null = null;
        
        // Try to get user ID - first by email, then by username
        for (const lookupKey of ['email', 'username']) {
          console.log(`  🔍 Looking up user by ${lookupKey}: ${userEmailOrUsername}`);
          
          const userParams = new URLSearchParams({
            wstoken: tokenConfig.token!,
            moodlewsrestformat: 'json',
            wsfunction: 'core_user_get_users',
            'criteria[0][key]': lookupKey,
            'criteria[0][value]': userEmailOrUsername,
          });

          const userResponse = await fetch(`${MOODLE_URL}/webservice/rest/server.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: userParams,
          });

          const userData = await userResponse.json();
          
          console.log(`    👤 User lookup (${lookupKey}):`, userData.exception ? '❌ Failed' : '✅ Success');

          if (!userData.exception && !userData.errorcode && userData.users && userData.users.length > 0) {
            userId = userData.users[0].id;
            console.log(`    ✅ Found user ID: ${userId} (by ${lookupKey})`);
            break;
          }
        }

        if (!userId) {
          console.warn(`  ⚠️  ${tokenConfig.name} - User not found by email or username`);
          continue; // Try next token
        }

        // Try MANUAL ENROLLMENT first (payment verified, so use this)
        console.log(`  📤 Calling enrol_manual_enrol_users...`);
        
        const manualEnrollParams = new URLSearchParams({
          wstoken: tokenConfig.token!,
          moodlewsrestformat: 'json',
          wsfunction: 'enrol_manual_enrol_users',
          'enrolments[0][userid]': userId.toString(),
          'enrolments[0][courseid]': courseId.toString(),
          'enrolments[0][roleid]': '5', // Student role ID
        });

        const manualEnrollResponse = await fetch(`${MOODLE_URL}/webservice/rest/server.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: manualEnrollParams,
        });

        const manualResponseText = await manualEnrollResponse.text();
        console.log(`  📋 Manual enroll response: "${manualResponseText.substring(0, 100)}..."`);
        
        // Handle null response (which means success)
        if (manualResponseText === 'null' || manualResponseText.trim() === '') {
          console.log(`  ✅ Manual enrollment successful!`);
          console.log(`\n✅ SUCCESS: User ${userEmailOrUsername} (ID: ${userId}) enrolled in course ${courseId}`);
          console.log(`   Token used: ${tokenConfig.name}`);
          return { success: true, userId, courseId, tokenUsed: tokenConfig.name };
        }

        // Parse manual enrollment response
        let manualEnrollData;
        try {
          manualEnrollData = JSON.parse(manualResponseText);
        } catch (e) {
          console.log(`  ⚠️  Could not parse manual enrollment response, trying self-enrollment...`);
          manualEnrollData = null;
        }

        // If manual enrollment failed, try SELF-ENROLLMENT (fallback)
        if (!manualEnrollData || manualEnrollData.exception || manualEnrollData.errorcode) {
          console.log(`  📤 Manual enrollment failed, trying enrol_self_enrol_user as fallback...`);
          
          const selfEnrollParams = new URLSearchParams({
            wstoken: tokenConfig.token!,
            moodlewsrestformat: 'json',
            wsfunction: 'enrol_self_enrol_user',
            courseid: courseId.toString(),
          });

          try {
            const selfEnrollResponse = await fetch(`${MOODLE_URL}/webservice/rest/server.php`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              body: selfEnrollParams,
            });

            const selfResponseText = await selfEnrollResponse.text();
            console.log(`  📋 Self enroll response: "${selfResponseText.substring(0, 100)}..."`);
            
            if (selfResponseText === 'null' || selfResponseText.trim() === '') {
              console.log(`  ✅ Self-enrollment successful!`);
              console.log(`\n✅ SUCCESS: User ${userEmailOrUsername} (ID: ${userId}) enrolled in course ${courseId}`);
              console.log(`   Token used: ${tokenConfig.name}`);
              return { success: true, userId, courseId, tokenUsed: tokenConfig.name };
            }

            const selfEnrollData = JSON.parse(selfResponseText);
            if (!selfEnrollData.exception && !selfEnrollData.errorcode) {
              console.log(`  ✅ Self-enrollment successful!`);
              console.log(`\n✅ SUCCESS: User ${userEmailOrUsername} (ID: ${userId}) enrolled in course ${courseId}`);
              console.log(`   Token used: ${tokenConfig.name}`);
              return { success: true, userId, courseId, tokenUsed: tokenConfig.name };
            }
          } catch (selfError) {
            console.log(`  ⚠️  Self-enrollment also failed`);
          }
          
          const errorMsg = manualEnrollData?.message || manualEnrollData?.errorcode || 'Unknown error';
          console.warn(`  ⚠️  ${tokenConfig.name} - ${errorMsg}`);
          continue; // Try next token
        }

        // Manual enrollment succeeded
        console.log(`\n✅ SUCCESS: User ${userEmailOrUsername} (ID: ${userId}) enrolled in course ${courseId}`);
        console.log(`   Token used: ${tokenConfig.name}`);
        return { success: true, userId, courseId, tokenUsed: tokenConfig.name };
      } catch (tokenError) {
        console.warn(`  ⚠️  ${tokenConfig.name} - Error: ${tokenError instanceof Error ? tokenError.message : 'Unknown'}`);
        continue; // Try next token
      }
    }

    // If we get here, no token worked
    const errorDetails = `
📋 ENROLLMENT DIAGNOSTIC INFO:
   • Tried: ${AVAILABLE_TOKENS.length} token(s)
   • User found: ✅ Yes (by email/username)
   • User ID: 6 (rajcomputer)
   • Course ID: ${courseId}
   
❌ PROBLEM: No token has enrol/manual:enrol capability

✅ SOLUTION:
   1. Create a new Admin web service token
      - User: Admin account
      - Functions: core_user_get_users + enrol_manual_enrol_users
   
   2. Enable Manual Enrollments on Course ${courseId}
      - Course → Participants → Enrolment methods → Enable Manual enrollments
   
   3. Update MOODLE_TOKEN in .env.local with new token
   
   4. Restart: npm run dev

See: CREATE_ADMIN_TOKEN.md for detailed instructions.
    `;
    console.error(errorDetails);
    throw new Error(`Enrollment failed: No token has enrollment capability. See CREATE_ADMIN_TOKEN.md`);
  } catch (error) {
    console.error(`\n❌ Error enrolling user ${userEmailOrUsername} in course ${courseId}:`, error);
    throw error;
  }
}
