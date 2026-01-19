# Quick Start: Implementation Checklist & Code Examples

## Phase 1: Setup (Week 1)

### 1. Create Plugin Directory Structure
```bash
mkdir -p /var/www/moodle/local/securestreaming/{classes,db,lang/en,rest}
```

### 2. Create `version.php`
```php
<?php
defined('MOODLE_INTERNAL') || die();

$plugin->component = 'local_securestreaming';
$plugin->version   = 2024011301;
$plugin->requires  = 2022112800;
$plugin->maturity  = MATURITY_BETA;
$plugin->release   = '1.0';
$plugin->cron      = 3600;
```

### 3. Create `db/install.xml` (Database schema)
See SECURE_VIDEO_STREAMING_GUIDE.md for full schema.

---

## Phase 2: Core Classes (Week 1-2)

### Copy these files from the guide:

1. **`classes/token_service.php`** - JWT token generation & validation
2. **`classes/enrolment_checker.php`** - User permission validation
3. **`classes/access_logger.php`** - Audit trail logging

### Test token generation:
```php
<?php
require_once(__DIR__ . '/../../../config.php');
require_login();

$token_service = new \local_securestreaming\token_service();
try {
    $token_data = $token_service->generate_token($USER->id, 2, 5);
    echo "Token: " . $token_data['token'];
    echo "<br>Expires in: " . $token_data['expires_in'] . " seconds";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
```

---

## Phase 3: REST Endpoints (Week 2)

### Create `rest/get_video_token.php`
```php
<?php
namespace local_securestreaming\rest;

defined('MOODLE_INTERNAL') || die();

require_once(__DIR__ . '/../classes/token_service.php');
require_once(__DIR__ . '/../classes/enrolment_checker.php');

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit;
}

try {
    $input = json_decode(file_get_contents('php://input'), true);
    $courseid = (int)($input['courseid'] ?? 0);
    $moduleid = (int)($input['moduleid'] ?? 0);
    
    require_once(__DIR__ . '/../../../../config.php');
    require_login();
    
    $enrolment_checker = new \local_securestreaming\enrolment_checker();
    if (!$enrolment_checker->can_access_video($USER->id, $moduleid, $courseid)) {
        http_response_code(403);
        echo json_encode(['error' => 'Access denied']);
        exit;
    }
    
    $token_service = new \local_securestreaming\token_service();
    $token_data = $token_service->generate_token($USER->id, $courseid, $moduleid);
    
    echo json_encode($token_data);
    
} catch (Exception $e) {
    http_response_code(401);
    echo json_encode(['error' => $e->getMessage()]);
}
```

### Create `rest/stream_video.php`
```php
<?php
namespace local_securestreaming\rest;

defined('MOODLE_INTERNAL') || die();

require_once(__DIR__ . '/../classes/token_service.php');

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, HEAD, OPTIONS');

try {
    $token = $_GET['token'] ?? '';
    if (empty($token)) {
        throw new Exception('No token provided');
    }
    
    $token_service = new \local_securestreaming\token_service();
    $payload = $token_service->verify_token($token);
    
    if (!$payload) {
        http_response_code(403);
        exit('Invalid token');
    }
    
    $type = $_GET['type'] ?? 'segment';
    $file = $_GET['file'] ?? '';
    
    if (empty($file) || strpos($file, '..') !== false) {
        http_response_code(400);
        exit('Invalid file');
    }
    
    // Serve HLS file based on storage backend
    $storage_path = get_config('local_securestreaming', 'hls_storage_path');
    $file_path = rtrim($storage_path, '/') . '/' . $file;
    
    if (file_exists($file_path)) {
        if ($type === 'm3u8') {
            header('Content-Type: application/vnd.apple.mpegurl');
        } else {
            header('Content-Type: video/mp2t');
        }
        readfile($file_path);
    } else {
        http_response_code(404);
    }
    
} catch (Exception $e) {
    http_response_code(403);
    echo $e->getMessage();
}
```

### Test endpoints:
```bash
# 1. Get token
curl -X POST http://localhost/moodle/local/securestreaming/rest/get_video_token.php \
  -H "Content-Type: application/json" \
  -d '{"courseid": 2, "moduleid": 5}' \
  -b "MoodleSession=xxx"

# 2. Stream HLS playlist
curl "http://localhost/moodle/local/securestreaming/rest/stream_video.php?token=XXX&type=m3u8&file=master.m3u8"
```

---

## Phase 4: Next.js Integration (Week 2-3)

### Create `src/components/SecureVideoPlayer.tsx`
```typescript
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import HLS from 'hls.js';

interface SecureVideoPlayerProps {
  courseId: number;
  moduleId: number;
  title: string;
}

export default function SecureVideoPlayer({ 
  courseId, 
  moduleId, 
  title 
}: SecureVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status !== 'authenticated') {
      setError('Please log in to watch videos');
      return;
    }

    const requestToken = async () => {
      try {
        // Call Moodle API to get streaming token
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_MOODLE_URL}/local/securestreaming/rest/get_video_token.php`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include', // Send Moodle session cookie
            body: JSON.stringify({
              courseid: courseId,
              moduleid: moduleId,
            }),
          }
        );

        if (!response.ok) {
          throw new Error('Failed to get streaming token');
        }

        const data = await response.json();
        setToken(data.token);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
      }
    };

    requestToken();
  }, [courseId, moduleId, status]);

  useEffect(() => {
    if (!token || !videoRef.current) return;

    const video = videoRef.current;
    let hls: HLS | null = null;

    const hlsUrl = `${process.env.NEXT_PUBLIC_MOODLE_URL}/local/securestreaming/rest/stream_video.php?type=m3u8&file=master.m3u8&token=${token}`;

    if (HLS.isSupported()) {
      hls = new HLS({
        debug: false,
        enableWorker: true,
      });

      hls.loadSource(hlsUrl);
      hls.attachMedia(video);

      hls.on(HLS.Events.ERROR, (event, data) => {
        if (data.fatal) {
          setError('Video playback error');
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = hlsUrl;
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [token]);

  if (loading) {
    return (
      <div className="w-full aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
        <div className="text-white">Loading video...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <video
        ref={videoRef}
        controls
        className="w-full rounded-lg bg-black"
        controlsList="nodownload"
        disablePictureInPicture
      />
    </div>
  );
}
```

### Use in course page:
```typescript
// src/app/courses/[id]/modules/[moduleid]/page.tsx
import SecureVideoPlayer from '@/components/SecureVideoPlayer';

export default function ModulePage({ 
  params 
}: { 
  params: { id: string; moduleid: string } 
}) {
  return (
    <div>
      <SecureVideoPlayer
        courseId={parseInt(params.id)}
        moduleId={parseInt(params.moduleid)}
        title="Lesson 1: Introduction"
      />
    </div>
  );
}
```

---

## Phase 5: Video Processing (Week 3-4)

### Setup FFmpeg HLS Transcoding

```bash
# Install FFmpeg
apt-get install ffmpeg

# Create video processing script
cat > /opt/moodle/scripts/process_video.sh << 'EOF'
#!/bin/bash

INPUT_FILE="$1"
OUTPUT_DIR="$2"

# Transcode to HLS with multiple bitrates
ffmpeg -i "$INPUT_FILE" \
  -preset slow \
  -c:v libx264 \
  -c:a aac \
  -b:v 2500k \
  -maxrate 2500k \
  -bufsize 5000k \
  -hls_time 6 \
  -hls_list_size 0 \
  -f hls \
  "$OUTPUT_DIR/master.m3u8"

echo "Success"
EOF

chmod +x /opt/moodle/scripts/process_video.sh
```

### Queue system in `lib.php`:
```php
<?php

function local_securestreaming_cron() {
    global $DB;
    
    // Get pending videos
    $pending = $DB->get_records('local_securestreaming_videos', 
        ['status' => 'uploading'], '', '', 0, 1);
    
    foreach ($pending as $video) {
        try {
            $storage_path = get_config('local_securestreaming', 'hls_storage_path');
            $output_dir = $storage_path . '/' . $video->id;
            
            @mkdir($output_dir, 0755, true);
            
            // Run FFmpeg
            shell_exec(
                '/opt/moodle/scripts/process_video.sh ' .
                escapeshellarg($video->storage_path) . ' ' .
                escapeshellarg($output_dir) .
                ' >> /tmp/ffmpeg_' . $video->id . '.log 2>&1 &'
            );
            
            // Update status
            $video->status = 'processing';
            $video->hls_master_path = $output_dir;
            $DB->update_record('local_securestreaming_videos', $video);
            
        } catch (Exception $e) {
            mtrace("Error processing video {$video->id}: " . $e->getMessage());
        }
    }
    
    return true;
}
```

---

## Phase 6: Security Hardening (Week 4)

### Add `.htaccess` protection:
```apache
# Block direct access to video files
<FilesMatch "\.(ts|m3u8|mp4|mov)$">
    Order allow,deny
    Deny from all
</FilesMatch>

# Only allow via streaming endpoint
<Location "/local/securestreaming/rest/stream_video.php">
    Order allow,deny
    Allow from all
</Location>
```

### Add rate limiting:
```php
<?php
function local_securestreaming_rate_limit($userid, $action = 'token_request') {
    global $DB;
    
    $limit = 100; // 100 requests
    $window = 3600; // per hour
    $cutoff = time() - $window;
    
    $count = $DB->count_records_select(
        'local_securestreaming_logs',
        'userid = ? AND action = ? AND timestamp > ?',
        [$userid, $action, $cutoff]
    );
    
    return $count < $limit;
}
```

---

## Testing Checklist

```
✓ Token generation
  - POST /local/securestreaming/rest/get_video_token.php
  - Response: valid JWT with 10-min expiry

✓ Token validation
  - Token expires correctly
  - Invalid tokens rejected
  - Revoked tokens rejected

✓ Enrolment checks
  - Unenrolled users cannot get tokens
  - Unenrolled users cannot stream

✓ HLS streaming
  - Master playlist (.m3u8) serves correctly
  - Segments (.ts files) serve with token
  - Invalid tokens return 403

✓ Access logging
  - All access logged
  - Unauthorized attempts logged
  - IP address recorded

✓ Player integration
  - Video plays in browser
  - Download button disabled
  - PiP disabled
  - Seeks work correctly

✓ Unenrolment
  - User tokens revoked on unenrol
  - User cannot access after unenrol
```

---

## Deployment Checklist

```
PRE-PRODUCTION
✓ JWT secret generated and secured
✓ Database tables created
✓ File permissions correct (755 for directories, 644 for files)
✓ FFmpeg installed and working
✓ Video storage location created
✓ SSL/TLS certificates valid
✓ CORS properly configured
✓ Token lifetime configured
✓ Rate limiting enabled

MONITORING
✓ Log rotation configured
✓ Cron job scheduled
✓ Database backups setup
✓ Error logging enabled
✓ Token expiration alerts setup
✓ Disk space monitoring
✓ Video processing queue monitoring

SECURITY
✓ Direct file access blocked
✓ Only authenticated users get tokens
✓ Only enrolled users stream
✓ Tokens expire quickly
✓ IP validation enabled (optional)
✓ Access logs archived
```

---

## Common Issues & Solutions

### Issue: "Invalid signature"
```
Cause: JWT secret not matching between generation and validation
Fix: Ensure same secret in both token_service instances
Debug: echo get_config('local_securestreaming', 'jwt_secret');
```

### Issue: "User not enrolled"
```
Cause: User doesn't have active enrolment
Fix: Check enrolment in Moodle admin
Debug: Check local_securestreaming_logs for denied attempts
```

### Issue: Video won't play
```
Cause: HLS streaming not working
Fix:
1. Check FFmpeg processing: curl "http://moodle/local/securestreaming/rest/stream_video.php?token=XXX&type=m3u8&file=master.m3u8"
2. Verify HLS.js is loaded: Check browser console
3. Check CORS headers: curl -I endpoint
4. Verify token not expired
```

### Issue: CORS errors
```
Cause: Browser blocking cross-origin requests
Fix: Add proper CORS headers in stream_video.php:
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Credentials: true');
```

---

## Performance Tuning

```
TOKEN GENERATION
- Cache tokens for 5 minutes (not per request)
- Use Redis for faster token lookups
- Index on user_id + course_id

HLS STREAMING
- Use CDN for segment delivery
- Enable HTTP/2 for parallel requests
- Set appropriate caching headers for segments

DATABASE
- Index local_securestreaming_tokens(user_id, course_id)
- Index local_securestreaming_logs(timestamp)
- Archive logs older than 90 days

TRANSCODING
- Use hardware encoding (NVIDIA/Intel)
- Parallel encoding for multiple videos
- Store encoded videos on SSD (not HDD)
```

