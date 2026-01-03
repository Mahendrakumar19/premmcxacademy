import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { courseId, userId } = await request.json();
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!courseId || !userId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const moodleUrl = process.env.MOODLE_URL;
    const userToken = (session.user as any)?.token; // User's own token for self-enrollment

    if (!moodleUrl || !userToken) {
      console.error('❌ Moodle configuration missing');
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      );
    }

    console.log('📝 Self-enrolling user in course:', { userId, courseId });

    // Try self-enrollment first (requires self-enrollment enabled on course)
    const selfEnrollParams = new URLSearchParams({
      wstoken: userToken,
      wsfunction: 'enrol_self_enrol_user',
      moodlewsrestformat: 'json',
      courseid: String(courseId),
    });

    const selfEnrollResponse = await fetch(
      `${moodleUrl}/webservice/rest/server.php?${selfEnrollParams}`,
      { 
        method: 'POST',
        cache: 'no-store'
      }
    );

    const selfEnrollResult = await selfEnrollResponse.json();
    
    console.log('📦 Self-enrollment response:', selfEnrollResult);

    // Check for errors
    if (selfEnrollResult.error || selfEnrollResult.errorcode || selfEnrollResult.exception) {
      // If self-enrollment failed, try getting enrollment instances
      console.log('⚠️ Self-enrollment failed, trying to get enrollment methods...');
      
      const instancesParams = new URLSearchParams({
        wstoken: userToken,
        wsfunction: 'core_enrol_get_course_enrolment_methods',
        moodlewsrestformat: 'json',
        courseid: String(courseId),
      });

      const instancesResponse = await fetch(
        `${moodleUrl}/webservice/rest/server.php?${instancesParams}`,
        { 
          method: 'POST',
          cache: 'no-store'
        }
      );

      const instances = await instancesResponse.json();
      console.log('📦 Enrollment instances:', instances);

      return NextResponse.json(
        { 
          success: false, 
          error: 'Enrollment not available. Please contact administrator to enable self-enrollment for this course.',
          details: {
            selfEnrollError: selfEnrollResult,
            availableMethods: instances
          }
        },
        { status: 400 }
      );
    }

    console.log('✅ User self-enrolled successfully');

    return NextResponse.json({
      success: true,
      courseId,
      status: selfEnrollResult.status || 'enrolled'
    });
  } catch (error: unknown) {
    console.error('❌ Enrollment error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Enrollment failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
