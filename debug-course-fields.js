#!/usr/bin/env node

const MOODLE_URL = 'https://lms.premmcxtrainingacademy.com';
const MOODLE_TOKEN = process.env.MOODLE_TOKEN || '67a9120b2faf13be6ec9cb28453eaafb';

console.log('🔍 Starting detailed course field inspection...');
console.log('📍 Target:', MOODLE_URL);
console.log('-------------------------------------------\n');

(async () => {
  try {
    // Fetch courses with extra parameters to get all available fields
    const urlParams = new URLSearchParams({
      wstoken: MOODLE_TOKEN,
      wsfunction: 'core_course_get_courses',
      moodlewsrestformat: 'json',
    });

    console.log('📡 Fetching all courses with detailed field inspection...\n');
    const response = await fetch(
      `${MOODLE_URL}/webservice/rest/server.php?${urlParams}`,
      { method: 'POST' }
    );

    const courses = await response.json();

    if (courses.exception || courses.errorcode) {
      console.error('❌ API Error:', courses);
      return;
    }

    if (!Array.isArray(courses)) {
      console.error('❌ Did not receive array:', typeof courses);
      return;
    }

    // Filter out site course
    const realCourses = courses.filter(c => c.format !== 'site' && c.id !== 1);

    console.log(`📊 Found ${realCourses.length} real courses\n`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    realCourses.forEach((course, idx) => {
      console.log(`\n📖 Course ${idx + 1}: ${course.fullname} (ID: ${course.id})\n`);
      console.log('ALL AVAILABLE FIELDS:');
      console.log('─────────────────────');

      Object.entries(course).forEach(([key, value]) => {
        let displayValue = value;
        
        // Truncate long values
        if (typeof value === 'string' && value.length > 100) {
          displayValue = value.substring(0, 100) + '...';
        } else if (typeof value === 'object' && value !== null) {
          displayValue = JSON.stringify(value).substring(0, 100) + (JSON.stringify(value).length > 100 ? '...' : '');
        }

        console.log(`  • ${key}: ${displayValue}`);
      });

      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    });

    console.log('\n\n🎯 SUMMARY - Image-Related Fields Found:\n');
    console.log('─────────────────────────────────────\n');

    realCourses.forEach((course) => {
      console.log(`${course.fullname}:`);
      console.log(`  • courseimage: ${course.courseimage || '(none)'}`);
      console.log(`  • imageurl: ${course.imageurl || '(none)'}`);
      console.log(`  • overviewfiles: ${course.overviewfiles?.length || 0} files`);
      if (course.overviewfiles && course.overviewfiles.length > 0) {
        course.overviewfiles.forEach(f => console.log(`    - ${f.filename}: ${f.url}`));
      }
      console.log();
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
})();
