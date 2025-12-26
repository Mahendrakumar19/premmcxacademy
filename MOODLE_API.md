# 🔗 Moodle REST API Integration Guide

## Overview

This LMS uses **Moodle's REST Web Services API** to fetch and display course data. This guide explains how the integration works and how to extend it.

## 🏗️ Architecture

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   Browser   │ ───→ │  Next.js API │ ───→ │   Moodle    │
│  (Frontend) │ ←─── │   (Proxy)    │ ←─── │   Server    │
└─────────────┘      └──────────────┘      └─────────────┘
```

### Why Use a Proxy?

1. **Security** - Hide Moodle token from browser
2. **CORS** - Avoid cross-origin issues
3. **Caching** - Cache responses on server
4. **Flexibility** - Transform data before sending to frontend

## 🔑 Authentication

### Token-Based Authentication

Moodle uses **token-based** authentication for web services:

```
MOODLE_URL + /webservice/rest/server.php?wstoken=TOKEN&wsfunction=FUNCTION
```

### How to Get a Token

1. **Login as Admin** to your Moodle site
2. Navigate to:
   ```
   Site administration
   → Server
   → Web services
   → Manage tokens
   ```
3. **Create a token** for your user
4. **Copy the token** - it looks like:
   ```
   abc123def456ghi789jkl012mno345pqr678
   ```

### Enable Web Services in Moodle

1. Go to: `Site administration → Advanced features`
2. Enable "Enable web services"
3. Go to: `Site administration → Server → Web services → Manage protocols`
4. Enable "REST protocol"

### Required Capabilities

Your Moodle user needs these capabilities:
- `webservice/rest:use`
- `moodle/webservice:createtoken`
- Access to the courses you want to fetch

## 📡 API Endpoints Implemented

### 1. Get Site Information

**Moodle Function:** `core_webservice_get_site_info`

**Usage:**
```typescript
const info = await getSiteInfo();
```

**Returns:**
- Site name
- User information
- Available functions
- Version info

### 2. Get Courses

**Moodle Function:** `core_course_get_courses` or `core_enrol_get_users_courses`

**Usage:**
```typescript
// All courses
const courses = await getUserCourses();

// User's courses
const myCourses = await getUserCourses(userId);
```

**Returns:**
- Course ID, name, summary
- Enrollment count
- Start/end dates
- Category info

### 3. Get Course Contents

**Moodle Function:** `core_course_get_contents`

**Usage:**
```typescript
const contents = await getCourseContents(courseId);
```

**Returns:**
- Course sections
- Modules (assignments, quizzes, resources)
- Module URLs and files
- Visibility settings

### 4. Get Enrolled Users

**Moodle Function:** `core_enrol_get_enrolled_users`

**Usage:**
```typescript
const users = await getEnrolledUsers(courseId);
```

**Returns:**
- User profiles
- Profile pictures
- Email addresses
- Enrollment info

### 5. Get User Grades

**Moodle Function:** `gradereport_user_get_grade_items`

**Usage:**
```typescript
const grades = await getUserGrades(courseId, userId);
```

**Returns:**
- Grade items
- Raw and formatted grades
- Feedback
- Grade dates

### 6. Search Courses

**Moodle Function:** `core_course_search_courses`

**Usage:**
```typescript
const results = await searchCourses('criterianame', 'search term');
```

**Returns:**
- Matching courses
- Search relevance

## 🛠️ How to Add New Moodle Functions

### Step 1: Add TypeScript Type

Edit `src/types/moodle.ts`:

```typescript
export interface MoodleNewType {
  id: number;
  name: string;
  // ... other fields
}
```

### Step 2: Add Helper Function

Edit `src/lib/moodle.ts`:

```typescript
export async function getNewData(param: number): Promise<MoodleNewType> {
  return callMoodle<MoodleNewType>('moodle_function_name', { param });
}
```

### Step 3: Add API Route

Edit `src/app/api/moodle/route.ts`:

```typescript
case 'new-action': {
  const param = searchParams.get('param');
  const data = await getNewData(parseInt(param, 10));
  return NextResponse.json({ ok: true, data });
}
```

### Step 4: Use in Frontend

```typescript
const res = await fetch('/api/moodle?action=new-action&param=123');
const { data } = await res.json();
```

## 🔍 Available Moodle Functions

Here are more functions you can integrate:

### Course Management
- `core_course_create_courses` - Create courses
- `core_course_delete_courses` - Delete courses
- `core_course_update_courses` - Update courses
- `core_course_duplicate_course` - Duplicate courses

### Enrollment
- `enrol_manual_enrol_users` - Enroll users
- `enrol_manual_unenrol_users` - Unenroll users
- `core_enrol_get_course_enrolment_methods` - Get enrollment methods

### Assignments
- `mod_assign_get_assignments` - Get assignments
- `mod_assign_get_submissions` - Get submissions
- `mod_assign_save_submission` - Submit assignment

### Quizzes
- `mod_quiz_get_quizzes_by_courses` - Get quizzes
- `mod_quiz_get_user_attempts` - Get quiz attempts
- `mod_quiz_start_attempt` - Start quiz

### Forums
- `mod_forum_get_forums_by_courses` - Get forums
- `mod_forum_get_forum_discussions` - Get discussions
- `mod_forum_add_discussion_post` - Add post

### Messaging
- `core_message_send_instant_messages` - Send messages
- `core_message_get_messages` - Get messages

### Files
- `core_files_upload` - Upload files
- `core_files_get_files` - Get files

### Calendar
- `core_calendar_get_calendar_events` - Get events
- `core_calendar_create_calendar_events` - Create events

## 🔒 Security Best Practices

### 1. Never Expose Token in Frontend
❌ **Bad:**
```typescript
// In React component
const token = 'abc123...'; // NEVER DO THIS!
```

✅ **Good:**
```typescript
// Use API route proxy
const res = await fetch('/api/moodle?action=courses');
```

### 2. Use Environment Variables
```env
MOODLE_TOKEN=your_token_here
```

### 3. Validate Input
```typescript
if (!courseid || isNaN(parseInt(courseid))) {
  return NextResponse.json({ error: 'Invalid courseid' }, { status: 400 });
}
```

### 4. Handle Errors Gracefully
```typescript
try {
  const data = await callMoodle(...);
  return NextResponse.json({ ok: true, data });
} catch (err) {
  return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
}
```

## 📊 Parameter Flattening

Moodle expects complex parameters in a flattened format:

### Example: Array of Objects

**What you want to send:**
```json
{
  "users": [
    { "id": 1, "name": "Alice" },
    { "id": 2, "name": "Bob" }
  ]
}
```

**What Moodle expects:**
```
users[0][id]=1&users[0][name]=Alice&users[1][id]=2&users[1][name]=Bob
```

Our `callMoodle` function handles this automatically! ✅

## 🧪 Testing Your Integration

### 1. Test with Postman/Curl

```bash
curl "https://your-moodle.com/webservice/rest/server.php?wstoken=YOUR_TOKEN&wsfunction=core_webservice_get_site_info&moodlewsrestformat=json"
```

### 2. Test in Browser

Visit the settings page and click "Test Connection"

### 3. Check Moodle Logs

`Site administration → Reports → Logs → Web services`

## 🐛 Common Issues & Solutions

### Issue: "Invalid token"
**Solution:** Regenerate token in Moodle

### Issue: "Function not allowed"
**Solution:** Enable the function in:
```
Site administration → Server → Web services → External services
```

### Issue: "Access not allowed"
**Solution:** Grant capability to your user role

### Issue: CORS errors
**Solution:** Use the API proxy (already implemented!)

### Issue: Empty response
**Solution:** Check if courses exist and are visible

## 📚 Moodle Documentation

### Official Docs
- [Web Services API](https://docs.moodle.org/dev/Web_services)
- [Functions List](https://docs.moodle.org/dev/Web_service_API_functions)
- [REST Protocol](https://docs.moodle.org/dev/Creating_a_web_service_client)

### Testing Tools
- [Moodle Web Service Test Client](https://docs.moodle.org/en/Web_services_test_client)
- [API Explorer](https://your-moodle.com/admin/webservice/documentation.php)

## 🎯 Real-World Examples

### Example 1: Enroll User in Course

```typescript
export async function enrollUser(
  courseid: number,
  userid: number
): Promise<void> {
  return callMoodle('enrol_manual_enrol_users', {
    enrolments: [
      {
        roleid: 5, // Student role
        userid,
        courseid,
      }
    ]
  });
}
```

### Example 2: Submit Assignment

```typescript
export async function submitAssignment(
  assignid: number,
  userid: number,
  text: string
): Promise<void> {
  return callMoodle('mod_assign_save_submission', {
    assignmentid: assignid,
    plugindata: {
      onlinetext_editor: {
        text,
        format: 1
      }
    }
  });
}
```

### Example 3: Get Quiz Questions

```typescript
export async function getQuizQuestions(
  quizid: number
): Promise<MoodleQuizQuestion[]> {
  return callMoodle('mod_quiz_get_quiz_access_information', {
    quizid
  });
}
```

## 🚀 Advanced Tips

### Caching Strategies
```typescript
// Cache for 5 minutes
fetch(url, { next: { revalidate: 300 } })
```

### Batch Requests
```typescript
// Call multiple endpoints
const [courses, users, grades] = await Promise.all([
  getUserCourses(),
  getEnrolledUsers(courseId),
  getUserGrades(courseId, userId)
]);
```

### Error Recovery
```typescript
try {
  return await getRealData();
} catch (err) {
  return getDemoData(); // Fallback
}
```

## 📖 Summary

✅ Token-based authentication  
✅ REST API via Next.js proxy  
✅ Type-safe with TypeScript  
✅ Easy to extend  
✅ Secure by design  
✅ Production-ready  

Your Moodle integration is **professional-grade** and ready for real-world use! 🎉
