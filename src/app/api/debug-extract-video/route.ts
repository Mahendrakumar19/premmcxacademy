/**
 * Debug endpoint to check what Moodle URL modules return
 */

import { NextRequest, NextResponse } from 'next/server';
import https from 'https';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const moodleUrl = searchParams.get('url');

  if (!moodleUrl) {
    return NextResponse.json({ error: 'url parameter required' }, { status: 400 });
  }

  console.log('🔍 DEBUG: Fetching Moodle URL:', moodleUrl);

  try {
    const agent = new https.Agent({
      rejectUnauthorized: false,
    });

    const response = await fetch(moodleUrl, {
      method: 'GET',
      signal: AbortSignal.timeout(15000),
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      // @ts-expect-error - agent option for HTTPS with self-signed cert
      agent: moodleUrl.startsWith('https') ? agent : undefined,
    });

    const html = await response.text();

    // Extract all iframes
    const iframes = html.match(/<iframe[^>]*>/g) || [];
    
    // Extract all meta tags
    const metas = html.match(/<meta[^>]*>/g) || [];
    
    // Extract all scripts (first 500 chars of each)
    const scripts = (html.match(/<script[^>]*>[\s\S]*?<\/script>/g) || []).slice(0, 3).map(s => s.substring(0, 500));
    
    // Look for specific patterns
    const hasYouTube = html.includes('youtube') || html.includes('youtu.be');
    const hasVimeo = html.includes('vimeo');
    const hasRefresh = html.includes('http-equiv="refresh"');
    const hasWindowLocation = /window\.location\s*=/.test(html);

    return NextResponse.json({
      moodleUrl,
      statusCode: response.status,
      htmlLength: html.length,
      firstChars: html.substring(0, 500),
      hasYouTube,
      hasVimeo,
      hasRefresh,
      hasWindowLocation,
      iframeCount: iframes.length,
      iframes: iframes.slice(0, 3),
      metaTags: metas.slice(0, 5),
      scripts: scripts,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Debug error:', errorMessage);
    return NextResponse.json(
      { error: 'Failed to debug extract', details: errorMessage },
      { status: 500 }
    );
  }
}
