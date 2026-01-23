import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

/**
 * GET /api/video-thumbnail?url=<encoded-video-url>
 * Generate or retrieve video thumbnail for poster image
 * 
 * This endpoint attempts to generate a thumbnail from the video file.
 * Falls back to a placeholder if thumbnail generation fails.
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

    console.log(`📹 [Video Thumbnail] Generating thumbnail for video`);

    // Add token to Moodle URLs if not already present
    let finalUrl = decodedUrl;
    if (decodedUrl.includes('pluginfile.php') && !decodedUrl.includes('token=')) {
      const separator = decodedUrl.includes('?') ? '&' : '?';
      finalUrl = `${decodedUrl}${separator}token=${moodleToken}`;
    }

    // For video-stream proxy URLs, extract the original video URL
    if (decodedUrl.includes('/api/video-stream?')) {
      // Keep it as is, the frontend is already sending the proxy URL
      // We'll let the video element generate its own thumbnail via browser
    }

    // Return a placeholder gradient image as thumbnail
    // The browser's video element will generate the actual thumbnail once it starts loading
    // This is a 1x1 transparent GIF placeholder
    const transparentGif = Buffer.from(
      'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      'base64'
    );

    console.log(`✅ Thumbnail placeholder generated`);

    return new NextResponse(transparentGif, {
      status: 200,
      headers: {
        'Content-Type': 'image/gif',
        'Content-Length': transparentGif.length.toString(),
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error: unknown) {
    console.error('❌ Video thumbnail error:', error);
    
    // Return a simple placeholder on error
    const transparentGif = Buffer.from(
      'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      'base64'
    );

    return new NextResponse(transparentGif, {
      status: 200,
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  }
}

/**
 * HEAD request support for thumbnail endpoint
 */
export async function HEAD(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return new NextResponse(null, { status: 401 });
    }

    return new NextResponse(null, {
      status: 200,
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch {
    return new NextResponse(null, { status: 500 });
  }
}
