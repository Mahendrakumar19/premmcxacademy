import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const forumid = searchParams.get('forumid');
    const token = req.headers.get('authorization')?.replace('Bearer ', '');

    if (!forumid) {
      return NextResponse.json(
        { ok: false, error: 'forumid is required' },
        { status: 400 }
      );
    }

    const MOODLE_URL = process.env.NEXT_PUBLIC_MOODLE_URL;
    const MOODLE_TOKEN = process.env.MOODLE_TOKEN;

    // Fetch forum discussions from Moodle
    const response = await fetch(
      `${MOODLE_URL}/webservice/rest/server.php?` +
      new URLSearchParams({
        wstoken: token || MOODLE_TOKEN || '',
        wsfunction: 'mod_forum_get_forum_discussions',
        moodlewsrestformat: 'json',
        forumid: forumid
      }),
      { method: 'POST' }
    );

    const data = await response.json();

    if (data.exception) {
      return NextResponse.json(
        { ok: false, error: data.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      discussions: data.discussions || []
    });
  } catch (error: any) {
    console.error('Forum API error:', error);
    return NextResponse.json(
      { ok: false, error: error.message || 'Failed to fetch forum discussions' },
      { status: 500 }
    );
  }
}
