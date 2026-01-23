// Create a dedicated video proxy endpoint with proper streaming support
import { NextRequest, NextResponse } from 'next/server';
import https from 'https';

/**
 * Extract the actual redirect URL from a Moodle URL module page
 * Moodle URL modules are wrappers that redirect to external content
 */
async function extractMoodleUrlModuleTarget(moodleUrlModulePage: string): Promise<string | null> {
  try {
    // Create custom agent for self-signed certs
    const agent = new https.Agent({
      rejectUnauthorized: false,
    });

    const response = await fetch(moodleUrlModulePage, {
      method: 'GET',
      signal: AbortSignal.timeout(10000),
      redirect: 'follow', // Follow redirects automatically
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PremMCX/1.0)',
      },
      // @ts-ignore
      agent: moodleUrlModulePage.startsWith('https') ? agent : undefined,
    });

    // If we got redirected, the final URL is what we want
    const finalUrl = response.url;
    console.log(`📌 Extracted redirect from Moodle URL module: ${finalUrl}`);
    return finalUrl;
  } catch (error) {
    console.error('❌ Failed to extract Moodle URL module target:', error);
    return null;
  }
}

/**
 * Video Streaming Proxy
 * Handles Moodle videos with proper HTTP range requests and streaming
 * Usage: /api/proxy-video?url=<encoded-moodle-url>
 */
export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl.searchParams.get('url');
    
    if (!url) {
      return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
    }

    let decodedUrl = decodeURIComponent(url);
    const moodleToken = process.env.MOODLE_TOKEN;

    // If this is a Moodle URL module page (mod/url/view.php), extract the actual target URL
    if (decodedUrl.includes('/mod/url/view.php')) {
      console.log('🔍 Detected Moodle URL module, extracting target...');
      const targetUrl = await extractMoodleUrlModuleTarget(decodedUrl);
      if (targetUrl) {
        decodedUrl = targetUrl;
        console.log(`✅ Using extracted URL: ${decodedUrl}`);
      } else {
        console.error('❌ Could not extract target URL from Moodle URL module');
        return NextResponse.json(
          { error: 'Could not extract video URL from Moodle module' },
          { status: 400 }
        );
      }
    }

    // Add token to Moodle URLs if not already present
    let finalUrl = decodedUrl;
    if (decodedUrl.includes('pluginfile.php')) {
      const separator = decodedUrl.includes('?') ? '&' : '?';
      finalUrl = `${decodedUrl}${separator}token=${moodleToken}`;
    }

    console.log('🎬 Streaming video from:', finalUrl);

    // Get headers from client request to support Range requests
    const headers: HeadersInit = {
      'User-Agent': 'Mozilla/5.0 (compatible; PremMCX/1.0)',
    };

    // Pass through Range header for seeking support
    const rangeHeader = request.headers.get('range');
    if (rangeHeader) {
      headers['Range'] = rangeHeader;
    }

    // Create custom agent to handle self-signed certificates
    const agent = new https.Agent({
      rejectUnauthorized: false,
    });

    const response = await fetch(finalUrl, {
      headers,
      signal: AbortSignal.timeout(60000),
      // @ts-ignore - agent is not in the standard types but works with Node.js
      agent: finalUrl.startsWith('https') ? agent : undefined,
    });

    if (!response.ok) {
      console.error('❌ Video proxy fetch failed:', response.status, response.statusText);
      return NextResponse.json(
        { error: `Failed to fetch video: ${response.statusText}` },
        { status: response.status }
      );
    }

    // Get the content type and other headers
    const contentType = response.headers.get('content-type') || 'video/mp4';
    const contentLength = response.headers.get('content-length');
    const contentRange = response.headers.get('content-range');

    // Convert response to buffer for streaming
    const buffer = await response.arrayBuffer();

    // Build response headers
    const responseHeaders: HeadersInit = {
      'Content-Type': contentType,
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
      'Access-Control-Allow-Origin': '*',
    };

    // Add Content-Length if available
    if (contentLength) {
      responseHeaders['Content-Length'] = contentLength;
    }

    // Add Content-Range if this is a partial response
    if (contentRange) {
      responseHeaders['Content-Range'] = contentRange;
    }

    // Return appropriate status code
    const statusCode = rangeHeader && contentRange ? 206 : 200;

    return new NextResponse(buffer, {
      status: statusCode,
      headers: responseHeaders,
    });
  } catch (error: unknown) {
    console.error('❌ Video proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to stream video' },
      { status: 500 }
    );
  }
}

export const revalidate = 86400; // Cache for 24 hours
