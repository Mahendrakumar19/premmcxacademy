# Payment System Testing Guide

## Quick Start Testing

### Setup
1. Ensure the dev server is running: `npm run dev`
2. Navigate to http://localhost:3000
3. Login with your credentials or create a test account

### Test Scenario 1: Card Payment (Successful)

**Steps:**
1. Navigate to the Courses page
2. Add 2-3 courses to your cart (click "Add to Cart" on course cards)
3. Click on the cart icon or navigate to `/cart`
4. Review items and click "Proceed to Checkout"
5. Verify your enrollment details are shown
6. Select **Card** as payment method
7. Enter test card details:
   - **Card Number:** `4111 1111 1111 1111` (Visa)
   - **Expiry Date:** `12/25` (or any future date in MM/YY format)
   - **CVV:** `123` (any 3 digits)
   - **Cardholder Name:** `Test User` (any name)
8. Click **"Pay Now"** button
9. **Expected Result:** Should redirect to `/payment-success` page with:
   - Green checkmark icon
   - Transaction ID displayed
   - List of enrolled courses
   - "Enrolled Successfully" message
   - Auto-redirect to `/my-courses` after 3 seconds

**Verification:**
```javascript
// Check transaction in browser console
JSON.parse(localStorage.getItem('payment_transactions'))
// Should show transaction with status: "completed"
```

---

### Test Scenario 2: Card Payment (Invalid Card)

**Steps:**
1. Repeat steps 1-6 from Scenario 1
2. Enter an invalid card number:
   - **Card Number:** `1234 5678 9012 3456` (invalid format)
   - **Expiry Date:** `12/25`
   - **CVV:** `123`
   - **Cardholder Name:** `Test User`
3. Click **"Pay Now"** button
4. **Expected Result:** Form shows error message:
   - "Invalid card number"
   - Form stays on checkout page
   - Payment not processed

**Verification:**
- Check that no transaction was added to localStorage
- Error message is displayed in red

---

### Test Scenario 3: Card Payment (Expired Card)

**Steps:**
1. Repeat steps 1-6 from Scenario 1
2. Enter expired card details:
   - **Card Number:** `4111 1111 1111 1111`
   - **Expiry Date:** `01/20` (past date)
   - **CVV:** `123`
   - **Cardholder Name:** `Test User`
3. Click **"Pay Now"** button
4. **Expected Result:** Form shows error message:
   - "Card has expired"
   - Form stays on checkout page

---

### Test Scenario 4: Bank Transfer Payment

**Steps:**
1. Repeat steps 1-6 from Scenario 1
2. Select **Bank Transfer** as payment method
3. Click **"Proceed to Payment"** button
4. **Expected Result:** Redirects to `/payment-pending?transactionId=BANK-...&method=bank_transfer` with:
   - Bank account details displayed:
     - Account Name: Prem MCX Training
     - Account Number: 1234567890
     - IFSC Code: ICIC0000001
   - Reference ID showing (with copy button)
   - Amount due: ₹1,00,000
   - Step-by-step instructions
   - "Verify Payment" button

**User Action:**
5. Copy the Reference ID
6. (In real scenario) Transfer the amount to the bank account with Reference ID in remarks
7. Once transfer is sent, click "Verify Payment" button
8. Enter any transaction ID (10+ digits): e.g., `402365812945`
9. Click "Verify Payment"
10. **Expected Result:** 
    - "Verifying..." spinner shows for 2 seconds
    - Success message: "Payment verified successfully!"
    - Auto-redirect to `/payment-success` after 3 seconds
    - Enrollment simulation begins

---

### Test Scenario 5: UPI Payment

**Steps:**
1. Repeat steps 1-6 from Scenario 1
2. Select **UPI** as payment method
3. Click **"Proceed to Payment"** button
4. **Expected Result:** Redirects to `/payment-pending?transactionId=UPI-...&method=upi` with:
   - UPI ID displayed: `premmcx@bank` (with copy button)
   - Step-by-step instructions:
     - Open UPI app
     - Paste UPI ID or scan code
     - Enter amount
     - Complete payment
   - Amount due: ₹1,00,000
   - Reference ID (auto-generated)

**User Action:**
5. (In real scenario) Open UPI app and send money to `premmcx@bank`
6. Get transaction ID from UPI app
7. Click "Verify Payment" button
8. Enter UPI transaction ID
9. Click "Verify Payment"
10. **Expected Result:** Same as Bank Transfer - success page with enrollment

---

### Test Scenario 6: Payment Timeout

**Steps:**
1. Go to `/payment-pending` page
2. Wait for 5 minutes without verifying
3. **Expected Result:** 
   - Auto-redirect to `/payment-failed?reason=timeout`
   - Error message: "Payment Timeout"
   - Display troubleshooting steps
   - Option to retry payment

---

### Test Scenario 7: Payment Verification Failed

**Steps:**
1. Go to `/payment-pending` page with reference ID
2. Click "Verify Payment"
3. Enter invalid transaction ID: `123` (less than 10 digits)
4. Click "Verify Payment"
5. **Expected Result:**
   - Error message: "Invalid verification code"
   - Form remains visible
   - Can try again with correct code

---

### Test Scenario 8: Receipt Download

**Steps:**
1. Complete a successful card payment (Scenario 1)
2. On success page, look for **"Download Receipt"** button
3. Click on it
4. **Expected Result:**
   - File downloads: `receipt-TXN-{id}.txt`
   - File contains:
     - Transaction ID
     - Date & Time
     - Payer information
     - Course list
     - Total amount
     - Important notes

**File Content Example:**
```
╔════════════════════════════════════════════════════════════════╗
║                    PAYMENT RECEIPT                             ║
║               Prem MCX Training Academy                        ║
╚════════════════════════════════════════════════════════════════╝

Transaction ID: TXN-1234567890-ABC123DEF
Date & Time: January 15, 2024 at 10:30 AM
Status: COMPLETED

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PAYER INFORMATION:
Name: John Doe
Email: john@example.com

...
```

---

### Test Scenario 9: Payment History

**Steps:**
1. Complete multiple payments (mix of card, bank, UPI)
2. Navigate to `/payment-history`
3. **Expected Result:**
   - List of all transactions from localStorage
   - Shows transaction ID, date, amount, method, status
   - Can view/download individual receipts
   - Search/filter functionality

---

### Test Scenario 10: Course Enrollment

**Steps:**
1. Complete a payment successfully
2. On success page, watch enrollment animation:
   - Shows "Enrolling in {course_name}..."
   - Green checkmark when complete
   - Status: "Enrolled Successfully"
3. After all courses show green checkmarks
4. **Expected Result:**
   - Auto-redirect to `/my-courses?enrolled=true`
   - New courses appear in "My Courses" list
   - Each course shows access granted

---

## Browser Console Testing

### Check Transaction History
```javascript
// View all payment transactions
const transactions = JSON.parse(localStorage.getItem('payment_transactions'))
console.table(transactions)

// Output:
// [
//   {
//     transactionId: "TXN-1234567890-ABC123DEF",
//     courseIds: [1, 2, 3],
//     amount: 100000,
//     paymentMethod: "card",
//     status: "completed",
//     ...
//   }
// ]
```

### Clear Test Data
```javascript
// Clear all transactions
localStorage.removeItem('payment_transactions')

// Verify cleared
console.log(localStorage.getItem('payment_transactions')) // null
```

### Check Environment Variables
```javascript
// Check if Razorpay credentials are loaded
console.log({
  razorpayKeyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  // Note: Secret should never be exposed on frontend
})
```

---

## Error Scenarios

### Test Scenario A: Missing Required Fields

**Steps:**
1. Go to checkout
2. Select Card payment
3. Leave one field empty:
   - Card Number, Expiry, CVV, or Cardholder Name
4. Click "Pay Now"
5. **Expected Result:** 
   - Error message for missing field
   - Form validation prevents submission

---

### Test Scenario B: Network Error Simulation

**Steps:**
1. Open DevTools (F12)
2. Go to Network tab
3. Check "Offline" mode
4. Try to make a payment
5. **Expected Result:**
   - Error message about network
   - Option to retry

---

### Test Scenario C: Local Storage Disabled

**Steps:**
1. Open DevTools (F12)
2. Application → Storage → localStorage → Disable
3. Try to make a payment
4. **Expected Result:**
   - Warning or error about localStorage
   - Cannot save transaction history

---

## Mobile Testing

### Test on Mobile Device

**Steps:**
1. Get your local IP: `ipconfig` (Windows)
2. On mobile, open: `http://{YOUR_IP}:3000`
3. Test payment flow on mobile:
   - Responsive payment form
   - Touch-friendly buttons
   - Mobile-optimized success page
   - Receipt readable on mobile
   - Download receipt on mobile

**Expected Results:**
- All pages responsive
- Forms work on mobile keyboard
- Download works with mobile browser
- Readability optimal at mobile screen sizes

---

## Performance Testing

### Measure Page Load Times

```javascript
// In browser console
performance.timing.loadEventEnd - performance.timing.navigationStart
// Should be < 3 seconds for fast load

// Check specific page timing
window.performance.measure('checkout', 'navigationStart', 'loadEventEnd')
console.log(performance.getEntriesByType('measure'))
```

### Test Network Speed

1. Open DevTools
2. Network tab → Throttle (set to "Slow 3G")
3. Complete payment flow
4. **Expected Results:**
   - Form still responsive
   - Feedback remains visible
   - No timeouts during validation

---

## Regression Testing Checklist

- [ ] Courses load on home page
- [ ] Add to cart functionality works
- [ ] Cart displays correct total
- [ ] Checkout page loads with cart items
- [ ] Session auth checks pass
- [ ] Card form validates input
- [ ] Bank transfer shows correct account details
- [ ] UPI shows correct ID
- [ ] Payment success page displays correctly
- [ ] Receipt download generates file
- [ ] Enrollment simulation runs
- [ ] Navigation links work
- [ ] Error messages display correctly
- [ ] No console errors/warnings
- [ ] LocalStorage saves transactions
- [ ] Mobile responsive design
- [ ] Desktop version working
- [ ] All buttons clickable
- [ ] Form inputs accepting data
- [ ] Redirects working correctly

---

## Performance Benchmarks

| Metric | Target | Current |
|--------|--------|---------|
| Checkout page load | < 2s | ✓ |
| Payment form submit | < 1s | ✓ |
| Success page load | < 1s | ✓ |
| Receipt download | < 500ms | ✓ |
| Form validation | < 100ms | ✓ |
| Mobile page load | < 3s | ✓ |

---

## Common Test Issues & Solutions

| Issue | Solution |
|-------|----------|
| Payment not redirecting | Clear browser cache, check console for errors |
| Transaction not saved | Check localStorage enabled in browser |
| Form not validating | Check card format (16 digits with spaces) |
| Receipt not downloading | Check browser download permissions |
| Page loading slowly | Check network throttle settings |
| Mobile not responsive | Update viewport in DevTools |

---

## Test Environment Setup

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Modern browser (Chrome, Firefox, Safari, Edge)
- `.env.local` file configured with correct URLs
- Dev server running: `npm run dev`

### Browser Requirements
- JavaScript enabled
- LocalStorage enabled
- Cookies enabled
- Download permissions enabled
- Responsive design mode (for mobile testing)

### Test Data

**Test Courses:**
- Advanced MCX Trading (ID: 1)
- Technical Analysis (ID: 2)
- Risk Management (ID: 3)

**Test User:**
- Email: test@example.com
- Password: Test@123
- Roles: Student/Admin (depending on setup)

---

## Automated Testing (Future)

```javascript
// Example Cypress test for payment flow
describe('Payment System', () => {
  it('should complete card payment', () => {
    cy.visit('/checkout')
    cy.get('[data-test="payment-method-card"]').click()
    cy.get('[name="cardNumber"]').type('4111111111111111')
    cy.get('[name="expiryDate"]').type('1225')
    cy.get('[name="cvv"]').type('123')
    cy.get('[name="cardHolder"]').type('Test User')
    cy.get('[data-test="pay-button"]').click()
    cy.url().should('include', '/payment-success')
    cy.get('[data-test="success-icon"]').should('be.visible')
  })
})
```

---

## Support & Debugging

### Enable Debug Logging

Add to PaymentForm component:

```typescript
useEffect(() => {
  console.log('Payment Form Debug Info', {
    cardNumber: cardDetails.cardNumber.slice(-4),
    paymentMethod,
    loading,
    error,
    transactionsInStorage: JSON.parse(
      localStorage.getItem('payment_transactions') || '[]'
    ).length,
  })
}, [cardDetails, paymentMethod, loading, error])
```

### Check Logs

```bash
# Check browser console for errors
# Open DevTools (F12) → Console tab
# Look for red error messages or yellow warnings
```

### Contact Support

- **Email:** support@premmcx.com
- **Phone:** +91 9876 543 210
- **Support Hours:** Mon-Fri, 9 AM - 6 PM IST
- **Include in bug report:**
  - Browser and version
  - Error message (exact text)
  - Steps to reproduce
  - LocalStorage transaction data
  - Network tab screenshot
