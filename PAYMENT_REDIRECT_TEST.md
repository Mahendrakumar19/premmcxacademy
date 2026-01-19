# Payment Redirect Testing Guide

## System Status ✅

Your payment redirect system is **fully implemented** with three strategies ready to use:

### Files Already Created:
- ✅ `src/lib/moodle-payment-redirect.ts` - Core redirect library
- ✅ `src/app/api/payment-success/route.ts` - API endpoint (GET + POST)
- ✅ `src/lib/moodle-payment-setup.ts` - Configuration helpers
- ✅ Documentation files (QUICKSTART, GUIDE, SUMMARY)

---

## Quick Testing (5 minutes)

### Option 1: Test via Terminal (No Moodle Needed)

```bash
# Test with successful payment
curl "http://localhost:3000/api/payment-success?courseId=2&userId=1&status=complete"

# Expected: Redirects to /my-courses?enrolled=true&courseId=2

# Test with failed payment
curl "http://localhost:3000/api/payment-success?courseId=2&status=failed"

# Expected: Redirects to /cart?payment=failed&courseId=2
```

### Option 2: Test via Browser

1. Make sure you're logged in to the app
2. Visit: `http://localhost:3000/api/payment-success?courseId=2&status=complete`
3. You should redirect to `/my-courses` page
4. Check if the course appears in your enrollment list

---

## Moodle Configuration (The Real Setup)

### Strategy 1: ⭐ RECOMMENDED - Fee Plugin Return URL

**In Moodle Admin Panel:**

1. Go to **Site Administration → Plugins → Enrolment → Fee**
2. Find the course where you enabled fee enrolment
3. Set **"Enrolment instance settings"** → **"Course return URL"** to:
   ```
   https://your-lms.com/api/payment-success?courseId={courseid}&userId={userid}
   ```

4. Make sure placeholders use the exact Moodle syntax:
   - `{courseid}` (NOT `{courseId}`)
   - `{userid}` (NOT `{userId}`)

5. **Important**: Use HTTPS in production

6. Save and test with a paid course

**After Payment in Moodle:**
- ✅ User completes payment → Moodle redirects to `/api/payment-success`
- ✅ API verifies enrollment
- ✅ User redirects to `/my-courses?enrolled=true&courseId=X`

---

## API Response Codes

### Success (Payment Completed)
```
GET /api/payment-success?courseId=2&status=complete
↓
Redirects: /my-courses?enrolled=true&courseId=2
HTTP Status: 307 (Temporary Redirect)
```

### Failure (Payment Failed)
```
GET /api/payment-success?courseId=2&status=failed
↓
Redirects: /cart?payment=failed&courseId=2
HTTP Status: 307 (Temporary Redirect)
```

### Missing Parameters
```
GET /api/payment-success
↓
Redirects: /cart?error=missing-course-id
HTTP Status: 400 Bad Request
```

### User Not Logged In
```
GET /api/payment-success?courseId=2&status=complete (no session)
↓
Redirects: /auth/login?callbackUrl=...
HTTP Status: 307 (Temporary Redirect)
```

---

## Testing Checklist

- [ ] Terminal test: `curl http://localhost:3000/api/payment-success?courseId=2&status=complete`
- [ ] Browser test: Visit the URL directly (must be logged in)
- [ ] Verify redirect happens
- [ ] Verify you land on `/my-courses` page
- [ ] Check dev server console for "✅ Payment redirect successful" message
- [ ] Configure Moodle return URL
- [ ] Test with real/test payment in Moodle
- [ ] Verify enrollment shows on `/my-courses` after payment

---

## Monitoring Logs

Check your dev server console for payment redirect logs:

```
💰 Payment success handler triggered: {
  courseId: '2',
  userId: '123',
  status: 'complete'
}

🔍 Verifying enrollment for user 1 in course 2
✅ User 1 is enrolled in course 2
✅ Payment redirect successful, redirecting to /my-courses
```

---

## Fallback Strategies (If Needed)

### Strategy 2: JavaScript Injection
If you can't modify Moodle fee plugin settings:

The system has a JavaScript generator that injects redirect code into Moodle's payment success page. See `PAYMENT_REDIRECT_GUIDE.md` for details.

### Strategy 3: Webhook Handler
For advanced integrations with Razorpay or custom payment providers:

The API endpoint supports POST requests with webhook payloads. See `PAYMENT_REDIRECT_SUMMARY.md` for webhook examples.

---

## Production Deployment

When deploying to production:

1. Update return URLs to use `https://premmcxtrainingacademy.com`
   ```
   https://premmcxtrainingacademy.com/api/payment-success?courseId={courseid}&userId={userid}
   ```

2. Update environment variables in `.env.local`:
   ```
   MOODLE_BASE_URL=https://your-moodle.com
   NEXT_PUBLIC_LMS_URL=https://your-lms.com
   ```

3. Test with a test payment first (use Razorpay test keys)

4. Monitor logs for any issues

---

## Troubleshooting

### User stays on Moodle payment success page
- **Issue**: Redirect not triggering
- **Solution**: Check if Moodle return URL is configured correctly
- **Check**: Verify placeholder syntax: `{courseid}` not `{courseId}`

### Redirect loops
- **Issue**: User keeps redirecting
- **Solution**: Check if `/my-courses` page exists and is accessible
- **Check**: Verify user session is valid

### "User not authenticated" error
- **Issue**: Session lost after Moodle payment
- **Solution**: Check if session cookies are being preserved
- **Check**: Verify cookie domain settings match your domain

### Course doesn't show as enrolled
- **Issue**: Enrollment check failed
- **Solution**: Verify user has proper token and permissions in Moodle
- **Check**: Run Moodle API test to confirm enrollment is visible

### API endpoint returns 500 error
- **Issue**: Server error during redirect
- **Solution**: Check dev server console for error messages
- **Check**: Verify Moodle API credentials are valid

---

## Documentation References

- **Quick Setup**: See `PAYMENT_REDIRECT_QUICKSTART.md` (5 minutes)
- **Detailed Guide**: See `PAYMENT_REDIRECT_GUIDE.md` (comprehensive reference)
- **Executive Summary**: See `PAYMENT_REDIRECT_SUMMARY.md` (overview)

---

## Next Steps

1. **Now**: Test with curl command above
2. **Then**: Configure Moodle return URL (Strategy 1)
3. **Finally**: Test with a real payment

You're all set! 🚀
