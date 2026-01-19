import { NextRequest, NextResponse } from 'next/server';

/**
 * Proxy images and files from Moodle with proper authentication
 * Usage: /api/proxy-image?url=<encoded-moodle-url>
 */
export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl.searchParams.get('url');
    
    if (!url) {
      return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
    }

    const decodedUrl = decodeURIComponent(url);
    const moodleToken = process.env.MOODLE_TOKEN;

    // Add token to Moodle URLs if not already present
    let finalUrl = decodedUrl;
    if (decodedUrl.includes('pluginfile.php')) {
      const separator = decodedUrl.includes('?') ? '&' : '?';
      finalUrl = `${decodedUrl}${separator}token=${moodleToken}`;
    }

    console.log('🖼️ Proxying image/file from:', finalUrl);

    const response = await fetch(finalUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PremMCX/1.0)',
      },
      // Set a timeout for the request
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      console.error('❌ Proxy fetch failed:', response.status, response.statusText);
      return NextResponse.json(
        { error: `Failed to fetch resource: ${response.statusText}` },
        { status: response.status }
      );
    }

    // Get the content type from the response
    const contentType = response.headers.get('content-type');
    const buffer = await response.arrayBuffer();

    // Return the proxied content with proper headers
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType || 'application/octet-stream',
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error: unknown) {
    console.error('❌ Proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to proxy resource' },
      { status: 500 }
    );
  }
}
