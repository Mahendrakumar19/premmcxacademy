import { NextResponse } from 'next/server';
import { getAllCoursesWithEnrolment } from '@/lib/moodle-api';

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

    // Fetch courses with enrollment info and pricing from Moodle
    const courses = await getAllCoursesWithEnrolment(token);

    // Transform courses to include proper pricing and image data
    const transformedCourses = courses.map((course: any) => {
      // Get display price from custom field 'coursecost'
      let displayPrice = null;
      
      // Debug: log what custom fields we're getting
      if (course.customfields && Array.isArray(course.customfields)) {
        console.log(`📋 Course ${course.id} (${course.fullname}) custom fields:`, course.customfields);
        const priceField = course.customfields.find(
          (field: any) => field.shortname === 'coursecost' || field.name === 'Course Cost'
        );
        if (priceField) {
          displayPrice = priceField.value;
          console.log(`✅ Found price field:`, priceField);
        } else {
          console.log(`❌ No coursecost field found in:`, course.customfields.map((f: any) => f.shortname || f.name));
        }
      } else {
        console.log(`⚠️ Course ${course.id} has no customfields property`, Object.keys(course).slice(0, 10));
      }

      // Use actual payment enrolment fee if available, otherwise use display price
      const actualPrice = course.cost || displayPrice;

      return {
        id: course.id,
        fullname: course.fullname,
        shortname: course.shortname,
        summary: course.summary || '',
        displayname: course.displayname || course.fullname,
        categoryname: course.categoryname || course.category?.name || 'General',
        enrollmentcount: course.enrollmentcount || 0,
        // Display price (from custom field for UI)
        displayPrice: displayPrice,
        // Actual charge (from payment enrolment fee for payment)
        price: actualPrice,
        currency: course.currency || 'INR',
        // Get course image from overviewfiles or courseimage
        imageurl: course.courseimage || (course.overviewfiles && course.overviewfiles.length > 0 ? course.overviewfiles[0].fileurl : null),
        // Whether payment is required
        requiresPayment: course.requiresPayment || false,
        // Payment account info
        paymentaccount: course.paymentaccount || null,
      };
    });

    return NextResponse.json(transformedCourses);
  } catch (error: any) {
    console.error('❌ Error fetching courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses', details: error.message },
      { status: 500 }
    );
  }
}
