/**
 * Secure Video Streaming Integration
 * Client library for requesting JWT tokens and building streaming URLs
 * Uses Next.js API routes for token generation and streaming proxy
 */

interface TokenResponse {
  token: string;
  expires_in: number;
  token_type: string;
  refresh_token?: string;
  courseId: number;
  moduleId: number;
}

interface VideoMetadata {
  id: number;
  courseid: number;
  moduleid: number;
  filename: string;
  duration: number;
  thumbnail_path?: string;
  status: 'uploading' | 'processing' | 'ready' | 'failed';
}

class SecureStreamingAPI {
  private baseUrl: string;

  constructor() {
    // Use Next.js API routes (client-side calls)
    this.baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  }

  /**
   * Request a video streaming token from Next.js API
   * Requires user to be authenticated and enrolled in the course
   */
  async getVideoToken(
    courseId: number,
    moduleId: number
  ): Promise<TokenResponse> {
    try {
      const response = await fetch(
        `/api/secure-streaming/token?courseId=${courseId}&moduleId=${moduleId}`,
        {
          method: 'GET',
          credentials: 'include', // Include session cookie
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(
          error.error || `HTTP ${response.status}: Failed to get video token`
        );
      }

      const data: TokenResponse = await response.json();
      console.log('[SecureStreaming] ✓ Token obtained for course:', courseId, 'module:', moduleId);
      return data;
    } catch (error) {
      console.error('[SecureStreaming] Error getting video token:', error);
      throw error;
    }
  }

  /**
   * Refresh an expired token using the refresh token
   */
  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    try {
      const response = await fetch('/api/secure-streaming/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          refresh_token: refreshToken,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to refresh token`);
      }

      const data = await response.json();
      console.log('[SecureStreaming] ✓ Token refreshed');
      return data;
    } catch (error) {
      console.error('[SecureStreaming] Error refreshing token:', error);
      throw error;
    }
  }

  /**
   * Get video metadata from Moodle
   * Note: This endpoint needs to be implemented in Moodle or as Next.js API route
   */
  async getVideoMetadata(
    courseId: number,
    moduleId: number
  ): Promise<VideoMetadata | null> {
    try {
      // For now, return mock data. In production, implement API endpoint
      console.warn('[SecureStreaming] getVideoMetadata not yet implemented - returning mock data');
      return {
        id: moduleId,
        courseid: courseId,
        moduleid: moduleId,
        filename: 'video.mp4',
        duration: 0,
        status: 'ready',
      };
    } catch (error) {
      console.error('[SecureStreaming] Error getting video metadata:', error);
      return null;
    }
  }

  /**
   * Log video watch events for analytics
   * Note: This should be implemented as Next.js API route for production
   */
  async logWatchEvent(
    courseId: number,
    moduleId: number,
    event: 'start' | 'pause' | 'resume' | 'end' | 'seek',
    currentTime: number
  ): Promise<void> {
    try {
      // Log to console for now. In production, implement API endpoint
      console.log('[SecureStreaming] Watch event:', {
        courseId,
        moduleId,
        event,
        currentTime,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('[SecureStreaming] Error logging watch event:', error);
    }
  }

  /**
   * Build secure HLS streaming URL with JWT token
   * Routes through Next.js proxy for token validation
   */
  buildStreamingUrl(
    token: string,
    fileType: 'master' | 'playlist' | 'segment',
    fileName: string,
    courseId: number,
    moduleId: number
  ): string {
    const params = new URLSearchParams({
      token,
      type: fileType,
      file: fileName,
      courseId: courseId.toString(),
      moduleId: moduleId.toString(),
    });

    return `/api/secure-streaming/stream?${params.toString()}`;
  }

  /**
   * Validate if a token is still valid (not expired)
   */
  isTokenValid(tokenResponse: TokenResponse): boolean {
    // Simple check - in production, parse JWT and check exp claim
    return !!tokenResponse.token;
  }
}

// Export singleton instance
export const secureStreamingAPI = new SecureStreamingAPI();
export type { TokenResponse, VideoMetadata };
