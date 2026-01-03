/**
 * Zoom Integration Utilities
 * Handles Zoom meeting creation and management
 */

interface ZoomMeetingConfig {
  topic: string;
  type: number; // 1 = instant, 2 = scheduled, 3 = recurring, 8 = recurring no fixed time
  duration: number; // in minutes
  timezone: string;
  start_time?: string; // ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ)
  settings?: {
    host_video?: boolean;
    participant_video?: boolean;
    join_before_host?: boolean;
    waiting_room?: boolean;
    recording?: 'local' | 'cloud' | 'none';
    watermark?: boolean;
  };
}

interface ZoomMeetingResponse {
  id: number;
  uuid: string;
  host_id: string;
  topic: string;
  type: number;
  status?: string;
  start_time?: string;
  duration: number;
  timezone: string;
  created_at: string;
  join_url: string;
  start_url: string;
}

/**
 * Create a Zoom meeting
 * Requires ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID, and ZOOM_CLIENT_SECRET env vars
 */
export async function createZoomMeeting(config: ZoomMeetingConfig): Promise<ZoomMeetingResponse | null> {
  try {
    const accountId = process.env.ZOOM_ACCOUNT_ID;
    const clientId = process.env.ZOOM_CLIENT_ID;
    const clientSecret = process.env.ZOOM_CLIENT_SECRET;

    if (!accountId || !clientId || !clientSecret) {
      console.warn('Zoom credentials not configured. Returning mock meeting.');
      return generateMockMeeting(config);
    }

    // Get access token
    const token = await getZoomAccessToken(clientId, clientSecret, accountId);

    // Create meeting
    const response = await fetch('https://api.zoom.us/v2/users/me/meetings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        topic: config.topic,
        type: config.type,
        duration: config.duration,
        timezone: config.timezone,
        start_time: config.start_time,
        settings: config.settings || {
          host_video: true,
          participant_video: true,
          join_before_host: true,
          waiting_room: false,
          recording: 'cloud',
          watermark: true
        }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Zoom API Error:', error);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating Zoom meeting:', error);
    return null;
  }
}

/**
 * Get Zoom access token using Server-to-Server OAuth
 */
async function getZoomAccessToken(clientId: string, clientSecret: string, accountId: string): Promise<string> {
  try {
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const response = await fetch('https://zoom.us/oauth/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=account_credentials&account_id=' + accountId
    });

    if (!response.ok) {
      throw new Error(`Failed to get Zoom access token: ${response.statusText}`);
    }

    const data = await response.json() as { access_token: string };
    return data.access_token;
  } catch (error) {
    console.error('Error getting Zoom access token:', error);
    throw error;
  }
}

/**
 * Generate a Zoom meeting URL (for dev/demo purposes)
 */
export function generateZoomMeetingUrl(meetingId: string | number): string {
  return `https://zoom.us/j/${meetingId}`;
}

/**
 * Generate a mock Zoom meeting response for development
 */
function generateMockMeeting(config: ZoomMeetingConfig): ZoomMeetingResponse {
  const meetingId = Math.floor(Math.random() * 100000000) + 100000000;
  const uuid = `${meetingId}:${Date.now()}`;

  return {
    id: meetingId,
    uuid,
    host_id: 'mock-host-id',
    topic: config.topic,
    type: config.type,
    status: 'waiting',
    start_time: config.start_time,
    duration: config.duration,
    timezone: config.timezone,
    created_at: new Date().toISOString(),
    join_url: generateZoomMeetingUrl(meetingId),
    start_url: `https://zoom.us/wc/join/${uuid}`
  };
}

/**
 * Get Zoom meeting details
 */
export async function getZoomMeeting(meetingId: string | number): Promise<ZoomMeetingResponse | null> {
  try {
    const accountId = process.env.ZOOM_ACCOUNT_ID;
    const clientId = process.env.ZOOM_CLIENT_ID;
    const clientSecret = process.env.ZOOM_CLIENT_SECRET;

    if (!accountId || !clientId || !clientSecret) {
      return null;
    }

    const token = await getZoomAccessToken(clientId, clientSecret, accountId);

    const response = await fetch(`https://api.zoom.us/v2/meetings/${meetingId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting Zoom meeting:', error);
    return null;
  }
}

/**
 * Delete a Zoom meeting
 */
export async function deleteZoomMeeting(meetingId: string | number): Promise<boolean> {
  try {
    const accountId = process.env.ZOOM_ACCOUNT_ID;
    const clientId = process.env.ZOOM_CLIENT_ID;
    const clientSecret = process.env.ZOOM_CLIENT_SECRET;

    if (!accountId || !clientId || !clientSecret) {
      return false;
    }

    const token = await getZoomAccessToken(clientId, clientSecret, accountId);

    const response = await fetch(`https://api.zoom.us/v2/meetings/${meetingId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    return response.ok;
  } catch (error) {
    console.error('Error deleting Zoom meeting:', error);
    return false;
  }
}

/**
 * Get Zoom meeting recordings
 */
export async function getZoomMeetingRecordings(meetingId: string | number) {
  try {
    const accountId = process.env.ZOOM_ACCOUNT_ID;
    const clientId = process.env.ZOOM_CLIENT_ID;
    const clientSecret = process.env.ZOOM_CLIENT_SECRET;

    if (!accountId || !clientId || !clientSecret) {
      return null;
    }

    const token = await getZoomAccessToken(clientId, clientSecret, accountId);

    const response = await fetch(`https://api.zoom.us/v2/meetings/${meetingId}/recordings`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting Zoom recordings:', error);
    return null;
  }
}
