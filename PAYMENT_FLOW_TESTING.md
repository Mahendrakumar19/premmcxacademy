# 🧪 Payment Flow Testing Guide

## Setup & Prerequisites
✅ Dev server running: http://localhost:3000
✅ Moodle API accessible: https://lms.premmcxtrainingacademy.com
✅ User logged in with valid Moodle credentials
✅ Courses available in cart

---

## Test Scenarios

### Scenario 1: FREE Course Enrollment ✅
**Expected Flow:**
1. Add a FREE course (₹0) to cart
2. Navigate to `/checkout`
3. Click "Pay" button
4. Should show: "All courses are free! No payment required."
5. Form submission → Direct enrollment via `/api/payment/verify`
6. Success screen → Redirect to `/my-courses`

**Expected Output in Console:**
```
🔄 [TXN-xxxxx] Processing payment: card for ₹0
✅ [TXN-xxxxx] Payment verified successfully
📚 [TXN-xxxxx] Enrolling user 6 in course 2
✅ [TXN-xxxxx] Manual enrollment successful for course 2: ...
✅ [TXN-xxxxx] Enrollment completed: [{ courseId: 2, success: true, role: 'student' }]
```

---

### Scenario 2: PAID Course with Card Payment
**Expected Flow:**
1. Add a PAID course (₹1-₹10000) to cart
2. Navigate to `/checkout`
3. Payment form shows with Card method selected
4. Enter valid card details:
   - Name: John Doe
   - Card: 4111 1111 1111 1111
   - Expiry: 12/25 (format: MM/YY)
   - CVV: 123
5. Click "Pay ₹xxxxx" button
6. Form validates client-side
7. Submits to `/api/payment/verify`
8. Backend enrolls user
9. Success screen appears
10. Redirects to `/my-courses`

**Expected Response:**
```json
{
  "success": true,
  "transactionId": "TXN-1705594800000-ABC123XYZ",
  "message": "Payment verified and enrollment completed successfully",
  "enrollmentResults": [
    { "courseId": 3, "success": true, "role": "student" }
  ],
  "enrolledCourses": [3],
  "failedCourses": []
}
```

---

### Scenario 3: Multiple Courses Enrollment
**Expected Flow:**
1. Add 2-3 courses to cart (mix of free and paid)
2. Go to checkout
3. Order summary shows all courses
4. Total amount = sum of paid courses
5. Submit payment
6. Backend enrolls user in ALL courses in batch
7. Response shows all enrollments

**Expected in Console:**
```
📚 [TXN-xxxxx] Enrolling user 6 in course 2
📚 [TXN-xxxxx] Enrolling user 6 in course 3
📚 [TXN-xxxxx] Enrolling user 6 in course 4
✅ [TXN-xxxxx] Enrollment completed: [
  { courseId: 2, success: true, role: 'student' },
  { courseId: 3, success: true, role: 'student' },
  { courseId: 4, success: true, role: 'student' }
]
```

---

### Scenario 4: Bank Transfer Payment Method
**Expected Flow:**
1. Add course to cart
2. Go to checkout
3. Select "Bank Transfer" radio button
4. Form shows bank details
5. "Please contact support with transaction ID"
6. Click "Pay" button
7. Should process same as card (demo mode)

---

### Scenario 5: UPI Payment Method
**Expected Flow:**
1. Add course to cart
2. Go to checkout
3. Select "UPI" radio button
4. Form shows UPI ID: premmcx@bank
5. Click "Pay" button
6. Should process same as card (demo mode)

---

### Scenario 6: Enrollment Fallback (Manual → Self)
**Expected Behavior:**
If manual enrollment fails, system should fallback to self-enrollment:

```
⚠️ [TXN-xxxxx] Manual enrollment failed, attempting self-enrollment
✅ [TXN-xxxxx] Self-enrollment successful for course X
```

---

### Scenario 7: Error Handling
**Test Cases:**
1. **Empty cart → Redirect to /courses** ✓
2. **Not logged in → Redirect to /auth/login** ✓
3. **Invalid card number → Shows error** (client-side validation)
4. **Expired card → Shows error** (client-side validation)
5. **Network error during verify → Shows error message**

---

## Manual Testing Checklist

### Before Starting
- [ ] Server running without errors
- [ ] Logged in with test user account
- [ ] Moodle API responding

### Home Page (/)
- [ ] Courses display correctly
- [ ] Course prices show (₹1, ₹10000, etc.)
- [ ] Add to cart works
- [ ] Cart updates

### Cart Page (/cart)
- [ ] Items show in cart
- [ ] Total price calculated
- [ ] Remove from cart works
- [ ] Checkout button navigates to /checkout

### Checkout Page (/checkout)
- [ ] Order summary displays
- [ ] User details show (name, email)
- [ ] Payment method selection works
- [ ] Form validation on submit (no empty fields)

### Payment Form
- [ ] Card number formatting (spaces every 4 digits)
- [ ] Expiry date formatting (MM/YY)
- [ ] CVV limited to 4 digits
- [ ] Required fields enforced
- [ ] Submit button disabled during processing

### Payment Processing
- [ ] Loading state appears
- [ ] Success screen shows after 2 seconds
- [ ] Redirect to /my-courses works
- [ ] Cart clears after success
- [ ] Transaction ID appears in console logs

### My Courses (/my-courses)
- [ ] Newly enrolled courses appear
- [ ] User is listed as enrolled
- [ ] Can access course content

---

## Console Logs to Watch

### Payment Flow Logs
```
🔄 [TXN-xxxxx] Processing payment: PAYMENT_METHOD for ₹AMOUNT
💳 [TXN-xxxxx] Verifying PAYMENT_METHOD payment of ₹AMOUNT
✅ [TXN-xxxxx] Payment verified successfully
📚 [TXN-xxxxx] Enrolling user USER_ID in course COURSE_ID
✅ [TXN-xxxxx] Manual enrollment successful for course COURSE_ID
✅ [TXN-xxxxx] Enrollment completed: [...]
```

### Error Logs
```
❌ [TXN-xxxxx] Payment verification error: ERROR_MESSAGE
⚠️ [TXN-xxxxx] Manual enrollment failed, attempting self-enrollment
```

---

## API Testing (curl)

### Test Payment Verification Endpoint
```bash
curl -X POST http://localhost:3000/api/payment/verify \
  -H "Content-Type: application/json" \
  -b "sessionCookie" \
  -d '{
    "courseIds": [2, 3],
    "amount": 10001,
    "paymentMethod": "card",
    "cardDetails": { "last4": "1111", "cardHolder": "John Doe" },
    "userId": "6",
    "timestamp": "2026-01-18T12:00:00Z"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "transactionId": "TXN-xxxxx",
  "message": "Payment verified and enrollment completed successfully",
  "enrollmentResults": [
    { "courseId": 2, "success": true, "role": "student" },
    { "courseId": 3, "success": true, "role": "student" }
  ],
  "enrolledCourses": [2, 3],
  "failedCourses": []
}
```

---

## Troubleshooting

### Issue: SST File Error
```
Persisting failed: Unable to write SST file 00000159.sst
```
**Solution:** Clear `.next` and `.turbopack` folders:
```powershell
Remove-Item -Path "D:\lms-prem\.next", "D:\lms-prem\.turbopack" -Recurse -Force
npm run dev
```

### Issue: PaymentForm not found
**Solution:** Ensure `src/components/PaymentForm.tsx` exists and is imported correctly

### Issue: Enrollment fails in console
**Solution:** Check Moodle API logs for:
- Invalid token
- Course ID doesn't exist
- User already enrolled
- Self-enrollment disabled on course

### Issue: Redirect doesn't work
**Solution:** Check NextAuth session is active - verify `/api/auth/session` returns valid session

---

## Success Criteria ✅

- [ ] Home page loads courses
- [ ] Add to cart works
- [ ] Checkout page displays order summary
- [ ] PaymentForm renders with all fields
- [ ] Form validation prevents submission with invalid data
- [ ] Payment processing shows loading state
- [ ] Success screen appears after payment
- [ ] Redirect to /my-courses works
- [ ] User appears enrolled in Moodle
- [ ] Transaction ID logged in console
- [ ] All courses enrolled in batch
- [ ] User role assigned correctly (STUDENT = 5)
- [ ] Free courses enroll without payment form
- [ ] Error handling shows user-friendly messages
- [ ] Fallback enrollment works if manual fails

---

## Next Steps
1. ✅ Clear caches and restart server
2. ⏳ Run through manual testing checklist
3. ⏳ Test each scenario in order
4. ⏳ Check browser console for errors
5. ⏳ Verify Moodle enrollment for each user
6. ⏳ Document any issues found
