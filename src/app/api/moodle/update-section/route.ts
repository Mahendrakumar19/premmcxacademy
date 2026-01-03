import { NextRequest, NextResponse } from 'next/server';

const MOODLE_URL = process.env.NEXT_PUBLIC_MOODLE_URL;
const MOODLE_TOKEN = process.env.MOODLE_TOKEN;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sectionid, name } = body;

    if (!sectionid || !name) {
      return NextResponse.json({ error: 'Section ID and name required' }, { status: 400 });
    }

    const params = new URLSearchParams({
      wstoken: MOODLE_TOKEN!,
      wsfunction: 'core_update_inplace_editable',
      moodlewsrestformat: 'json',
      component: 'core_course',
      itemtype: 'sectionname',
      itemid: sectionid.toString(),
      value: name,
    });

    const response = await fetch(`${MOODLE_URL}/webservice/rest/server.php?${params}`);
    const data = await response.json();

    if (data && (data.exception || data.errorcode)) {
      return NextResponse.json(
        { error: data.message || 'Failed to update section', details: data },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Section updated successfully'
    });

  } catch (error) {
    console.error('Section update error:', error);
    return NextResponse.json(
      { error: 'Failed to update section', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
