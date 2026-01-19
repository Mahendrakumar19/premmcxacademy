'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { secureStreamingAPI, type TokenResponse } from '@/lib/secure-streaming';

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

/**
 * Secure Video Player Component
 * Plays HLS-streamed videos with token-based access control
 * No downloads allowed, secure access tracking
 */
export default function SecureVideoPlayer({
  courseId,
  moduleId,
  title,
  onProgressUpdate,
}: SecureVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<any>(null);
  const tokenRefreshRef = useRef<NodeJS.Timeout | null>(null);

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
      const tokenData: TokenResponse =
        await secureStreamingAPI.getVideoToken(courseId, moduleId);

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
      const newTokenData = await secureStreamingAPI.refreshToken(
        state.refreshToken
      );
      setState((prev) => ({
        ...prev,
        token: newTokenData.token,
        refreshToken: newTokenData.refresh_token || prev.refreshToken,
        tokenExpiry: Date.now() + newTokenData.expires_in * 1000,
      }));
    } catch (error) {
      console.error('[SecureVideoPlayer] Token refresh failed:', error);
      setState((prev) => ({
        ...prev,
        error: 'Session expired. Please refresh the page.',
      }));
    }
  }, [state.refreshToken]);

  /**
   * Initialize token request on mount
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
   * Initialize HLS player when token is available
   */
  useEffect(() => {
    if (!state.token || !videoRef.current) return;

    const video = videoRef.current;
    const masterUrl = secureStreamingAPI.buildStreamingUrl(
      state.token,
      'master',
      'master.m3u8',
      courseId,
      moduleId
    );

    // Check if HLS.js is available (will be loaded dynamically if needed)
    const initHLS = async () => {
      try {
        const HLS = (await import('hls.js')).default;

        if (HLS.isSupported()) {
          const hls = new HLS({
            debug: false,
            enableWorker: true,
            lowLatencyMode: true,
          });

          hls.on(HLS.Events.MANIFEST_PARSED, () => {
            console.log('[SecureVideoPlayer] HLS manifest loaded');
          });

          hls.on(HLS.Events.ERROR, (event, data) => {
            if (data.fatal) {
              console.error('[SecureVideoPlayer] HLS error:', data);
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
      } catch (error) {
        console.error('[SecureVideoPlayer] Error initializing HLS:', error);
        // Fallback: try native HLS
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = masterUrl;
        }
      }
    };

    initHLS();

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
    secureStreamingAPI.logWatchEvent(courseId, moduleId, 'start', 0);
  }, [courseId, moduleId]);

  const handlePause = useCallback(() => {
    setState((prev) => ({ ...prev, isPlaying: false }));
    if (videoRef.current) {
      secureStreamingAPI.logWatchEvent(
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
  }, [onProgressUpdate]);

  const handleSeek = useCallback(() => {
    if (!videoRef.current) return;
    secureStreamingAPI.logWatchEvent(
      courseId,
      moduleId,
      'seek',
      videoRef.current.currentTime
    );
  }, [courseId, moduleId]);

  const handleEnded = useCallback(() => {
    secureStreamingAPI.logWatchEvent(courseId, moduleId, 'end', state.duration);
  }, [courseId, moduleId, state.duration]);

  // Render loading state
  if (state.isLoading) {
    return (
      <div className="w-full aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4" />
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
          <p className="text-lg font-semibold mb-2">⚠️ Video Error</p>
          <p className="text-sm">{state.error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
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
          Moodle&apos;s secure streaming system. Downloads and unauthorized
          sharing are not permitted.
        </p>
      </div>
    </div>
  );
}
