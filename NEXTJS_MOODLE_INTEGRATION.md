# Next.js API Integration for Moodle Secure Streaming

This document shows how to integrate the Moodle secure streaming plugin with your existing Next.js LMS frontend.

---

## 1. Setup Environment Variables

**File: `.env.local`**
```env
# Moodle Backend Configuration
NEXT_PUBLIC_MOODLE_URL=http://localhost:8000
MOODLE_API_TOKEN=your_webservice_token
MOODLE_SERVICE_NAME=local_securestreaming

# Video Storage
NEXT_PUBLIC_VIDEO_PLAYER_TIMEOUT=600000  # 10 minutes in ms
NEXT_PUBLIC_HLS_DEBUG=false
```

**File: `next.config.ts`** - Add image optimization for Moodle:
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/moodle/**',
      },
      {
        protocol: 'https',
        hostname: process.env.MOODLE_DOMAIN || 'example.com',
        pathname: '/moodle/**',
      },
    ],
  },
};

export default nextConfig;
```

---

## 2. Create Moodle API Service

**File: `src/lib/moodle-secure-streaming.ts`**
```typescript
/**
 * Moodle Secure Streaming API Integration
 * Handles video token requests and validation
 */

interface TokenResponse {
  token: string;
  expires_in: number;
  token_type: string;
  refresh_token?: string;
}

interface VideoMetadata {
  id: number;
  courseid: number;
  moduleid: number;
  filename: string;
  duration: number;
  thumbnail_path: string;
  status: 'uploading' | 'processing' | 'ready' | 'failed';
}

class MoodleSecureStreamingAPI {
  private baseUrl: string;
  private sessionToken: string | null = null;

  constructor(moodleUrl: string = process.env.NEXT_PUBLIC_MOODLE_URL || '') {
    this.baseUrl = moodleUrl;
  }

  /**
   * Request a video streaming token from Moodle
   * Must be called only by authenticated users
   */
  async getVideoToken(
    courseId: number,
    moduleId: number,
    sessionToken?: string
  ): Promise<TokenResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}/local/securestreaming/rest/get_video_token.php`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Include Moodle session cookie
          body: JSON.stringify({
            courseid: courseId,
            moduleid: moduleId,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get video token');
      }

      const data: TokenResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting video token:', error);
      throw error;
    }
  }

  /**
   * Refresh an expired token
   */
  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}/local/securestreaming/rest/refresh_token.php`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            refresh_token: refreshToken,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      return await response.json();
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw error;
    }
  }

  /**
   * Get video metadata and availability
   */
  async getVideoMetadata(
    courseId: number,
    moduleId: number
  ): Promise<VideoMetadata> {
    try {
      const response = await fetch(
        `${this.baseUrl}/local/securestreaming/rest/get_video_metadata.php?courseid=${courseId}&moduleid=${moduleId}`,
        {
          method: 'GET',
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to get video metadata');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting video metadata:', error);
      throw error;
    }
  }

  /**
   * Log video watch events
   */
  async logWatchEvent(
    courseId: number,
    moduleId: number,
    event: 'start' | 'pause' | 'resume' | 'end' | 'seek',
    currentTime: number
  ): Promise<void> {
    try {
      await fetch(
        `${this.baseUrl}/local/securestreaming/rest/log_watch_event.php`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            courseid: courseId,
            moduleid: moduleId,
            event,
            current_time: currentTime,
          }),
        }
      );
    } catch (error) {
      // Log errors but don't fail video playback
      console.error('Error logging watch event:', error);
    }
  }

  /**
   * Build HLS streaming URL with token
   */
  buildStreamingUrl(
    token: string,
    fileType: 'master' | 'segment',
    fileName: string
  ): string {
    const type = fileType === 'master' ? 'm3u8' : 'segment';
    return (
      `${this.baseUrl}/local/securestreaming/rest/stream_video.php?` +
      `type=${type}&file=${encodeURIComponent(fileName)}&token=${token}`
    );
  }
}

// Export singleton instance
export const moodleAPI = new MoodleSecureStreamingAPI();
export type { TokenResponse, VideoMetadata };
```

---

## 3. Update Secure Video Player Component

**File: `src/components/SecureVideoPlayer.tsx`** (Enhanced)
```typescript
'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import HLS from 'hls.js';
import { moodleAPI, type TokenResponse } from '@/lib/moodle-secure-streaming';

interface SecureVideoPlayerProps {
  courseId: number;
  moduleId: number;
  title: string;
  onProgressUpdate?: (progress: number, duration: number) => void;
}

interface PlayerState {
  isLoading: boolean;
  error: string | null;
  token: string | null;
  refreshToken: string | null;
  tokenExpiry: number;
  duration: number;
  currentTime: number;
  isPlaying: boolean;
}

export default function SecureVideoPlayer({
  courseId,
  moduleId,
  title,
  onProgressUpdate,
}: SecureVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<HLS | null>(null);
  const tokenRefreshRef = useRef<NodeJS.Timeout | null>(null);
  const watchEventRef = useRef<{
    lastEventTime: number;
    eventType: 'start' | 'pause' | 'resume' | 'end' | 'seek';
  }>({ lastEventTime: 0, eventType: 'start' });

  const { data: session, status } = useSession();
  const [state, setState] = useState<PlayerState>({
    isLoading: true,
    error: null,
    token: null,
    refreshToken: null,
    tokenExpiry: 0,
    duration: 0,
    currentTime: 0,
    isPlaying: false,
  });

  /**
   * Request token from Moodle backend
   */
  const requestToken = useCallback(async () => {
    if (status !== 'authenticated') {
      setState((prev) => ({
        ...prev,
        error: 'Please log in to watch videos',
        isLoading: false,
      }));
      return;
    }

    try {
      const tokenData: TokenResponse = await moodleAPI.getVideoToken(
        courseId,
        moduleId
      );

      setState((prev) => ({
        ...prev,
        token: tokenData.token,
        refreshToken: tokenData.refresh_token || null,
        tokenExpiry: Date.now() + tokenData.expires_in * 1000,
        isLoading: false,
      }));

      // Set up token refresh timer (refresh 30 seconds before expiry)
      const refreshDelay = Math.max(
        tokenData.expires_in * 1000 - 30000,
        5000
      );
      tokenRefreshRef.current = setTimeout(() => {
        if (tokenData.refresh_token) {
          refreshTokenIfNeeded();
        }
      }, refreshDelay);
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error:
          error instanceof Error ? error.message : 'Failed to get video token',
        isLoading: false,
      }));
    }
  }, [courseId, moduleId, status]);

  /**
   * Refresh token when expired
   */
  const refreshTokenIfNeeded = useCallback(async () => {
    if (!state.refreshToken) return;

    try {
      const newTokenData = await moodleAPI.refreshToken(state.refreshToken);
      setState((prev) => ({
        ...prev,
        token: newTokenData.token,
        refreshToken: newTokenData.refresh_token || prev.refreshToken,
        tokenExpiry: Date.now() + newTokenData.expires_in * 1000,
      }));
    } catch (error) {
      console.error('Token refresh failed:', error);
      // Force re-authentication
      setState((prev) => ({
        ...prev,
        error: 'Session expired. Please refresh the page.',
      }));
    }
  }, [state.refreshToken]);

  /**
   * Initialize HLS streaming
   */
  useEffect(() => {
    requestToken();

    return () => {
      if (tokenRefreshRef.current) {
        clearTimeout(tokenRefreshRef.current);
      }
    };
  }, [courseId, moduleId, requestToken]);

  /**
   * Setup HLS player when token is available
   */
  useEffect(() => {
    if (!state.token || !videoRef.current) return;

    const video = videoRef.current;
    const masterUrl = moodleAPI.buildStreamingUrl(
      state.token,
      'master',
      'master.m3u8'
    );

    if (HLS.isSupported()) {
      const hls = new HLS({
        debug: process.env.NEXT_PUBLIC_HLS_DEBUG === 'true',
        enableWorker: true,
        lowLatencyMode: true,
      });

      hls.on(HLS.Events.MANIFEST_PARSED, () => {
        // Auto-play is disabled by default, let user click play
      });

      hls.on(HLS.Events.ERROR, (event, data) => {
        if (data.fatal) {
          setState((prev) => ({
            ...prev,
            error: `Video error: ${data.error?.message || 'Unknown error'}`,
          }));
        }
      });

      hls.loadSource(masterUrl);
      hls.attachMedia(video);
      hlsRef.current = hls;
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari/iOS)
      video.src = masterUrl;
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [state.token]);

  /**
   * Handle video events for tracking
   */
  const handlePlay = useCallback(() => {
    setState((prev) => ({ ...prev, isPlaying: true }));
    moodleAPI.logWatchEvent(courseId, moduleId, 'start', 0);
  }, [courseId, moduleId]);

  const handlePause = useCallback(() => {
    setState((prev) => ({ ...prev, isPlaying: false }));
    if (videoRef.current) {
      moodleAPI.logWatchEvent(
        courseId,
        moduleId,
        'pause',
        videoRef.current.currentTime
      );
    }
  }, [courseId, moduleId]);

  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current) return;

    const { currentTime, duration } = videoRef.current;
    setState((prev) => ({ ...prev, currentTime, duration }));

    if (onProgressUpdate) {
      onProgressUpdate(currentTime, duration);
    }

    // Send progress events periodically (every 10 seconds)
    const now = Date.now();
    if (
      watchEventRef.current.lastEventTime === 0 ||
      now - watchEventRef.current.lastEventTime > 10000
    ) {
      moodleAPI.logWatchEvent(courseId, moduleId, 'resume', currentTime);
      watchEventRef.current.lastEventTime = now;
    }
  }, [courseId, moduleId, onProgressUpdate]);

  const handleSeek = useCallback(() => {
    if (!videoRef.current) return;
    moodleAPI.logWatchEvent(
      courseId,
      moduleId,
      'seek',
      videoRef.current.currentTime
    );
  }, [courseId, moduleId]);

  const handleEnded = useCallback(() => {
    moodleAPI.logWatchEvent(courseId, moduleId, 'end', state.duration);
  }, [courseId, moduleId, state.duration]);

  // Render loading state
  if (state.isLoading) {
    return (
      <div className="w-full aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading video...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (state.error) {
    return (
      <div className="w-full aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
        <div className="text-red-500 text-center max-w-md">
          <p className="text-lg font-semibold mb-2">Video Error</p>
          <p>{state.error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  // Render video player
  return (
    <div className="w-full">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-600 mt-2">
          {Math.floor(state.currentTime)}s / {Math.floor(state.duration)}s
        </p>
      </div>

      <video
        ref={videoRef}
        controls
        className="w-full rounded-lg bg-black shadow-lg"
        controlsList="nodownload"
        disablePictureInPicture
        onPlay={handlePlay}
        onPause={handlePause}
        onTimeUpdate={handleTimeUpdate}
        onSeeking={handleSeek}
        onEnded={handleEnded}
      />

      <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-gray-700">
          <strong>🔒 Secure Streaming:</strong> This video is protected by
          Moodle's secure streaming system. Downloads and unauthorized sharing
          are not permitted.
        </p>
      </div>
    </div>
  );
}
```

---

## 4. Create API Route for Backend Integration

**File: `src/app/api/moodle/video-token/route.ts`**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

/**
 * GET /api/moodle/video-token
 * Get a video streaming token from Moodle
 * 
 * Query params:
 *   - courseId: number
 *   - moduleId: number
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    const moduleId = searchParams.get('moduleId');

    if (!courseId || !moduleId) {
      return NextResponse.json(
        { error: 'Missing courseId or moduleId' },
        { status: 400 }
      );
    }

    // Call Moodle API
    const moodleUrl = process.env.NEXT_PUBLIC_MOODLE_URL;
    const response = await fetch(
      `${moodleUrl}/local/securestreaming/rest/get_video_token.php`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseid: parseInt(courseId),
          moduleid: parseInt(moduleId),
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.error || 'Failed to get token' },
        { status: response.status }
      );
    }

    const tokenData = await response.json();
    
    return NextResponse.json(tokenData, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Error getting video token:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

## 5. Create Course Module Display Component

**File: `src/components/CourseModule.tsx`**
```typescript
'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import SecureVideoPlayer from './SecureVideoPlayer';
import { moodleAPI, type VideoMetadata } from '@/lib/moodle-secure-streaming';

interface CourseModuleProps {
  courseId: number;
  moduleId: number;
}

export default function CourseModule({ courseId, moduleId }: CourseModuleProps) {
  const { data: session, status } = useSession();
  const [video, setVideo] = useState<VideoMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (status !== 'authenticated') {
      setError('Please log in to view course content');
      setLoading(false);
      return;
    }

    const fetchVideo = async () => {
      try {
        const metadata = await moodleAPI.getVideoMetadata(courseId, moduleId);
        setVideo(metadata);
        setLoading(false);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load video'
        );
        setLoading(false);
      }
    };

    fetchVideo();
  }, [courseId, moduleId, status]);

  if (loading) {
    return <div className="animate-pulse">Loading module...</div>;
  }

  if (error || !video) {
    return (
      <div className="p-4 bg-red-50 rounded-lg border border-red-200">
        <p className="text-red-700">{error || 'Video not available'}</p>
      </div>
    );
  }

  if (video.status !== 'ready') {
    return (
      <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
        <p className="text-yellow-700">
          {video.status === 'processing'
            ? 'Video is being processed. Please check back later.'
            : 'Video is not available.'}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <SecureVideoPlayer
        courseId={courseId}
        moduleId={moduleId}
        title={video.filename}
        onProgressUpdate={(currentTime, duration) => {
          const percentage = (currentTime / duration) * 100;
          setProgress(percentage);
        }}
      />

      <div className="mt-6 bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Video Progress</h3>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-gray-600 mt-2">
          {Math.round(progress)}% watched
        </p>
      </div>
    </div>
  );
}
```

---

## 6. Usage in Course Page

**File: `src/app/courses/[id]/modules/[moduleid]/page.tsx`**
```typescript
import { notFound } from 'next/navigation';
import CourseModule from '@/components/CourseModule';

export default async function ModulePage({
  params,
}: {
  params: Promise<{ id: string; moduleid: string }>;
}) {
  const { id, moduleid } = await params;

  const courseId = parseInt(id);
  const moduleId = parseInt(moduleid);

  if (isNaN(courseId) || isNaN(moduleId)) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8">
      <CourseModule courseId={courseId} moduleId={moduleId} />
    </div>
  );
}
```

---

## 7. Configuration & Testing

### Add to your package.json:
```json
{
  "dependencies": {
    "hls.js": "^1.4.0"
  },
  "devDependencies": {
    "@types/hls.js": "^0.13.0"
  }
}
```

### Environment setup:
```bash
npm install hls.js

# Update .env.local
NEXT_PUBLIC_MOODLE_URL=http://localhost:8000
NEXT_PUBLIC_HLS_DEBUG=false
```

### Test the integration:
```bash
# 1. Start Moodle server
cd /path/to/moodle
php -S localhost:8000

# 2. Start Next.js dev server
npm run dev

# 3. Navigate to a course with videos
# http://localhost:3000/courses/2/modules/5

# 4. Check browser console for:
# - Token request success
# - HLS manifest loaded
# - Video metadata fetched
```

---

## 8. Monitoring & Debugging

### Add HLS debugging:
```typescript
// Enable HLS.js debug mode
const hls = new HLS({
  debug: true,  // This will log all HLS events to console
});
```

### Monitor in Moodle:
```bash
# Check access logs
SELECT * FROM mdl_local_securestreaming_logs 
ORDER BY timestamp DESC LIMIT 100;

# Check token generation
SELECT * FROM mdl_local_securestreaming_tokens 
WHERE revoked = 0 
ORDER BY created DESC;
```

### Browser DevTools tips:
1. **Network tab**: Check stream_video.php requests
   - Should return 200 with valid token
   - Should return 403 with invalid token
2. **Console**: HLS.js will log all events
3. **Storage**: Check for Moodle session cookies

