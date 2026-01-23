#!/usr/bin/env node

/**
 * Debug script to fetch ALL course images directly from Moodle server
 * This queries lms.premmcxtrainingacademy.com and logs all course image URLs
 */

const https = require('https');
const querystring = require('querystring');

const MOODLE_URL = 'https://lms.premmcxtrainingacademy.com';
const MOODLE_TOKEN = process.env.MOODLE_TOKEN || '67a9120b2faf13be6ec9cb28453eaafb'; // Using token from your Moodle

console.log('🔍 Starting Moodle Course Image Debug...');
console.log(`📍 Target: ${MOODLE_URL}`);
console.log(`🔑 Token: ${MOODLE_TOKEN.substring(0, 10)}...`);
console.log('-------------------------------------------\n');

// Make a request to Moodle API
function callMoodleAPI(wsfunction, params = {}) {
  return new Promise((resolve, reject) => {
    const queryParams = {
      wstoken: MOODLE_TOKEN,
      wsfunction: wsfunction,
      moodlewsrestformat: 'json',
      ...params
    };

    const url = `${MOODLE_URL}/webservice/rest/server.php?${querystring.stringify(queryParams)}`;
    
    console.log(`\n📡 Calling: ${wsfunction}`);
    console.log(`📝 Params:`, Object.keys(params));

    https.get(url, { timeout: 60000 }, (res) => {
      let data = '';
      
      res.on('data', chunk => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result);
        } catch (err) {
          reject(`Failed to parse JSON: ${err.message}`);
        }
      });
    }).on('error', reject).on('timeout', function() {
      this.destroy();
      reject('Request timeout');
    });
  });
}

// Main function
async function debugCourseImages() {
  try {
    console.log('⏳ Step 1: Fetching all courses...\n');
    const courses = await callMoodleAPI('core_course_get_courses');

    if (courses.exception || courses.errorcode) {
      console.error('❌ API Error:', courses);
      return;
    }

    if (!Array.isArray(courses)) {
      console.error('❌ Expected array, got:', typeof courses);
      return;
    }

    console.log(`✅ Retrieved ${courses.length} courses\n`);

    // Filter out site course
    const filteredCourses = courses.filter(c => c.format !== 'site' && c.id !== 1);
    console.log(`📚 Filtered courses (removed site): ${filteredCourses.length}\n`);

    // Print each course
    console.log('📋 COURSE LIST:');
    console.log('━'.repeat(80));
    filteredCourses.forEach((course, idx) => {
      console.log(`\n${idx + 1}. ${course.fullname} (ID: ${course.id})`);
      console.log(`   - Short name: ${course.shortname}`);
      console.log(`   - Category: ${course.categoryname || 'N/A'}`);
      console.log(`   - Has overviewfiles: ${!!course.overviewfiles}`);
      if (course.overviewfiles && course.overviewfiles.length > 0) {
        console.log(`   - Overview files:`, course.overviewfiles);
      }
    });

    console.log('\n━'.repeat(80));
    console.log('\n⏳ Step 2: Fetching course overview files for each course...\n');

    // Fetch overview files for ALL courses at once
    const courseIds = filteredCourses.map(c => c.id);
    const overviewParams = {};
    courseIds.forEach((id, idx) => {
      overviewParams[`courseids[${idx}]`] = id;
    });

    console.log(`📡 Requesting overview files for courses: ${courseIds.join(', ')}`);
    const overviewFilesResponse = await callMoodleAPI('core_course_get_overview_files', overviewParams);

    console.log('\n✅ Overview Files Response:');
    console.log(JSON.stringify(overviewFilesResponse, null, 2));

    console.log('\n━'.repeat(80));
    console.log('\n🖼️ COURSE IMAGES SUMMARY:');
    console.log('━'.repeat(80));

    if (Array.isArray(overviewFilesResponse)) {
      overviewFilesResponse.forEach((courseData) => {
        const course = filteredCourses.find(c => c.id === courseData.id);
        if (course) {
          console.log(`\n📖 ${course.fullname} (ID: ${courseData.id})`);
          if (courseData.files && courseData.files.length > 0) {
            courseData.files.forEach((file, idx) => {
              console.log(`   📸 Image ${idx + 1}:`);
              console.log(`      - Filename: ${file.filename}`);
              console.log(`      - URL: ${file.fileurl}`);
            });
          } else {
            console.log(`   ❌ No images found`);
          }
        }
      });
    }

    console.log('\n━'.repeat(80));
    console.log('\n✅ Debug complete!\n');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run the debug
debugCourseImages().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
