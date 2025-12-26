# LMS API & Data Flow Architecture

## 🔄 Complete Course Access Flow

### User Journey: Free Course Enrollment
```
1. User navigates to /courses
   └─> getCourses() from Moodle API
   └─> Display courses with prices

2. User clicks course → /courses/[id]
   └─> getCourseById([id]) from Moodle
   └─> Extract price from summary
   └─> Check if user enrolled
   └─> Display course details

3. User clicks "Enroll Free"
   └─> Redirect to /checkout?courseId=[id]

4. User clicks "Enroll" button
   └─> POST /api/payment/verify with:
       ├─> courseId
       ├─> courseName
       ├─> amount: 0
       └─> razorpay_order_id: 'free_course'

5. Payment Verification API
   └─> Verify amount == 0 (free course)
   └─> Call enrollUserInCourse(userId, courseId)
   └─> Moodle API: core_enrol_manual_enrol_users
   └─> Store payment record (status: 'free')
   └─> Return success

6. Frontend redirects to /learn/[id]
   └─> getCourseContents([id]) from Moodle
   └─> Display course modules/sections
   └─> User can access all course content

7. User goes to /payment-history
   └─> View course in "Free" status
   └─> Quick link back to course
```

### User Journey: Paid Course Enrollment
```
1. User navigates to /courses
   └─> getCourses() from Moodle API
   └─> Display courses with prices

2. User clicks course → /courses/[id]
   └─> getCourseById([id]) from Moodle
   └─> Extract price from summary
   └─> Check if user enrolled
   └─> Display course details

3. User clicks "Buy Now"
   └─> Redirect to /checkout?courseId=[id]

4. Checkout page loads
   └─> getCourseById([id]) from Moodle
   └─> Display course and price
   └─> Show order summary

5. User clicks "Proceed to Payment"
   └─> Create order: POST /api/payment/create-order with:
       ├─> courseId
       ├─> courseName
       ├─> amount (course price)
       ├─> userId
       ├─> userEmail
       └─> userName

6. Create Order API
   └─> Call Razorpay API: orders.create()
   └─> Return orderId, amount, currency
   └─> Return keyId for frontend

7. Frontend opens Razorpay modal
   └─> User enters payment details
   └─> Razorpay processes payment
   └─> Payment success callback triggered

8. Payment Handler (Frontend)
   └─> POST /api/payment/verify with:
       ├─> razorpay_order_id
       ├─> razorpay_payment_id
       ├─> razorpay_signature
       ├─> courseId
       ├─> courseName
       ├─> amount
       └─> userId

9. Payment Verification API
   └─> Verify Razorpay signature:
       ├─> sha256(order_id|payment_id) with secret
       ├─> Compare with received signature
   └─> If verified:
       ├─> Call enrollUserInCourse(userId, courseId)
       ├─> Moodle API: core_enrol_manual_enrol_users
       ├─> Store payment record (status: 'completed')
       └─> Return success
   └─> If not verified:
       ├─> Store payment record (status: 'failed')
       └─> Return error

10. Frontend redirects to /learn/[id]
    └─> getCourseContents([id]) from Moodle
    └─> Display course modules/sections
    └─> User can access all course content

11. User goes to /payment-history
    └─> View course in "Completed" status
    └─> Shows payment amount and date
    └─> Quick link back to course
```

## 🔌 API Endpoints

### Course APIs (Moodle)

#### Get All Courses
```typescript
GET /lib/moodle-api.ts::getCourses()
Moodle: core_course_get_courses
Returns: Course[]
```

#### Get Course by ID
```typescript
GET /lib/moodle-api.ts::getCourseById(courseId)
Moodle: core_course_get_courses
Params: { ids: [courseId] }
Returns: Course
```

#### Get Course Contents
```typescript
GET /lib/moodle-api.ts::getCourseContents(courseId)
Moodle: core_course_get_contents
Params: { courseid: courseId }
Returns: CourseSection[]
```

#### Get User Enrolled Courses
```typescript
GET /lib/moodle-api.ts::getUserEnrolledCourses(courseId)
Moodle: core_enrol_get_users_courses
Params: { userid: userId, courseid: courseId }
Returns: Course[]
```

#### Enroll User in Course
```typescript
POST /lib/moodle-api.ts::enrollUserInCourse(userId, courseId, roleId)
Moodle: core_enrol_manual_enrol_users
Params: {
  enrolments: [{
    userid: userId,
    courseid: courseId,
    roleid: 5 (student role)
  }]
}
Returns: { error?: string }
```

### Payment APIs (Backend)

#### Create Order
```typescript
POST /api/payment/create-order
Headers: { 'Content-Type': 'application/json' }
Body: {
  courseId: number,
  courseName: string,
  amount: number,
  userId: string,
  userEmail: string,
  userName: string
}
Returns: {
  orderId: string,
  amount: number,
  currency: string,
  keyId: string
}
```

#### Verify Payment & Enroll
```typescript
POST /api/payment/verify
Headers: { 'Content-Type': 'application/json' }
Body: {
  razorpay_order_id: string,
  razorpay_payment_id: string,
  razorpay_signature: string,
  courseId: number,
  courseName: string,
  amount: number,
  userId: string
}
Returns: {
  success: boolean,
  enrolled: boolean,
  message: string,
  paymentId?: string,
  orderId?: string
}
```

### Razorpay APIs (External)

#### Create Order
```javascript
POST https://api.razorpay.com/v1/orders
Headers: { Authorization: 'Basic <keyId>:<keySecret>' }
Body: {
  amount: number (in paise),
  currency: 'INR',
  receipt: string,
  notes: { courseId, userId }
}
Returns: { id, amount, currency, receipt, status }
```

#### Signature Verification
```javascript
HMAC-SHA256(order_id|payment_id, keySecret) === signature
```

## 📊 Data Models

### Course
```typescript
interface Course {
  id: number;
  fullname: string;
  shortname: string;
  summary: string;
  categoryname?: string;
  visible: number;
  format: string;
  showgrades: boolean;
  enablecompletion?: boolean;
  startdate?: number;
  enddate?: number;
  price?: number;      // Extracted from summary
  enrolled?: boolean;  // Checked via API
}
```

### CourseSection
```typescript
interface CourseSection {
  id: number;
  name: string;
  summary: string;
  modules?: CourseModule[];
}
```

### CourseModule
```typescript
interface CourseModule {
  id: number;
  name: string;
  modname: string;
  url?: string;
  description?: string;
  contents?: { filename: string; fileurl: string }[];
}
```

### Payment
```typescript
interface Payment {
  id: string;
  courseId: number;
  courseName: string;
  userId: number;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'free';
  paymentId?: string;
  orderId?: string;
  timestamp: number;
}
```

## 🔐 Security Implementation

### Payment Verification
```typescript
// Razorpay signature verification for paid courses
const hmac = crypto.createHmac('sha256', RAZORPAY_KEY_SECRET);
hmac.update(`${orderId}|${paymentId}`);
const expectedSignature = hmac.digest('hex');

if (receivedSignature !== expectedSignature) {
  // Payment tampered, reject
  return error();
}

// If verified, proceed with enrollment
```

### Free Course Verification
```typescript
// For free courses, verify amount is 0
if (amount === 0 || orderId === 'free_course') {
  // No signature verification needed
  // Directly enroll user in Moodle
}
```

### Authentication
```typescript
// All payment and learning pages require authentication
const session = await getServerSession(authOptions);
if (!session?.user) {
  return redirect('/auth/login');
}
```

### Access Control
```typescript
// Verify Moodle enrollment before showing content
const userCourses = await getUserEnrolledCourses(courseId);
const isEnrolled = userCourses && userCourses.length > 0;

if (!isEnrolled) {
  return redirect('/courses');
}
```

## 🔄 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  /courses → /courses/[id] → /checkout → /learn/[id]   │
│     ↓           ↓              ↓           ↓            │
│   Browse     Details       Payment     Content         │
│   courses    & pricing      & verify    viewer         │
│                                                         │
└─────────────────────────────────────────────────────────┘
      ↓                    ↓                  ↓
┌──────────────────────────────────────────────────────┐
│              Backend (API Routes)                    │
├──────────────────────────────────────────────────────┤
│                                                     │
│  /api/payment/create-order                          │
│  /api/payment/verify                                │
│                                                     │
└──────────────────────────────────────────────────────┘
      ↓                    ↓                  ↓
┌──────────────────────────────────────────────────────┐
│             External Services                       │
├──────────────────────────────────────────────────────┤
│                                                     │
│  Moodle API ──────── Razorpay API                   │
│  Courses            Payments                        │
│  Enrollment         Verification                    │
│  Users              Signature                       │
│                                                     │
└──────────────────────────────────────────────────────┘
```

## 📈 Complete Request/Response Examples

### Free Course Enrollment
```json
// Request to /api/payment/verify
{
  "razorpay_order_id": "free_course",
  "razorpay_payment_id": "free_course",
  "razorpay_signature": "free_course",
  "courseId": 2,
  "courseName": "Web Development",
  "amount": 0,
  "userId": "5"
}

// Response
{
  "success": true,
  "enrolled": true,
  "message": "Free enrollment successful",
  "orderId": "free_course"
}
```

### Paid Course Enrollment
```json
// Request to /api/payment/verify
{
  "razorpay_order_id": "order_HvyXW0SEHwMxwJ",
  "razorpay_payment_id": "pay_HvyXW6hGqvNVRu",
  "razorpay_signature": "5f9ecc7f69d1c5f7e8d89c5e4d3c2b1a",
  "courseId": 3,
  "courseName": "Advanced Python",
  "amount": 500,
  "userId": "5"
}

// Response (if verified)
{
  "success": true,
  "enrolled": true,
  "message": "Payment verified and enrollment successful",
  "paymentId": "pay_HvyXW6hGqvNVRu",
  "orderId": "order_HvyXW0SEHwMxwJ"
}
```

## ✅ All Systems Integrated & Working

- ✅ Course browsing from Moodle
- ✅ Real payment processing with Razorpay
- ✅ Automatic Moodle enrollment
- ✅ Course content access control
- ✅ Payment history tracking
- ✅ Free and paid course support
- ✅ Signature verification
- ✅ Error handling & logging
