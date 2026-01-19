# 💳 Custom Payment Flow - Quick Reference

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    USER INTERFACE                        │
│  - Home Page (Browse Courses)                           │
│  - Cart (Add/Remove Items)                              │
│  - Checkout Page (Review & Pay)                         │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────▼───────────────┐
        │   PaymentForm Component    │
        │  - Card Input              │
        │  - Payment Method Select   │
        │  - Client Validation       │
        │  - Submit Handler          │
        └────────────────┬───────────┘
                         │
        ┌────────────────▼──────────────────┐
        │  Frontend Request (fetch)         │
        │  POST /api/payment/verify         │
        │  {                                │
        │    courseIds: [2, 3, 4],         │
        │    amount: 10001,                │
        │    paymentMethod: 'card',        │
        │    cardDetails: {...},           │
        │    timestamp: ISO8601            │
        │  }                               │
        └────────────────┬──────────────────┘
                         │
        ┌────────────────▼──────────────────────────┐
        │     Backend Payment Verification          │
        │  /api/payment/verify/route.ts             │
        │                                           │
        │  1. Verify user session (NextAuth)       │
        │  2. Generate Transaction ID               │
        │  3. Log transaction start                 │
        │  4. Simulate payment verification        │
        │  5. Batch enroll user in courses         │
        │  6. Log transaction completion            │
        │  7. Return success/failure response       │
        └────────────────┬──────────────────────────┘
                         │
        ┌────────────────▼──────────────────────┐
        │   Moodle API Integration              │
        │                                       │
        │  Option 1: Manual Enrollment          │
        │  - POST core_enrol_manual_enrol_users │
        │  - Requires: MOODLE_PAYMENT_TOKEN    │
        │  - Role: STUDENT (5)                 │
        │                                       │
        │  Option 2: Self Enrollment (Fallback)│
        │  - POST enrol_self_enrol_user        │
        │  - Requires: User token              │
        └────────────────┬──────────────────────┘
                         │
        ┌────────────────▼──────────────────┐
        │   Enrollment Result                │
        │  - User enrolled in all courses   │
        │  - Role assigned (STUDENT)        │
        │  - Transaction logged             │
        │  - Response sent to frontend      │
        └────────────────┬──────────────────┘
                         │
        ┌────────────────▼──────────────────┐
        │   Frontend Success Screen          │
        │  - Show confirmation message      │
        │  - Display transaction ID         │
        │  - Clear cart                     │
        │  - Redirect to /my-courses        │
        └───────────────────────────────────┘
```

---

## File Structure

```
src/
├── app/
│   ├── checkout/
│   │   └── page.tsx ......................... Checkout page (refactored)
│   ├── api/
│   │   └── payment/
│   │       └── verify/
│   │           └── route.ts ................ Payment verification (NEW)
│   └── ...other routes
├── components/
│   ├── PaymentForm.tsx ...................... Custom payment form (NEW)
│   └── ...other components
└── lib/
    └── ...existing utilities
```

---

## Key Components

### 1. PaymentForm Component
**Location:** `src/components/PaymentForm.tsx`
**Props:**
- `items`: Array of { courseId, name, price }
- `totalAmount`: Total amount to pay
- `onSuccess`: Callback on successful payment
- `onError`: Callback on payment error
- `isProcessing`: Show loading state

**Features:**
- ✅ Card number formatting (spaces every 4 digits)
- ✅ Expiry date validation (MM/YY format)
- ✅ CVV validation (3-4 digits)
- ✅ Payment method selection (Card, Bank Transfer, UPI)
- ✅ Client-side validation before submission
- ✅ Secure handling (card details validated, not stored)

**Example:**
```tsx
<PaymentForm
  items={[{ courseId: 2, name: 'Demo Course', price: 1 }]}
  totalAmount={1}
  onSuccess={() => console.log('Payment successful!')}
  onError={(err) => console.log('Error:', err)}
  isProcessing={false}
/>
```

### 2. Payment Verification Endpoint
**Location:** `src/app/api/payment/verify/route.ts`
**Method:** POST
**Request Body:**
```json
{
  "courseIds": [2, 3, 4],
  "amount": 10001,
  "paymentMethod": "card",
  "cardDetails": {
    "last4": "1111",
    "cardHolder": "John Doe"
  },
  "userId": "6",
  "timestamp": "2026-01-18T12:00:00Z"
}
```

**Response (Success):**
```json
{
  "success": true,
  "transactionId": "TXN-1705594800000-ABC123XYZ",
  "message": "Payment verified and enrollment completed successfully",
  "enrollmentResults": [
    { "courseId": 2, "success": true, "role": "student" },
    { "courseId": 3, "success": true, "role": "student" }
  ],
  "enrolledCourses": [2, 3],
  "failedCourses": []
}
```

**Response (Failure):**
```json
{
  "success": false,
  "transactionId": "TXN-xxx",
  "error": "Enrollment failed for course 4",
  "enrollmentResults": [
    { "courseId": 2, "success": true, "role": "student" },
    { "courseId": 3, "success": true, "role": "student" },
    { "courseId": 4, "success": false }
  ],
  "enrolledCourses": [2, 3],
  "failedCourses": [4]
}
```

### 3. Checkout Page
**Location:** `src/app/checkout/page.tsx`
**Features:**
- ✅ Order summary with course details
- ✅ Enrollment details (user info)
- ✅ PaymentForm integration
- ✅ Success screen with redirect
- ✅ Session-based authentication
- ✅ Empty cart redirect

---

## Data Flow

### Request Flow
```
1. User fills PaymentForm
   ↓
2. Form validates client-side
   ↓
3. onSubmit handler:
   - Validates card details
   - Calls POST /api/payment/verify
   ↓
4. Backend:
   - Verifies session
   - Generates transaction ID
   - Simulates payment verification
   - Enrolls user in courses (batch)
   - Logs transaction
   ↓
5. Response:
   - Returns transaction details
   - Lists enrolled/failed courses
   ↓
6. Frontend:
   - Checks success
   - Shows success screen (2 sec)
   - Clears cart
   - Redirects to /my-courses
```

### Transaction Log Structure
```typescript
{
  transactionId: "TXN-1705594800000-ABC123",
  userId: "6",
  courseIds: [2, 3, 4],
  amount: 10001,
  paymentMethod: "card",
  status: "completed",
  enrollmentResults: [
    { courseId: 2, success: true, role: "student" },
    { courseId: 3, success: true, role: "student" },
    { courseId: 4, success: true, role: "student" }
  ],
  createdAt: "2026-01-18T12:00:00Z",
  completedAt: "2026-01-18T12:00:05Z"
}
```

---

## Environment Variables Required

```bash
# Moodle Configuration
MOODLE_URL=https://lms.premmcxtrainingacademy.com
MOODLE_PAYMENT_TOKEN=fc47185fd8f2dfc9c328201de0eb09da

# NextAuth Configuration
NEXTAUTH_SECRET=4f3e7c8d2b9a1f5e6c4d8a3b7f2e9c1d5a6b8f3e7d4c2b9a5f8e1d3c6a9b2e
NEXTAUTH_URL=http://localhost:3000
```

---

## Moodle API Integration

### Manual Enrollment
**Function:** `manualEnrollUser(courseId, userId, roleId, token)`
**Endpoint:** `core_enrol_manual_enrol_users`
**Parameters:**
- `courseId`: Moodle course ID
- `userId`: Moodle user ID
- `roleId`: 5 = STUDENT, 3 = TEACHER
- `token`: `MOODLE_PAYMENT_TOKEN` (admin token)

### Self-Enrollment (Fallback)
**Function:** `selfEnrollUser(courseId, userToken)`
**Endpoint:** `enrol_self_enrol_user`
**Parameters:**
- `courseId`: Moodle course ID
- `userToken`: User's personal Moodle token

---

## Error Handling

### Client-Side Validation
```typescript
- Empty fields → "Field is required"
- Invalid card number (not 16 digits) → "Invalid card number"
- Invalid expiry (past date) → "Card has expired"
- Invalid CVV (< 3 digits) → "Invalid CVV"
- Card holder empty → "Card holder name is required"
```

### Server-Side Handling
```typescript
- Unauthorized → 401 Unauthorized
- Payment failed → 400 Bad Request
- Enrollment failed → Fallback to self-enrollment
- Both methods fail → Return partial success with failedCourses array
- Network error → 500 Internal Server Error
```

---

## Performance Optimizations

✅ **Batch Enrollment:** All courses enrolled in single API call  
✅ **Transaction Logging:** In-memory for fast audit trail  
✅ **Fallback Methods:** Dual enrollment strategy (manual + self)  
✅ **Client-Side Validation:** Reduces unnecessary API calls  
✅ **Session Caching:** Reuses NextAuth session  

---

## Security Measures

🔒 **Session Verification:** Every request verified with NextAuth  
🔒 **Card Details:** Validated client-side, only last 4 digits logged  
🔒 **CSRF Protection:** Built into Next.js  
🔒 **Token Management:** Moodle tokens stored in environment variables  
🔒 **Audit Trail:** All transactions logged with timestamp  

---

## Testing Checklist

- [ ] Free course enrollment without payment form
- [ ] Paid course with card payment
- [ ] Multiple courses batch enrollment
- [ ] Error handling and fallback scenarios
- [ ] Transaction logging working
- [ ] Redirect to my-courses after success
- [ ] Cart clears after successful payment
- [ ] User appears enrolled in Moodle
- [ ] Manual enrollment works
- [ ] Self-enrollment fallback works

---

## Future Enhancements

1. **Database Integration**
   - Move transaction logs to database
   - Implement transaction history API

2. **Real Payment Gateway Integration**
   - Razorpay verification
   - Stripe integration
   - PayPal integration

3. **Admin Dashboard**
   - View transaction history
   - Monitor enrollment status
   - Revenue analytics

4. **Email Notifications**
   - Payment confirmation
   - Enrollment confirmation
   - Course access links

5. **Subscription Model**
   - Recurring payments
   - Auto-enrollment

6. **Analytics**
   - Conversion tracking
   - Revenue metrics
   - User demographics
