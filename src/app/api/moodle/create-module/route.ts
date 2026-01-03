import { NextRequest, NextResponse } from 'next/server';

const MOODLE_URL = process.env.NEXT_PUBLIC_MOODLE_URL;
const MOODLE_TOKEN = process.env.MOODLE_TOKEN;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { courseid, sectionid, modulename, name, intro } = body;

    if (!courseid || (sectionid === undefined || sectionid === null) || !modulename || !name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const params = new URLSearchParams({
      wstoken: MOODLE_TOKEN!,
      wsfunction: 'core_courseformat_new_module',
      moodlewsrestformat: 'json',
      courseid: courseid.toString(),
      sectionnumber: sectionid.toString(),
      modname: modulename,
    });

    const response = await fetch(`${MOODLE_URL}/webservice/rest/server.php?${params}`);
    const data = await response.json();

    if (data && (data.exception || data.errorcode)) {
      return NextResponse.json(
        { error: data.message || 'Failed to create module', details: data },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      module: data,
      message: 'Module created successfully'
    });

  } catch (error) {
    console.error('Module creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create module', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
