import { NextResponse } from 'next/server';
import {
  getSiteInfo,
  getUserCourses,
  getCourseContents,
  getEnrolledUsers,
  getUserGrades,
  searchCourses,
} from '@/lib/moodle';
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
        const courses = await getUserCourses(
          userid ? parseInt(userid, 10) : undefined,
          token
        );
        return NextResponse.json({ ok: true, data: courses });
      }

      case 'course-contents': {
        const courseid = searchParams.get('courseid');
        if (!courseid) {
          return NextResponse.json(
            { ok: false, error: 'courseid is required' },
            { status: 400 }
          );
        }
        const contents = await getCourseContents(parseInt(courseid, 10), token);
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
