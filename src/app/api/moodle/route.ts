import { NextResponse } from 'next/server';
import {
  getSiteInfo,
  getUserCourses,
  getCourseContents,
  getEnrolledUsers,
  getUserGrades,
  searchCourses,
  getCoursesWithEnrolmentInfo,
  getAutologinKey,
} from '@/lib/moodle';
import { getCoursePaymentInfo, getCoursesWithPaymentInfo } from '@/lib/moodle-payment';
import { demoCourses, demoSiteInfo, isMoodleConfigured } from '@/lib/demo-data';

/**
 * Unified Moodle API proxy
 * GET /api/moodle?action=<action>&...params
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action') || 'courses';
    const token = searchParams.get('token') || undefined;

    // Check if Moodle is configured
    const configured = isMoodleConfigured();

    // If not configured, return demo data for certain actions
    if (!configured && !token) {
      if (action === 'siteinfo') {
        return NextResponse.json({
          ok: true,
          data: demoSiteInfo,
          demo: true,
          message: 'Using demo data. Configure MOODLE_URL and MOODLE_TOKEN in .env.local',
        });
      }

      if (action === 'courses') {
        return NextResponse.json({
          ok: true,
          data: demoCourses,
          demo: true,
          message: 'Using demo data. Configure MOODLE_URL and MOODLE_TOKEN in .env.local',
        });
      }

      // For other actions, return helpful error
      return NextResponse.json(
        {
          ok: false,
          error: 'Moodle is not configured. Please set MOODLE_URL and MOODLE_TOKEN in .env.local',
          demo: true,
        },
        { status: 503 }
      );
    }

    // Proceed with real Moodle API calls
    switch (action) {
      case 'siteinfo': {
        const info = await getSiteInfo(token);
        return NextResponse.json({ ok: true, data: info });
      }

      case 'courses': {
        const userid = searchParams.get('userid');
        const withPayment = searchParams.get('withPayment') === 'true';
        
        if (withPayment) {
          // Use the new optimized function from moodle-api
          const { getAllCoursesWithEnrolment } = await import('@/lib/moodle-api');
          const courses = await getAllCoursesWithEnrolment(token);
          return NextResponse.json({ ok: true, data: courses });
        } else {
          // Get regular courses
          const courses = await getUserCourses(
            userid ? parseInt(userid, 10) : undefined,
            token
          );
          return NextResponse.json({ ok: true, data: courses });
        }
      }

      case 'course': {
        const id = searchParams.get('id');
        const withPayment = searchParams.get('withPayment') === 'true';
        
        if (!id) {
          return NextResponse.json(
            { ok: false, error: 'course id is required' },
            { status: 400 }
          );
        }
        
        const courseId = parseInt(id, 10);
        
        if (withPayment) {
          // Get single course with payment info using optimized function
          const { getCourseWithEnrolment } = await import('@/lib/moodle-api');
          const course = await getCourseWithEnrolment(courseId, token);
          
          if (!course) {
            return NextResponse.json(
              { ok: false, error: 'Course not found' },
              { status: 404 }
            );
          }
          
          return NextResponse.json({ ok: true, data: course });
        } else {
          // Get regular course (fallback to searching courses)
          const courses = await getUserCourses(undefined, token);
          const course = courses.find(c => c.id === courseId);
          
          if (!course) {
            return NextResponse.json(
              { ok: false, error: 'Course not found' },
              { status: 404 }
            );
          }
          
          return NextResponse.json({ ok: true, data: course });
        }
      }

      case 'course-payment-info': {
        const courseid = searchParams.get('courseid');
        if (!courseid) {
          return NextResponse.json(
            { ok: false, error: 'courseid is required' },
            { status: 400 }
          );
        }
        const paymentInfo = await getCoursePaymentInfo(parseInt(courseid, 10), token);
        return NextResponse.json({ ok: true, data: paymentInfo });
      }

      case 'course-contents': {
        const courseid = searchParams.get('courseid');
        if (!courseid) {
          return NextResponse.json(
            { ok: false, error: 'courseid is required' },
            { status: 400 }
          );
        }
        // Use MOODLE_COURSE_TOKEN if available, otherwise fall back to regular token
        const courseToken = process.env.MOODLE_COURSE_TOKEN || token;
        console.log('📚 Fetching course contents with course token...');
        const contents = await getCourseContents(parseInt(courseid, 10), courseToken);
        return NextResponse.json({ ok: true, data: contents });
      }

      case 'courseContents': {
        const id = searchParams.get('id');
        if (!id) {
          return NextResponse.json(
            { ok: false, error: 'id is required' },
            { status: 400 }
          );
        }
        // Use MOODLE_COURSE_TOKEN if available, otherwise fall back to regular token
        const courseToken = process.env.MOODLE_COURSE_TOKEN || token;
        console.log('📚 Fetching course contents with course token for course:', id);
        const contents = await getCourseContents(parseInt(id, 10), courseToken);
        return NextResponse.json({ ok: true, data: contents });
      }

      case 'enrolled-users': {
        const courseid = searchParams.get('courseid');
        if (!courseid) {
          return NextResponse.json(
            { ok: false, error: 'courseid is required' },
            { status: 400 }
          );
        }
        const users = await getEnrolledUsers(parseInt(courseid, 10), token);
        return NextResponse.json({ ok: true, data: users });
      }

      case 'grades': {
        const courseid = searchParams.get('courseid');
        const userid = searchParams.get('userid');
        if (!courseid || !userid) {
          return NextResponse.json(
            { ok: false, error: 'courseid and userid are required' },
            { status: 400 }
          );
        }
        const grades = await getUserGrades(
          parseInt(courseid, 10),
          parseInt(userid, 10),
          token
        );
        return NextResponse.json({ ok: true, data: grades });
      }

      case 'search-courses': {
        const criterianame = searchParams.get('criterianame') || 'search';
        const criteriavalue = searchParams.get('criteriavalue') || '';
        const results = await searchCourses(criterianame, criteriavalue, token);
        return NextResponse.json({ ok: true, data: results.courses });
      }

      case 'autologin': {
        if (!token) {
          return NextResponse.json(
            { ok: false, error: 'token is required' },
            { status: 400 }
          );
        }
        const data = await getAutologinKey(token);
        return NextResponse.json({ ok: true, data });
      }

      default:
        return NextResponse.json(
          { ok: false, error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (err: unknown) {
    let message = 'Internal server error';
    if (typeof err === 'string') message = err;
    else if (typeof err === 'object' && err !== null && 'message' in err) {
      message = String((err as { message?: unknown }).message ?? 'Unknown error');
    } else {
      message = String(err);
    }
    
    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    );
  }
}
