import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

/**
 * GET /api/video-stream?url=<encoded-video-url>
 * Direct video streaming with authentication
 * 
 * Usage:
 * /api/video-stream?url=https%3A%2F%2Flms.premmcxtrainingacademy.com%2Fpluginfile.php%2F44%2Fmod_page%2Fcontent%2F1%2FScreen%2520Recording%25202026-01-06%2520034422.mp4
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized - Authentication required' },
        { status: 401 }
      );
    }

    const videoUrl = request.nextUrl.searchParams.get('url');
    
    if (!videoUrl) {
      return NextResponse.json(
        { error: 'Missing url parameter' },
        { status: 400 }
      );
    }

    const decodedUrl = decodeURIComponent(videoUrl);
    const moodleToken = process.env.MOODLE_TOKEN;

    console.log(`🎥 [Video Stream] User ${(session.user as any)?.email} requesting video`);
    console.log(`📍 Video URL (raw): ${decodedUrl.split('?')[0]}`);

    // Reconstruct URL with /webservice/ prefix if needed for Moodle API access
    let finalUrl = decodedUrl;
    
    // If URL is a Moodle pluginfile but doesn't have /webservice/ prefix, add it
    // This is required for authenticated access to files through Moodle API
    if (decodedUrl.includes('/pluginfile.php') && !decodedUrl.includes('/webservice/pluginfile.php')) {
      finalUrl = decodedUrl.replace('/pluginfile.php', '/webservice/pluginfile.php');
      console.log(`📍 Added /webservice/ prefix for API access`);
      console.log(`📍 Final URL: ${finalUrl.split('?')[0]}`);
    }

    // Add token to Moodle URLs if not already present
    if (finalUrl.includes('pluginfile.php') && !finalUrl.includes('token=') && moodleToken) {
      const separator = finalUrl.includes('?') ? '&' : '?';
      finalUrl = `${finalUrl}${separator}token=${moodleToken}`;
      console.log(`🔑 Added auth token to URL`);
    }

    console.log(`🔗 Fetching video with full URL...`);

    // Get video content with GET request - skip HEAD request to avoid timeout issues
    let response: Response;
    try {
      response = await fetch(finalUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; PremMCX/1.0)',
          'Range': request.headers.get('Range') || '',
        },
        signal: AbortSignal.timeout(60000),
      });
    } catch (fetchError) {
      console.error(`❌ Fetch error: ${String(fetchError)}`);
      // Try without token if token was added
      if (finalUrl.includes('token=')) {
        console.log(`⚠️ Retrying without token...`);
        const urlWithoutToken = decodedUrl;
        try {
          response = await fetch(urlWithoutToken, {
            method: 'GET',
            headers: {
              'User-Agent': 'Mozilla/5.0 (compatible; PremMCX/1.0)',
              'Range': request.headers.get('Range') || '',
            },
            signal: AbortSignal.timeout(60000),
          });
        } catch (retryError) {
          console.error(`❌ Retry failed: ${String(retryError)}`);
          throw fetchError;
        }
      } else {
        throw fetchError;
      }
    }

    if (!response.ok) {
      console.error(`❌ Failed to fetch video: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { error: `Failed to fetch video: ${response.statusText}` },
        { status: response.status }
      );
    }

    const contentType = response.headers.get('content-type') || 'video/mp4';
    const contentLength = response.headers.get('content-length');
    const contentRange = response.headers.get('content-range');

    console.log(`✅ Video stream started - Type: ${contentType}, Size: ${contentLength ? Math.round(parseInt(contentLength) / 1024 / 1024 * 10) / 10 + ' MB' : 'unknown'}`);

    // Stream the video directly
    return new NextResponse(response.body, {
      status: response.status,
      headers: {
        'Content-Type': contentType,
        'Content-Length': contentLength || '',
        'Content-Range': contentRange || '',
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error: unknown) {
    console.error('❌ Video stream error:', error);
    
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Video request timeout' },
        { status: 408 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to stream video', details: String(error) },
      { status: 500 }
    );
  }
}
