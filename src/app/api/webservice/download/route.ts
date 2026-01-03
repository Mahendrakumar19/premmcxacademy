import { NextResponse } from 'next/server';

/**
 * File Download Handler
 * GET /api/webservice/download?url=<encoded_file_url>
 * 
 * Authenticates with Moodle and streams file to client
 * Preserves authentication tokens for secure access
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const encodedUrl = searchParams.get('url');
    
    if (!encodedUrl) {
      return NextResponse.json(
        { ok: false, error: 'url parameter is required' },
        { status: 400 }
      );
    }

    // Decode the file URL
    let fileUrl: string;
    try {
      fileUrl = decodeURIComponent(encodedUrl);
    } catch (err) {
      return NextResponse.json(
        { ok: false, error: 'Invalid URL encoding' },
        { status: 400 }
      );
    }

    // Validate that URL is from Moodle server
    const moodleHost = process.env.MOODLE_URL || 'https://srv1215874.hstgr.cloud';
    if (!fileUrl.startsWith(moodleHost) && !fileUrl.startsWith('https://srv1215874.hstgr.cloud')) {
      return NextResponse.json(
        { ok: false, error: 'URL must be from Moodle server' },
        { status: 403 }
      );
    }

    console.log('📥 Downloading file:', fileUrl);

    // Fetch file from Moodle with authentication
    const token = process.env.MOODLE_TOKEN || process.env.MOODLE_COURSE_TOKEN;
    
    // Add token if not already in URL
    let fetchUrl = fileUrl;
    if (!fetchUrl.includes('token=')) {
      const separator = fetchUrl.includes('?') ? '&' : '?';
      fetchUrl = `${fetchUrl}${separator}token=${token}`;
    }

    const response = await fetch(fetchUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'LMS-Liquid-Glass/1.0',
      },
      timeout: 30000,
    });

    if (!response.ok) {
      console.error('❌ Failed to fetch file from Moodle:', response.status, response.statusText);
      return NextResponse.json(
        { ok: false, error: `Failed to download file: ${response.statusText}` },
        { status: response.status }
      );
    }

    // Get file data and headers
    const buffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const contentLength = response.headers.get('content-length');
    
    // Extract filename from URL or use default
    const urlObj = new URL(fileUrl);
    const pathname = urlObj.pathname;
    const filename = pathname.split('/').pop() || 'file';

    console.log('✅ File downloaded successfully:', filename);

    // Return file with appropriate headers
    // Don't set Content-Disposition: attachment so browser renders instead of downloading
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': contentLength || buffer.byteLength.toString(),
        'Cache-Control': 'public, max-age=3600',
      },
    });

  } catch (err: unknown) {
    let message = 'Internal server error';
    if (typeof err === 'string') message = err;
    else if (typeof err === 'object' && err !== null && 'message' in err) {
      message = String((err as { message?: unknown }).message ?? 'Unknown error');
    } else {
      message = String(err);
    }

    console.error('❌ Download error:', message);
    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    );
  }
}
