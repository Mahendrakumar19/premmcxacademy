import { NextRequest, NextResponse } from 'next/server';

const MOODLE_URL = process.env.NEXT_PUBLIC_MOODLE_URL;
const MOODLE_TOKEN = process.env.MOODLE_TOKEN;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { courseid, fullname, shortname, categoryid, summary } = body;

    if (!fullname || !shortname) {
      return NextResponse.json(
        { error: 'Course name and shortname are required' },
        { status: 400 }
      );
    }

    const params = new URLSearchParams({
      wstoken: MOODLE_TOKEN!,
      wsfunction: 'core_course_create_courses',
      moodlewsrestformat: 'json',
      'courses[0][fullname]': fullname,
      'courses[0][shortname]': shortname,
      'courses[0][categoryid]': categoryid || '1',
      'courses[0][summary]': summary || '',
      'courses[0][format]': 'topics',
      'courses[0][visible]': '1',
    });

    const response = await fetch(`${MOODLE_URL}/webservice/rest/server.php?${params}`);
    const data = await response.json();

    if (data.exception || data.errorcode) {
      return NextResponse.json(
        { error: data.message || 'Failed to create course', details: data },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      course: data[0],
      message: 'Course created successfully'
    });

  } catch (error) {
    console.error('Course creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create course', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
