# 🚀 Quick Start: Moodle Payment Redirect

## What's Been Implemented

Three proven strategies to force users back to your LMS after Moodle payment:

### 1. **Moodle Fee Plugin Return URL** (RECOMMENDED ⭐)
- Easiest to implement
- No code changes needed
- Just update Moodle admin settings
- Best for production

### 2. **JavaScript Injection** (Fallback)
- Works if plugin configuration unavailable
- Inject code in Moodle footer
- Automatic redirect detection

### 3. **Payment Webhook** (Advanced)
- Real-time payment notifications
- Best for analytics/logging
- Requires webhook configuration

---

## 🎯 Start Here: 5-Minute Setup

### Step 1: Add Return URL to Moodle

1. Login to **Moodle as Admin**
2. Go: **Administration → Plugins → Enrolment → Manage Enrol Plugins**
3. Click the **Settings/Gear icon** next to "Fee" plugin
4. Find the **"Course Return URL"** field
5. Add this URL:
   ```
   https://your-lms-domain.com/api/payment-success?courseId={courseid}&userId={userid}&status=complete
   ```
6. Replace `your-lms-domain.com` with your actual domain
7. Click **"Save Changes"**

### Step 2: Test the Flow

1. Go to a paid course in Moodle
2. Click **"Enrol Me"**
3. Complete test payment (Razorpay test card)
4. You should be **redirected back to your LMS**
5. Should see: `/my-courses?enrolled=true`

### Step 3: Verify Enrollment

1. Check user is enrolled in Moodle course
2. Check user can access course in your LMS
3. Check `/api/payment-success` logs for redirect handler

---

## 📁 Files Created

### Backend Files
```
src/lib/moodle-payment-redirect.ts    ← Main redirect logic
src/lib/moodle-payment-setup.ts       ← Configuration helpers
src/app/api/payment-success/route.ts  ← API endpoint
```

### Documentation
```
PAYMENT_REDIRECT_GUIDE.md             ← Complete setup guide
```

---

## 🔌 API Endpoint

### Payment Success Handler
```
GET /api/payment-success?courseId=2&userId=123&status=complete
```

**Parameters:**
- `courseId` (required) - Moodle course ID
- `userId` (optional) - Moodle user ID
- `status` (optional) - Payment status (complete, failed)
- `transactionId` (optional) - Transaction ID

**Response:**
```json
{
  "success": true,
  "isEnrolled": true,
  "courseId": 2,
  "redirectUrl": "/my-courses?enrolled=true&courseId=2"
}
```

---

## 🧪 Test Without Moodle

Test the endpoint directly:

```bash
# Test successful payment
curl "http://localhost:3000/api/payment-success?courseId=2&status=complete"

# You should get redirected to /my-courses (if authenticated)
```

---

## 📊 Configuration Examples

### Example 1: Simple Return URL
```
https://premmcxtrainingacademy.com/api/payment-success?courseId={courseid}
```

### Example 2: Full Parameters
```
https://premmcxtrainingacademy.com/api/payment-success?courseId={courseid}&userId={userid}&status=complete&transactionId={transactionid}
```

### Example 3: With Custom Success Page
```
https://premmcxtrainingacademy.com/payment-complete?id={courseid}&user={userid}
```

---

## 🔍 Troubleshooting

### Issue: Users not redirecting after payment

**Solution 1: Check Moodle Settings**
```
Admin → Plugins → Fee → Check "Course Return URL" is set
```

**Solution 2: Check URL Format**
```
Should use {courseid} not {courseId}
Should use https:// for production
```

**Solution 3: Check API Endpoint**
```bash
curl https://your-lms.com/api/payment-success?courseId=2
# Should return JSON or redirect
```

### Issue: Getting 404 errors

**Solution:**
1. Make sure endpoint `/api/payment-success/route.ts` exists
2. Restart dev server: `npm run dev`
3. Check file is in correct path: `src/app/api/payment-success/route.ts`

### Issue: Enrollment not verified

**Solution:**
1. Check user is authenticated (has session)
2. Check Moodle user token is valid
3. Check user is actually enrolled in course
4. Check Moodle logs for errors

---

## 📈 Monitoring

View redirect logs in your terminal:

```
💰 Payment success handler triggered: { courseId: 2, userId: 123 }
🔍 Verifying enrollment for user 123 in course 2...
✅ User 123 is enrolled in course 2
✅ Redirecting to courses: /my-courses?enrolled=true&courseId=2
```

---

## 🎓 Advanced Usage

### Generate Return URL Programmatically

```typescript
import { generateMoodleReturnUrl } from '@/lib/moodle-payment-redirect';

const returnUrl = generateMoodleReturnUrl(2, 'success');
// Returns: https://your-lms.com/api/payment-success?courseId=2&status=complete
```

### Check Course Payment Setup

```typescript
import { checkCoursePaymentSetup } from '@/lib/moodle-payment-setup';

const setup = await checkCoursePaymentSetup(2);
// Returns: { configured: true, enabled: true, cost: "10000", currency: "INR" }
```

### Validate Return URL

```typescript
import { validateRedirectUrl } from '@/lib/moodle-payment-setup';

const validation = validateRedirectUrl('https://...');
// Returns: { valid: true, errors: [] }
```

---

## 🔐 Security Notes

1. ✅ Always use **HTTPS** in production
2. ✅ Validate `courseId` exists before redirecting
3. ✅ Verify user is authenticated
4. ✅ Check user token is valid
5. ✅ Log all payment redirects for audit
6. ✅ Rate limit the endpoint to prevent abuse

---

## 📞 Need Help?

1. Check `PAYMENT_REDIRECT_GUIDE.md` for complete documentation
2. Review server logs: `tail -f .next/server.log`
3. Check browser console: `F12 → Console`
4. Verify Moodle configuration: `Admin → Reports → Logs`
5. Test API endpoint directly with curl

---

## ✅ Checklist

- [ ] Moodle return URL configured
- [ ] API endpoint `/api/payment-success` working
- [ ] Test payment completed successfully
- [ ] User redirected back to LMS
- [ ] User enrollment verified
- [ ] Logs show successful redirect
- [ ] Production HTTPS URLs configured
- [ ] Error handling tested

---

## 🚀 Next Steps

1. **Immediate**: Configure return URL in Moodle (5 minutes)
2. **Quick**: Test with a real payment (15 minutes)
3. **Optional**: Setup webhook for analytics (30 minutes)
4. **Monitor**: Watch logs during real user payments

Good luck! 🎉
