# Secure Video Streaming - Implementation Guide

## ✅ What's Been Implemented

### 1. **JWT Token Generation API** (`/api/secure-streaming/token`)
- **Location**: `src/app/api/secure-streaming/token/route.ts`
- **Features**:
  - ✅ Session authentication via next-auth
  - ✅ Course enrollment verification from Moodle
  - ✅ JWT token generation with 2-hour expiry
  - ✅ Refresh token support (7-day expiry)
  - ✅ Secure claims: userId, courseId, moduleId, email
  - ✅ Token refresh endpoint (POST)

### 2. **HLS Streaming Proxy** (`/api/secure-streaming/stream`)
- **Location**: `src/app/api/secure-streaming/stream/route.ts`
- **Features**:
  - ✅ JWT token validation on every request
  - ✅ Token-resource matching (prevents token reuse)
  - ✅ HLS master playlist + segment proxying
  - ✅ CORS headers for cross-origin streaming
  - ✅ Access logging for analytics
  - ✅ Proper content-type headers for video

### 3. **Client Library** (`src/lib/secure-streaming.ts`)
- **Features**:
  - ✅ Token request wrapper
  - ✅ Token refresh logic
  - ✅ Streaming URL builder with validation
  - ✅ Watch event logging (start, pause, resume, end, seek)

### 4. **React Video Player** (`src/components/SecureVideoPlayer.tsx`)
- **Features**:
  - ✅ HLS.js integration for cross-browser support
  - ✅ Automatic token fetching
  - ✅ Token auto-refresh before expiry
  - ✅ Watch analytics tracking
  - ✅ Loading states + error handling

---

## 🔐 Security Features

✅ **Authorization Required**: User must be logged in via next-auth  
✅ **Enrollment Verification**: Checks Moodle enrollment before issuing token  
✅ **JWT Signed Tokens**: Prevents tampering, includes expiry  
✅ **Token-Resource Binding**: Token only valid for specific course/module  
✅ **No Direct Moodle Access**: All requests proxy through Next.js  
✅ **HTTPS Required**: Set in production environment  
✅ **Rate Limiting**: Add via middleware (TODO in production)  

---

## 📋 What YOU Need to Configure

### **1. Generate Strong JWT Secret**

Run this command in PowerShell:
```powershell
# Generate a strong random secret
$bytes = New-Object Byte[] 32
[Security.Cryptography.RNGCryptoServiceProvider]::Create().GetBytes($bytes)
[Convert]::ToBase64String($bytes)
```

Then update `.env.local`:
```env
JWT_SECRET=<paste-the-generated-secret-here>
NEXTAUTH_SECRET=<same-or-different-secret>
```

### **2. Update Environment Variables**

Your `.env.local` should have:
```env
# Moodle Configuration
MOODLE_URL=https://lms.premmcxtrainingacademy.com
MOODLE_TOKEN=67a9120b2faf13be6ec9cb28453eaafb
MOODLE_COURSE_TOKEN=fc47185fd8f2dfc9c328201de0eb09da

# NextAuth & JWT
NEXTAUTH_SECRET=<your-strong-secret>
NEXTAUTH_URL=http://localhost:3000
JWT_SECRET=<your-strong-secret>

# Public
NEXT_PUBLIC_MOODLE_URL=https://lms.premmcxtrainingacademy.com
```

### **3. Update for Production**

In production (premmcxtrainingacademy.com), change:
```env
NEXTAUTH_URL=https://premmcxtrainingacademy.com
```

---

## 🎬 How to Use in Your App

### **Example 1: Add Video to Course Learning Page**

In `src/app/learn/[id]/page.tsx`, add the video player:

```tsx
import SecureVideoPlayer from '@/components/SecureVideoPlayer';

// Inside your component where you want to show video
<SecureVideoPlayer
  courseId={courseId}
  moduleId={moduleId} // The specific video module ID
  title="Course Introduction"
  onProgressUpdate={(progress, duration) => {
    console.log(`Progress: ${progress}/${duration}`);
  }}
/>
```

### **Example 2: Test Token Generation**

```bash
# In browser console or via curl (requires login first)
fetch('/api/secure-streaming/token?courseId=2&moduleId=5', {
  credentials: 'include'
})
.then(r => r.json())
.then(data => console.log('Token:', data));
```

### **Example 3: Test Streaming URL**

After getting a token:
```javascript
const streamUrl = secureStreamingAPI.buildStreamingUrl(
  token,
  'master',
  'master.m3u8',
  2, // courseId
  5  // moduleId
);
console.log('Stream URL:', streamUrl);
// Use this URL in video player
```

---

## ⚠️ Important: Moodle Video Setup

Your Moodle videos must be:
1. **Uploaded to Moodle course modules**
2. **Converted to HLS format** (master.m3u8 + .ts segments)
3. **Accessible via Moodle pluginfile.php** with MOODLE_TOKEN

Example Moodle file structure:
```
/webservice/pluginfile.php/
  {courseId}/
    {moduleId}/
      master.m3u8          (HLS master playlist)
      playlist_720p.m3u8   (Quality variant)
      playlist_480p.m3u8
      segment-001.ts       (Video segments)
      segment-002.ts
      ...
```

---

## 🧪 Testing Steps

### 1. **Start Dev Server**
```powershell
npm run dev
```

### 2. **Login as User**
Navigate to: http://localhost:3000/auth/login

### 3. **Enroll in a Course**
Navigate to course page and enroll

### 4. **Test Token Generation**
Open browser DevTools → Console:
```javascript
fetch('/api/secure-streaming/token?courseId=2&moduleId=5', {
  credentials: 'include'
}).then(r => r.json()).then(console.log);
```

Expected response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 7200,
  "token_type": "Bearer",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "courseId": 2,
  "moduleId": 5
}
```

### 5. **Test Streaming (with valid token)**
```javascript
const token = '<token-from-step-4>';
const streamUrl = `/api/secure-streaming/stream?token=${token}&type=master&file=master.m3u8&courseId=2&moduleId=5`;
console.log('Test stream:', streamUrl);
// Open this URL in a new tab - should stream or show error if file doesn't exist
```

---

## 🚨 Authorization Checks Summary

| Step | What Happens | Where |
|------|-------------|-------|
| 1. User logs in | next-auth session created | `/api/auth/[...nextauth]` |
| 2. Request video token | Check session exists | `/api/secure-streaming/token` |
| 3. Verify enrollment | Call Moodle API to check enrollment | `/api/secure-streaming/token` |
| 4. Generate JWT | Sign token with userId, courseId, moduleId | `/api/secure-streaming/token` |
| 5. Request video stream | Verify JWT signature and expiry | `/api/secure-streaming/stream` |
| 6. Validate resource | Check token courseId/moduleId matches request | `/api/secure-streaming/stream` |
| 7. Proxy video | Fetch from Moodle with MOODLE_TOKEN | `/api/secure-streaming/stream` |

---

## 📊 What's Missing (Optional Enhancements)

- [ ] Rate limiting middleware (use `next-rate-limit`)
- [ ] Database logging for watch analytics
- [ ] Video download prevention watermarking
- [ ] Playback speed restrictions
- [ ] IP-based access control
- [ ] DRM integration (Widevine/FairPlay)
- [ ] CDN integration for scalability

---

## 🎯 Next Steps

1. **Generate JWT_SECRET** and update `.env.local`
2. **Test token generation** with enrolled user
3. **Upload HLS video to Moodle** course module
4. **Add SecureVideoPlayer** to your course learning page
5. **Test end-to-end streaming**
6. **Deploy to production** with HTTPS

---

## 🆘 Troubleshooting

**"Unauthorized" error**  
→ User not logged in. Check next-auth session.

**"Access denied - You must be enrolled"**  
→ User not enrolled in course. Verify enrollment via `/api/courses/check-enrollment`.

**"Invalid or expired token"**  
→ Token expired (2 hours). Use refresh token or request new token.

**"Video not found"**  
→ Video file doesn't exist in Moodle or wrong path. Check Moodle file structure.

**HLS won't play**  
→ Video not in HLS format. Convert with ffmpeg:
```bash
ffmpeg -i input.mp4 \
  -codec: copy -start_number 0 \
  -hls_time 10 -hls_list_size 0 \
  -f hls master.m3u8
```

---

## ✅ Verification Checklist

- [x] Token generation API implemented
- [x] Enrollment verification added
- [x] JWT signing with expiry
- [x] Streaming proxy with token validation
- [x] React video player component
- [x] HLS.js integration
- [x] Token refresh logic
- [x] Watch event logging
- [x] CORS headers
- [x] Error handling
- [x] Build passes successfully

**Status: Implementation Complete! 🎉**

All core functionality is implemented. Test with your Moodle setup and let me know if you encounter any issues.
