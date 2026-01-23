/**
 * Extract Video URL API
 * Fetches Moodle URL module pages and extracts the actual video URL
 * Returns clean, direct video links (YouTube, Vimeo, MP4, etc.)
 * Usage: /api/extract-video-url?url=<encoded-moodle-url-module-page>
 */

import { NextRequest, NextResponse } from 'next/server';
import https from 'https';
import { getServerSession } from 'next-auth/next';

const MOODLE_URL = process.env.MOODLE_URL || process.env.NEXT_PUBLIC_MOODLE_URL || '';
const MOODLE_TOKEN = process.env.MOODLE_TOKEN || '';

interface ExtractedVideo {
  type: 'youtube' | 'vimeo' | 'direct' | 'unknown';
  videoUrl: string;
  videoId?: string;
  title?: string;
}

/**
 * Extract YouTube video ID from URL
 */
function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) return match[1];
  }

  return null;
}

/**
 * Extract Vimeo video ID from URL
 */
function extractVimeoId(url: string): string | null {
  const match = url.match(/(?:vimeo\.com|player\.vimeo\.com)\/(?:video\/)?(\d+)/);
  return match?.[1] || null;
}

/**
 * Parse HTML content to extract video URLs (used as fallback)
 */
function extractVideoUrlFromHtml(html: string): ExtractedVideo | null {
  // Look for video.js player with data-setup-lazy containing YouTube video URL
  const videoJsMatch = html.match(/data-setup-lazy=["']({[^"']*"src"[^"']*})["']/);
  if (videoJsMatch?.[1]) {
    try {
      // Decode HTML entities
      const jsonStr = videoJsMatch[1]
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&')
        .replace(/&#039;/g, "'");
      
      const config = JSON.parse(jsonStr);
      if (config.sources && Array.isArray(config.sources)) {
        for (const source of config.sources) {
          if (source.src) {
            console.log('✅ Found video.js source:', source.src);
            return analyzeUrl(source.src);
          }
        }
      }
    } catch (e) {
      console.warn('⚠️ Failed to parse video.js config');
    }
  }

  // Look for YouTube embed in iframe (most common in Moodle)
  const youtubeIframe = html.match(/<iframe[^>]*src=["']([^"']*(?:youtube|youtu\.be)[^"']*?)["']/i);
  if (youtubeIframe?.[1]) {
    console.log('✅ Found YouTube iframe:', youtubeIframe[1]);
    return analyzeUrl(youtubeIframe[1]);
  }

  // Look for Vimeo embed in iframe
  const vimeoIframe = html.match(/<iframe[^>]*src=["']([^"']*vimeo[^"']*?)["']/i);
  if (vimeoIframe?.[1]) {
    console.log('✅ Found Vimeo iframe:', vimeoIframe[1]);
    return analyzeUrl(vimeoIframe[1]);
  }

  // Look for direct video file in iframe
  const videoIframe = html.match(/<iframe[^>]*src=["']([^"']*\.(?:mp4|webm|ogg|mov)[^"']*?)["']/i);
  if (videoIframe?.[1]) {
    console.log('✅ Found video iframe:', videoIframe[1]);
    return analyzeUrl(videoIframe[1]);
  }

  // Look for redirects in meta tags
  const metaRefresh = html.match(/<meta\s+http-equiv=["']refresh["']\s+content=["'](\d+);\s*url=([^"']+)["']/i);
  if (metaRefresh?.[2]) {
    const redirectUrl = metaRefresh[2];
    console.log('✅ Found meta refresh redirect:', redirectUrl);
    return analyzeUrl(decodeURIComponent(redirectUrl));
  }

  // Look for JavaScript redirects (window.location = 'url')
  const jsRedirect = html.match(/(?:window\.location|top\.location|window\.open)\s*=\s*['"]([^'"]+)['"]/i);
  if (jsRedirect?.[1]) {
    console.log('✅ Found JavaScript redirect:', jsRedirect[1]);
    return analyzeUrl(jsRedirect[1]);
  }

  // Look for general iframe src
  const iframe = html.match(/<iframe[^>]+src=["']([^"']+)["']/i);
  if (iframe?.[1]) {
    console.log('✅ Found iframe:', iframe[1]);
    return analyzeUrl(iframe[1]);
  }

  // Look for video tag src
  const video = html.match(/<video[^>]*>[\s\S]*?<source[^>]+src=["']([^"']+)["']/);
  if (video?.[1]) {
    console.log('✅ Found video source tag:', video[1]);
    return analyzeUrl(video[1]);
  }

  // Look for anchor href (direct link)
  const link = html.match(/<a[^>]+href=["']([^"']+(?:youtube|youtu\.be|vimeo|mp4|webm)[^"']*?)["']/i);
  if (link?.[1]) {
    console.log('✅ Found anchor link:', link[1]);
    return analyzeUrl(link[1]);
  }

  console.warn('⚠️ No video URLs found in HTML');
  return null;
}

/**
 * Analyze URL and determine video type
 */
function analyzeUrl(url: string): ExtractedVideo | null {
  if (!url) return null;

  // YouTube
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    const videoId = extractYouTubeId(url);
    if (videoId) {
      return {
        type: 'youtube',
        videoUrl: `https://www.youtube.com/embed/${videoId}`,
        videoId,
      };
    }
  }

  // Vimeo
  if (url.includes('vimeo.com') || url.includes('player.vimeo.com')) {
    const videoId = extractVimeoId(url);
    if (videoId) {
      return {
        type: 'vimeo',
        videoUrl: `https://player.vimeo.com/video/${videoId}`,
        videoId,
      };
    }
  }

  // Direct video file
  if (url.match(/\.(mp4|webm|ogg|mov|m4v|flv|avi|mkv)(\?|$)/i)) {
    return {
      type: 'direct',
      videoUrl: url,
    };
  }

  // Unknown - still return the URL in case it's a valid video link
  return {
    type: 'unknown',
    videoUrl: url,
  };
}

/**
 * Fetch module details via Moodle API
 */
async function getModuleViaAPI(moduleId: string, userToken?: string): Promise<ExtractedVideo | null> {
  try {
    console.log(`📡 Fetching module ${moduleId} via Moodle API...`);

    // Determine which token to use
    const token = userToken || MOODLE_TOKEN;
    if (!token) {
      console.warn('⚠️ No token available for API call');
      return null;
    }

    // Create HTTPS agent
    const agent = new https.Agent({
      rejectUnauthorized: false,
    });

    // Call Moodle API to get course module info
    const apiUrl = new URL(`${MOODLE_URL}/webservice/rest/server.php`);
    apiUrl.searchParams.append('wstoken', token);
    apiUrl.searchParams.append('wsfunction', 'core_course_get_course_module');
    apiUrl.searchParams.append('cmid', moduleId);
    apiUrl.searchParams.append('moodlewsrestformat', 'json');

    const response = await fetch(apiUrl.toString(), {
      method: 'GET',
      signal: AbortSignal.timeout(10000),
      headers: {
        'Accept': 'application/json',
      },
      // @ts-expect-error - agent for HTTPS
      agent: apiUrl.toString().startsWith('https') ? agent : undefined,
    });

    if (!response.ok) {
      console.error(`❌ API call failed: ${response.status}`);
      return null;
    }

    const moduleData = await response.json();
    console.log(`✅ Got module data from API`);

    // Check if there's an error in the response
    if (moduleData.exception || moduleData.errorcode) {
      console.warn(`⚠️ API returned error: ${moduleData.message || moduleData.exception}`);
      return null;
    }

    // The module data should have a 'module' object with instance
    if (moduleData.cm && moduleData.cm.instance) {
      console.log(`📌 Module instance: ${moduleData.cm.instance}`);
      // Now get the actual URL module data
      return await getURLModuleData(moduleData.cm.instance, token);
    }

    return null;
  } catch (error) {
    console.error('❌ Error fetching module via API:', error);
    return null;
  }
}

/**
 * Get URL module data
 */
async function getURLModuleData(urlInstanceId: string, token: string): Promise<ExtractedVideo | null> {
  try {
    console.log(`🔗 Fetching URL module instance ${urlInstanceId}...`);

    const agent = new https.Agent({
      rejectUnauthorized: false,
    });

    // Use mod_url API if available
    const apiUrl = new URL(`${MOODLE_URL}/webservice/rest/server.php`);
    apiUrl.searchParams.append('wstoken', token);
    apiUrl.searchParams.append('wsfunction', 'mod_url_get_urls_by_courses');
    apiUrl.searchParams.append('moodlewsrestformat', 'json');

    const response = await fetch(apiUrl.toString(), {
      method: 'GET',
      signal: AbortSignal.timeout(10000),
      // @ts-expect-error - agent for HTTPS
      agent: apiUrl.toString().startsWith('https') ? agent : undefined,
    });

    if (response.ok) {
      const data = await response.json() as { urls?: Array<{ id: number; externalurl: string }> };
      if (data.urls && Array.isArray(data.urls)) {
        const urlModule = data.urls.find((u) => u.id === parseInt(urlInstanceId));
        if (urlModule && urlModule.externalurl) {
          console.log(`✅ Got URL from API: ${urlModule.externalurl}`);
          return analyzeUrl(urlModule.externalurl);
        }
      }
    }

    return null;
  } catch (error) {
    console.error('❌ Error fetching URL module data:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const moodleUrlModuleUrl = request.nextUrl.searchParams.get('url');

    if (!moodleUrlModuleUrl) {
      return NextResponse.json(
        { error: 'Missing url parameter' },
        { status: 400 }
      );
    }

    const decodedUrl = decodeURIComponent(moodleUrlModuleUrl);

    // Check if this is a Moodle URL module page
    if (!decodedUrl.includes('/mod/url/view.php')) {
      // If it's already a direct video URL, just analyze it
      const analyzed = analyzeUrl(decodedUrl);
      if (analyzed) {
        return NextResponse.json(analyzed);
      }
      return NextResponse.json(
        { error: 'Invalid Moodle URL module URL' },
        { status: 400 }
      );
    }

    // Extract module ID from URL
    const moduleIdMatch = decodedUrl.match(/[?&]id=(\d+)/);
    if (!moduleIdMatch) {
      return NextResponse.json(
        { error: 'Could not extract module ID' },
        { status: 400 }
      );
    }

    const moduleId = moduleIdMatch[1];
    
    // Get user's Moodle token from session
    const session = await getServerSession();
    const userToken = (session?.user as { token?: string })?.token;

    // Try to get module data via API
    const extracted = await getModuleViaAPI(moduleId, userToken);

    if (!extracted) {
      return NextResponse.json(
        { error: 'Could not extract video URL from module' },
        { status: 404 }
      );
    }

    return NextResponse.json(extracted);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Video URL extraction error:', errorMessage);
    return NextResponse.json(
      { error: 'Failed to extract video URL', details: errorMessage },
      { status: 500 }
    );
  }
}
