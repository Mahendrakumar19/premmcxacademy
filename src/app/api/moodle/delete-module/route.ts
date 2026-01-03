import { NextRequest, NextResponse } from 'next/server';

const MOODLE_URL = process.env.NEXT_PUBLIC_MOODLE_URL;
const MOODLE_TOKEN = process.env.MOODLE_TOKEN;

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cmid = searchParams.get('cmid'); // Course module ID

    if (!cmid) {
      return NextResponse.json({ error: 'Module ID required' }, { status: 400 });
    }

    const params = new URLSearchParams({
      wstoken: MOODLE_TOKEN!,
      wsfunction: 'core_course_delete_modules',
      moodlewsrestformat: 'json',
      'cmids[0]': cmid,
    });

    const response = await fetch(`${MOODLE_URL}/webservice/rest/server.php?${params}`);
    const data = await response.json();

    if (data && (data.exception || data.errorcode)) {
      return NextResponse.json(
        { error: data.message || 'Failed to delete module', details: data },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Module deleted successfully'
    });

  } catch (error) {
    console.error('Module deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete module', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
