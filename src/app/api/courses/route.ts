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
      try {
        // Use values already extracted by getAllCoursesWithEnrolment if available
        let displayPrice = course.displayPrice || null;
        let cost = course.cost || null;
        let currency = course.currency || 'INR';
        
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
              currency = val || currency;
            }
          }
        }

        // Final price for payment logic
        const actualPrice = cost || displayPrice;

        // Safely extract image URL
        let imageurl = course.courseimage || null;
        if (!imageurl && course.overviewfiles && Array.isArray(course.overviewfiles) && course.overviewfiles.length > 0) {
          imageurl = course.overviewfiles[0].fileurl;
        }

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
          imageurl: imageurl,
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
