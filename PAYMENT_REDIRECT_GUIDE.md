# 🔄 Moodle Payment Redirect Implementation Guide

## Overview
Force users to redirect back to your LMS after completing payment in Moodle using three proven strategies.

---

## ✅ STRATEGY 1: Moodle Fee Plugin Return URL (RECOMMENDED)

**Best For**: Moodle 3.11+, Razorpay Gateway, Production Use

### Setup Instructions:

1. **Access Moodle Admin Panel**
   ```
   Login as Admin → Administration → Plugins → Enrolment → Manage Enrol Plugins
   ```

2. **Click "Fee" Plugin Settings**

3. **Add Return URL**
   - Find field: "Course Return URL" or "Return URL"
   - Add your return endpoint:
   ```
   https://your-lms.com/api/payment-success?courseId={courseid}&userId={userid}
   ```

4. **Alternative Placeholders** (supported by Razorpay plugin):
   ```
   {courseid}      - Course ID
   {userid}        - User ID
   {coursename}    - Course name
   {transactionid} - Payment transaction ID
   {paymentid}     - Razorpay payment ID
   ```

5. **Full URL Example**:
   ```
   https://premmcxtrainingacademy.com/api/payment-success?courseId={courseid}&userId={userid}&status=complete&transactionId={transactionid}
   ```

6. **Save Settings**

### What Happens:
```
User Pays in Moodle
  ↓
Razorpay Processes Payment
  ↓
Moodle Enrolls User Automatically
  ↓
Moodle Redirects to Return URL
  ↓
Your API Verifies Enrollment
  ↓
Redirect to /my-courses?enrolled=true
```

---

## ✅ STRATEGY 2: JavaScript Injection (Fallback)

**Best For**: When plugin configuration isn't available, quick implementation

### Setup Instructions:

1. **Access Moodle Admin**
   ```
   Administration → Appearance → Additional HTML → Footer
   ```

2. **Add This Code**:
   ```html
   <script>
     // Moodle Payment Redirect Handler
     (function() {
       const urlParams = new URLSearchParams(window.location.search);
       const courseId = urlParams.get('id') || urlParams.get('courseid');
       
       // Check if on payment success page
       const isPaymentSuccess = 
         window.location.pathname.includes('/enrol/') ||
         document.body.textContent.includes('successfully enrolled') ||
         document.body.textContent.includes('enrolment');
       
       if (isPaymentSuccess && courseId) {
         console.log('🔄 Payment complete, redirecting to LMS...');
         
         // Wait 2 seconds for Moodle to process, then redirect
         setTimeout(() => {
           window.location.href = 'https://your-lms.com/api/payment-success?courseId=' + courseId;
         }, 2000);
       }
     })();
   </script>
   ```

3. **Save Settings**

### What Happens:
```
User Completes Payment
  ↓
Moodle Shows Success Page
  ↓
JavaScript Detects Success Page
  ↓
After 2 Seconds, Redirects to Your LMS
  ↓
Your API Processes Redirect
```

---

## ✅ STRATEGY 3: Payment Webhook Callback

**Best For**: Real-time payment notifications, multiple payment gateways

### Setup Instructions:

1. **Configure Razorpay Webhook** (In Moodle)
   ```
   Administration → Plugins → Payment Gateways → Razorpay
   
   Webhook URL: https://your-lms.com/api/payment-success
   Events: payment.authorized, payment.failed
   ```

2. **Or Use Moodle Webhook Settings**
   ```
   Administration → Advanced Features → Webhooks
   
   Add Event: \enrol_fee\event\payment_received
   Target URL: https://your-lms.com/api/payment-success
   ```

3. **Send Test Webhook**
   - Razorpay Dashboard → Webhooks → Send Test Signal
   - Verify your endpoint responds with HTTP 200

### What Happens:
```
Payment Completes in Razorpay
  ↓
Razorpay Sends Webhook to Moodle
  ↓
Moodle Processes & Enrolls User
  ↓
Moodle Sends Webhook to Your LMS
  ↓
Your API Returns Redirect URL
  ↓
Frontend Redirects User
```

---

## 🔧 Implementation Files Created

### 1. `/lib/moodle-payment-redirect.ts`
Utility functions for payment redirect handling:
- `updateEnrolmentReturnUrl()` - Update Moodle return URL via API
- `generateMoodleRedirectJavaScript()` - Generate JS code for footer
- `handleMoodlePaymentCallback()` - Process webhook callbacks
- `extractMoodlePaymentParams()` - Parse URL parameters

### 2. `/api/payment-success/route.ts`
API endpoint that handles:
- GET requests from Moodle redirect
- POST requests from webhooks
- Enrollment verification
- Redirect logic

---

## 📊 API Endpoints

### Payment Success Handler
```
GET /api/payment-success?courseId=2&userId=123&status=complete
POST /api/payment-success
```

**GET Query Parameters**:
- `courseId` (required) - Moodle course ID
- `userId` (optional) - Moodle user ID
- `status` (optional) - Payment status (complete, failed)
- `transactionId` (optional) - Transaction ID

**Example Requests**:
```bash
# From Moodle redirect
curl "https://your-lms.com/api/payment-success?courseId=2&userId=123&status=complete"

# From webhook (POST)
curl -X POST https://your-lms.com/api/payment-success \
  -H "Content-Type: application/json" \
  -d '{"courseId":2,"userId":123,"status":"complete"}'
```

**Response**:
```json
{
  "success": true,
  "isEnrolled": true,
  "courseId": 2,
  "status": "complete",
  "redirectUrl": "/my-courses?enrolled=true&courseId=2",
  "message": "Payment processed successfully"
}
```

---

## 🚀 Testing the Integration

### Test in Local Environment

1. **Use ngrok to expose your localhost**:
   ```bash
   ngrok http 3000
   # Output: https://xxxx-xx-xx-xxx-xx.ngrok.io
   ```

2. **Update Moodle settings** with ngrok URL:
   ```
   https://xxxx-xx-xx-xxx-xx.ngrok.io/api/payment-success?courseId={courseid}
   ```

3. **Simulate Payment Flow**:
   ```bash
   # Simulate Moodle redirect
   curl "http://localhost:3000/api/payment-success?courseId=2&userId=123&status=complete"
   
   # Check response - should redirect to /my-courses
   ```

4. **Monitor Logs**:
   ```
   💰 Payment success handler triggered:
   🔍 Verifying enrollment...
   ✅ User 123 is enrolled in course 2
   ✅ Redirecting to courses: /my-courses?enrolled=true&courseId=2
   ```

### Test in Production

1. **Complete Real Payment**:
   - Go to Courses → Select Course → Enrol
   - Click "Enrol Me" → Razorpay opens
   - Complete payment with test card
   - Should redirect back to LMS

2. **Verify in Moodle**:
   - Check user is enrolled in course
   - Check enrollment date is recent

3. **Check Logs**:
   ```bash
   # View server logs
   tail -f .next/server.log
   ```

---

## ⚙️ Configuration Checklist

- [ ] Strategy chosen (1, 2, or 3)
- [ ] Moodle return URL configured
- [ ] API endpoint `/api/payment-success` deployed
- [ ] Environment variables set:
  - `NEXT_PUBLIC_APP_URL` = Your LMS domain
  - `MOODLE_URL` = Your Moodle domain
- [ ] Tested in Moodle with test payments
- [ ] Verified user redirects after payment
- [ ] Verified user is enrolled in course
- [ ] Verified enrollment date is correct
- [ ] Error handling tested (invalid course, missing user)
- [ ] Logs are monitoring payment flows

---

## 🐛 Troubleshooting

### User not redirected after payment

**Check List**:
1. Is return URL configured in Moodle? 
   - Admin → Plugins → Fee → Check "Return URL"

2. Does the URL have correct placeholder syntax?
   - Should be `{courseid}` not `{courseId}`

3. Is API endpoint accessible?
   ```bash
   curl https://your-lms.com/api/payment-success?courseId=2
   # Should return JSON or redirect
   ```

4. Check Moodle logs:
   ```
   Administration → Reports → Logs
   Search: "enrolled" and "payment"
   ```

### User enrolled but not redirected

**Solutions**:
1. Increase timeout in JavaScript injection:
   ```javascript
   setTimeout(() => { ... }, 5000); // Increase to 5 seconds
   ```

2. Check for JavaScript errors:
   - Open browser DevTools → Console
   - Look for red errors

3. Verify Moodle JavaScript is running:
   - Check `window.location` is accessible

### 403/401 Errors from API

**Check**:
1. User is logged in to LMS
2. Session is valid
3. User has access to course
4. Next-auth session cookie exists

---

## 📝 Advanced: Custom Return URL per Course

You can set different return URLs per course:

```bash
# API to update individual course return URL
curl -X POST https://your-lms.com/api/admin/update-course-return-url \
  -H "Content-Type: application/json" \
  -d '{
    "courseId": 2,
    "returnUrl": "https://your-lms.com/course-success",
    "adminToken": "your-moodle-admin-token"
  }'
```

---

## 📈 Monitoring & Analytics

Track payment success rates:

```sql
-- Add to analytics
SELECT 
  course_id,
  COUNT(*) as total_payments,
  SUM(CASE WHEN redirected = true THEN 1 ELSE 0 END) as successful_redirects,
  (SUM(CASE WHEN redirected = true THEN 1 ELSE 0 END) * 100 / COUNT(*)) as success_rate
FROM payment_logs
GROUP BY course_id;
```

---

## 🎯 Recommended Flow

```
┌─────────────────────────────────────────────────────┐
│                  Your LMS App                        │
├─────────────────────────────────────────────────────┤
│ /checkout?courseId=2 [Payment Page]                 │
│          ↓                                           │
│ User clicks "Enrol & Pay"                          │
│          ↓                                           │
│ Redirect to Moodle /enrol/fee/?id=2                │
└─────────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────┐
│               Moodle LMS                             │
├─────────────────────────────────────────────────────┤
│ /enrol/fee/?id=2 [Enrolment Fee Page]              │
│          ↓                                           │
│ User clicks "Enrol Me"                             │
│          ↓                                           │
│ Redirects to Razorpay Payment Gateway              │
└─────────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────┐
│          Razorpay Payment Gateway                   │
├─────────────────────────────────────────────────────┤
│ User enters card details                           │
│          ↓                                           │
│ Payment processed                                  │
│          ↓                                           │
│ Success callback to Moodle                         │
└─────────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────┐
│               Moodle LMS (cont.)                    │
├─────────────────────────────────────────────────────┤
│ Moodle receives payment confirmation                │
│          ↓                                           │
│ User is auto-enrolled in course                    │
│          ↓                                           │
│ Redirect to Return URL:                            │
│ https://your-lms.com/api/payment-success          │
│ ?courseId=2&userId=123&status=complete            │
└─────────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────┐
│    Your LMS - Payment Success Handler               │
├─────────────────────────────────────────────────────┤
│ /api/payment-success route processes:               │
│ 1. Verify user is authenticated                     │
│ 2. Check enrollment in Moodle                       │
│ 3. Redirect to /my-courses?enrolled=true           │
└─────────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────┐
│                Your LMS - Success                   │
├─────────────────────────────────────────────────────┤
│ /my-courses [Shows enrolled course]                │
│ ✅ Course available to learn                       │
│ ✅ Access to all lessons                           │
│ ✅ Can track progress                              │
└─────────────────────────────────────────────────────┘
```

---

## 🔐 Security Considerations

1. **Validate All Parameters**
   - Verify courseId exists
   - Verify userId matches session
   - Validate transactionId with payment gateway

2. **HTTPS Only**
   - All redirect URLs must use HTTPS
   - Never expose tokens in URLs

3. **Rate Limiting**
   - Add rate limiting to `/api/payment-success`
   - Prevent abuse of redirect endpoint

4. **Logging**
   - Log all payment redirects
   - Monitor for suspicious patterns
   - Alert on high failure rates

---

## 📞 Support

If redirect isn't working:

1. Check Moodle logs: `Administration → Reports → Logs`
2. Check browser console: `F12 → Console tab`
3. Check server logs: `tail -f .next/server.log`
4. Verify API endpoint: `curl https://your-lms.com/api/payment-success?courseId=2`
5. Contact Moodle support for Razorpay plugin configuration
