#!/usr/bin/env node

/**
 * Debug script to fetch and display all course image URLs from the API
 * Run: node debug-course-images.js
 */

const http = require('http');

console.log('\n🔍 FETCHING ALL COURSE IMAGES FROM API...\n');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/courses?t=' + Date.now(),
  method: 'GET',
  headers: {
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache'
  }
};

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const courses = JSON.parse(data);
      
      console.log(`✅ Retrieved ${courses.length} courses\n`);
      console.log('━'.repeat(120));
      console.log('COURSE IMAGE URLs:');
      console.log('━'.repeat(120));
      
      courses.forEach((course, index) => {
        const hasImage = !!course.courseimage;
        const status = hasImage ? '✅' : '❌';
        
        console.log(`\n[${index + 1}] ${course.id} - ${course.fullname}`);
        console.log(`    Status: ${status}`);
        console.log(`    Price: ₹${course.displayPrice || course.price || '0'}`);
        console.log(`    Image URL: ${course.courseimage || '(NULL - Using fallback)'}`);
        
        if (course.courseimage) {
          console.log(`    Full URL Length: ${course.courseimage.length} chars`);
          console.log(`    Contains 'pluginfile': ${course.courseimage.includes('pluginfile') ? '✅' : '❌'}`);
          console.log(`    Contains 'overviewfiles': ${course.courseimage.includes('overviewfiles') ? '✅' : '❌'}`);
        }
      });
      
      console.log('\n' + '━'.repeat(120));
      const coursesWithImages = courses.filter(c => c.courseimage).length;
      const coursesWithoutImages = courses.length - coursesWithImages;
      
      console.log(`📊 SUMMARY:`);
      console.log(`   ✅ Courses WITH images: ${coursesWithImages}/${courses.length}`);
      console.log(`   ❌ Courses WITHOUT images: ${coursesWithoutImages}/${courses.length}`);
      console.log(`   📈 Success Rate: ${Math.round((coursesWithImages / courses.length) * 100)}%`);
      console.log('━'.repeat(120) + '\n');
      
      if (coursesWithImages > 0) {
        console.log('✅ GOOD NEWS: Some courses have images! They should display in the UI.');
      } else {
        console.log('❌ PROBLEM: No course images found! All courses will show fallback gradients.');
        console.log('\n🔧 Possible Solutions:');
        console.log('   1. Check if getCourseOverviewFiles() API is working correctly');
        console.log('   2. Verify Moodle has course images uploaded');
        console.log('   3. Check Moodle token permissions');
        console.log('   4. Verify MOODLE_URL environment variable is set correctly\n');
      }
      
    } catch (err) {
      console.error('❌ Failed to parse API response:', err.message);
      console.error('Response:', data.substring(0, 200));
    }
  });
});

req.on('error', (err) => {
  console.error('❌ Failed to connect to API:', err.message);
  console.error('Make sure the server is running on http://localhost:3000\n');
});

req.end();
