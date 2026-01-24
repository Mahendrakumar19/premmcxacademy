import { NextResponse } from 'next/server';
import { getAllCoursesWithEnrolment, getCourseImage } from '@/lib/moodle-api';

export async function GET(request: Request) {
  try {
    // Use the MOODLE_TOKEN from environment variables
    const token = process.env.MOODLE_TOKEN;

    if (!token) {
      return NextResponse.json(
        { error: 'Moodle token not configured' },
        { status: 500 }
      );
    }

    console.log('📚 API: Fetching courses from Moodle...');
    
    // Fetch courses with enrollment info and pricing from Moodle
    const courses = await getAllCoursesWithEnrolment(token);
    
    console.log(`📊 API: Received ${courses.length} courses from moodle-api`);

    // Transform courses to include proper pricing and image data
    const transformedCourses = await Promise.all(courses.map(async (course: any) => {
      try {
        // Use values already extracted by getAllCoursesWithEnrolment if available
        let displayPrice = course.displayPrice || null;
        let cost = course.cost || null;
        let currency = course.currency || 'INR'; // Default to INR if not specified
        
        // Fallback: Check custom fields if not already extracted or if we need to refine them
        if (course.customfields && Array.isArray(course.customfields)) {
          const priceField = course.customfields.find(
            (field: any) => field.shortname === 'cost' || field.shortname === 'coursecost' || field.name === 'CourseCost' || field.name === 'Course Cost'
          );
          if (priceField && priceField.value !== undefined && priceField.value !== null) {
            const val = typeof priceField.value === 'object' && priceField.value !== null ? priceField.value.text : priceField.value;
            if (!displayPrice) displayPrice = val;
          }

          if (!course.currency || course.currency === 'INR') {
            const currencyField = course.customfields.find(
              (field: any) => field.shortname === 'currency' || field.name === 'Currency'
            );
            if (currencyField && currencyField.value !== undefined && currencyField.value !== null) {
              const val = typeof currencyField.value === 'object' && currencyField.value !== null ? currencyField.value.text : currencyField.value;
              if (val) currency = val; // Only update if we have a valid value
            }
          }
        }

        // Final price for payment logic
        const actualPrice = cost || displayPrice;

        // Fetch course image using the getCourseImage function (equivalent to Moodle's course_summary_exporter)
        let courseimage = await getCourseImage(course.id, token);
        
        // Fallback to course.courseimage if getCourseImage returns null
        if (!courseimage) {
          courseimage = course.courseimage || null;
        }
        
        // Fallback to overviewfiles
        if (!courseimage && course.overviewfiles && Array.isArray(course.overviewfiles) && course.overviewfiles.length > 0) {
          courseimage = course.overviewfiles[0].fileurl;
        }
        
        // If still no image, try to construct it from Moodle directly
        // Moodle stores course images in: /moodle/course/overview_files.php?cid=COURSEID
        // Or in custom course images: /moodle/pluginfile.php/COURSEID/course/overviewfiles/
        if (!courseimage && course.id) {
          // Try standard Moodle course image location
          const moodleUrl = process.env.MOODLE_URL || process.env.NEXT_PUBLIC_MOODLE_URL || '';
          if (moodleUrl) {
            // Construct the standard Moodle course overview image URL
            // This uses Moodle's built-in course image storage
            const fallbackImageUrl = `${moodleUrl}/pluginfile.php/${course.id}/course/overviewfiles/0/`;
            console.log(`📸 Constructed fallback image URL for course ${course.id}: ${fallbackImageUrl}`);
            courseimage = fallbackImageUrl;
          }
        }
        
        // If courseimage is a Moodle pluginfile URL, it will be proxied on the frontend
        // The backend already normalizes these URLs in moodle-api.ts
        
        console.log(`📸 Course ${course.id} (${course.fullname}): courseimage = ${courseimage}`);

        // Safely parse price for boolean logic
        const numericPrice = actualPrice ? parseFloat(String(actualPrice).replace(/[^\d.]/g, '')) : 0;

        return {
          id: course.id,
          fullname: course.fullname || 'Untitled Course',
          shortname: course.shortname || '',
          summary: course.summary || '',
          displayname: course.displayname || course.fullname || 'Untitled Course',
          categoryname: course.categoryname || course.category?.name || 'General',
          enrollmentcount: course.enrollmentcount || 0,
          displayPrice: displayPrice,
          price: actualPrice,
          currency: currency,
          gst: course.gst || 0,
          courseimage: courseimage,
          overviewfiles: course.overviewfiles || [],
          requiresPayment: course.requiresPayment || (!isNaN(numericPrice) && numericPrice > 0) || false,
          paymentaccount: course.paymentaccount || null,
        };
      } catch (err) {
        console.error(`❌ Error transforming course ${course?.id}:`, err);
        // Return a minimal course object instead of crashing the whole list
        return {
          id: course?.id || 0,
          fullname: course?.fullname || 'Error loading course',
          price: null,
          error: true
        };
      }
    }));
    
    console.log(`✅ API: Returning ${transformedCourses.length} transformed courses`);

    return NextResponse.json(transformedCourses);
  } catch (error: any) {
    console.error('❌ Error fetching courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses', details: error.message },
      { status: 500 }
    );
  }
}

/* Cache configuration for optimal performance */
export const revalidate = 300; // Revalidate every 5 minutes
