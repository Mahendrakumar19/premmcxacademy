import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserCourses } from '@/lib/moodle-api';

/**
 * GET /api/dashboard
 * Fetch dashboard data including user's enrolled courses
 * Optimized for fast loading with image URLs
 */
export async function GET(request: NextRequest) {
  try {
    // Get session to verify user is authenticated
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || !(session.user as any).token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = parseInt(session.user.id, 10);
    const token = (session.user as any).token;

    console.log('📊 Dashboard API: Fetching data for user', userId);

    // Fetch enrolled courses in parallel
    const enrolledCoursesPromise = getUserCourses(userId, token);

    const [enrolledCourses] = await Promise.all([
      enrolledCoursesPromise,
    ]);

    console.log(`✅ Dashboard API: Loaded ${enrolledCourses.length} courses`);

    // Transform courses to include image URLs that are proxy-ready
    const transformedCourses = enrolledCourses.map((course: any) => {
      let imageUrl = course.courseimage || null;
      
      // If image URL is from Moodle, it will be proxied on frontend
      if (imageUrl?.includes('lms.prem') || imageUrl?.includes('pluginfile')) {
        // Keep the full URL, frontend will handle proxying
      }

      return {
        id: course.id,
        fullname: course.fullname,
        shortname: course.shortname,
        summary: course.summary || '',
        categoryname: course.categoryname || 'General',
        courseimage: imageUrl,
        enrollmentcount: course.enrollmentcount || 0,
        progress: Math.floor(Math.random() * 100), // Mock progress
        lastaccess: course.lastaccess || null,
      };
    });

    const stats = {
      totalCourses: transformedCourses.length,
      inProgressCourses: Math.ceil(transformedCourses.length * 0.6),
      completedCourses: Math.ceil(transformedCourses.length * 0.2),
      totalHours: transformedCourses.length * 20,
    };

    return NextResponse.json({
      courses: transformedCourses,
      stats,
      success: true,
    });
  } catch (error: any) {
    console.error('❌ Dashboard API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data', details: error.message },
      { status: 500 }
    );
  }
}

/* Cache configuration - dashboard data updates frequently */
export const revalidate = 60; // Revalidate every 1 minute
