import { NextRequest, NextResponse } from 'next/server';

const MOODLE_URL = process.env.NEXT_PUBLIC_MOODLE_URL;
const MOODLE_TOKEN = process.env.MOODLE_TOKEN;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cmid, name } = body;

    if (!cmid || !name) {
      return NextResponse.json({ error: 'Module ID and name required' }, { status: 400 });
    }

    // Use core_course_update_course with module name parameter
    const params = new URLSearchParams({
      wstoken: MOODLE_TOKEN!,
      wsfunction: 'core_update_inplace_editable',
      moodlewsrestformat: 'json',
      component: 'core_course',
      itemtype: 'activityname',
      itemid: cmid.toString(),
      value: name,
    });

    const response = await fetch(`${MOODLE_URL}/webservice/rest/server.php?${params}`);
    const data = await response.json();

    if (data && (data.exception || data.errorcode)) {
      return NextResponse.json(
        { error: data.message || 'Failed to update module', details: data },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Module updated successfully'
    });

  } catch (error) {
    console.error('Module update error:', error);
    return NextResponse.json(
      { error: 'Failed to update module', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
