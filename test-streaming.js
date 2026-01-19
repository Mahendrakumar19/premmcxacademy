// Copy this code into your browser console (F12) to test secure streaming

// ========================================
// TEST 1: Check if you're logged in
// ========================================
console.log('🔍 TEST 1: Checking session...');
fetch('/api/auth/session')
  .then(r => r.json())
  .then(data => {
    if (data.user) {
      console.log('✅ Logged in as:', data.user.email);
      console.log('   User ID:', data.user.id);
      console.log('   Has Moodle token:', !!data.user.token);
    } else {
      console.log('❌ Not logged in. Please login at /auth/login');
    }
  });

// ========================================
// TEST 2: Check enrollment in a course
// ========================================
const COURSE_ID = 2; // Change this to your course ID
console.log(`\n🔍 TEST 2: Checking enrollment in course ${COURSE_ID}...`);
fetch(`/api/courses/check-enrollment?courseId=${COURSE_ID}`, {
  credentials: 'include'
})
  .then(r => r.json())
  .then(data => {
    console.log(`✅ Enrolled in course ${COURSE_ID}:`, data.enrolled);
    if (data.courses) {
      console.log('   Your enrolled courses:', data.courses.map(c => `${c.id}: ${c.fullname}`));
    }
  })
  .catch(err => console.error('❌ Enrollment check failed:', err));

// ========================================
// TEST 3: Request video streaming token
// ========================================
const MODULE_ID = 10; // Change this to your video module ID
console.log(`\n🔍 TEST 3: Requesting streaming token...`);
console.log(`   Course ID: ${COURSE_ID}, Module ID: ${MODULE_ID}`);

setTimeout(() => {
  fetch(`/api/secure-streaming/token?courseId=${COURSE_ID}&moduleId=${MODULE_ID}`, {
    credentials: 'include'
  })
    .then(r => r.json())
    .then(data => {
      if (data.error) {
        console.error('❌ Token request failed:', data.error);
        console.log('\n💡 Common issues:');
        console.log('   - Not logged in → Go to /auth/login');
        console.log('   - Not enrolled → Enroll in the course first');
        console.log('   - Missing JWT_SECRET → Set it in .env.local');
      } else {
        console.log('✅ Token received successfully!');
        console.log('   Token type:', data.token_type);
        console.log('   Expires in:', data.expires_in, 'seconds (', Math.round(data.expires_in/60), 'minutes)');
        console.log('   Course ID:', data.courseId);
        console.log('   Module ID:', data.moduleId);
        console.log('   Token (first 50 chars):', data.token.substring(0, 50) + '...');
        
        // TEST 4: Build streaming URL
        console.log('\n🔍 TEST 4: Building streaming URL...');
        const streamUrl = `/api/secure-streaming/stream?token=${data.token}&type=master&file=master.m3u8&courseId=${data.courseId}&moduleId=${data.moduleId}`;
        console.log('✅ Streaming URL created:');
        console.log('   ', window.location.origin + streamUrl);
        console.log('\n💡 You can test this URL in a video player or open in a new tab');
      }
    })
    .catch(err => console.error('❌ Token request error:', err));
}, 2000);

console.log('\n⏳ Running tests... (wait 2 seconds)\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
