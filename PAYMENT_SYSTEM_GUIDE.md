# Custom Payment System - Complete Guide

## Overview

This document describes the custom payment system implemented in the LMS application. The system validates payment details against environment variables and creates a complete frontend-only payment flow with multiple pages for different transaction states.

## Architecture

### Payment Flow

```
User → Checkout Page → PaymentForm Component → Payment Processing
                              ↓
         ├─ Card Payment → Validate Against Test Cards → Payment Success
         ├─ Bank Transfer → Manual Verification → Payment Pending
         └─ UPI Payment → Manual Verification → Payment Pending
```

### Key Components

#### 1. **PaymentForm Component** (`src/components/PaymentForm.tsx`)

The core payment form component that handles all payment methods:

**Features:**
- Card payment with client-side validation
- Bank transfer with manual verification flow
- UPI payment with manual verification flow
- Payment method selection (Card/Bank/UPI)
- Card details formatting (spaces, MM/YY format, CVV limit)
- Environment variable validation against Razorpay credentials

**Payment Methods:**

```typescript
// Card Payment
- Validates against test cards and environment variables
- Creates immediate transaction record
- Redirects to payment-success page
- Test cards (demo):
  - 4111111111111111 (Visa)
  - 5555555555554444 (Mastercard)
  - 378282246310005 (Amex)

// Bank Transfer
- Shows bank account details
- Requires transaction ID for verification
- Redirects to payment-pending page
- Account: Prem MCX Training
- IFSC: ICIC0000001

// UPI
- Shows UPI ID (premmcx@bank)
- Requires transaction ID for verification
- Redirects to payment-pending page
```

**Key Methods:**

```typescript
handleCardChange(e) // Format card number, expiry, CVV input
validateCardDetails() // Client-side validation (16-digit card, expiry, CVV)
handlePayment() // Process payment based on method selected
```

#### 2. **Checkout Page** (`src/app/checkout/page.tsx`)

Main checkout interface that displays:
- Order summary with course details
- Enrollment information (user details from session)
- PaymentForm component integration
- Success/error handling

**Features:**
- Session authentication check
- Cart total calculation
- Course list with prices
- Payment form integration
- On-success redirect handling

#### 3. **Payment Success Page** (`src/app/payment-success/page.tsx`)

Displays after successful card payment:
- Transaction confirmation with ID, date, amount
- Enrollment status tracking (per-course success/failure)
- Simulated enrollment animation
- Receipt download functionality
- Auto-redirect to `/my-courses` after 3 seconds
- Action buttons: Go to Courses, Browse More, View Receipt

**Features:**
- Transaction details from URL parameters
- Enrollment simulation with visual feedback
- Receipt generation and download
- Auto-navigation to my-courses page

#### 4. **Payment Pending Page** (`src/app/payment-pending/page.tsx`)

Displayed for bank transfer and UPI methods:
- Payment instructions (method-specific)
- Reference ID display with copy button
- Bank account details (for bank transfer)
- UPI ID (for UPI)
- Amount due display
- Manual verification flow
- Support contact information
- Auto-redirect timeout (5 minutes)

**Features:**
- Method-specific instructions (Bank/UPI)
- Copy-to-clipboard for IDs and account details
- Visual instructions with step-by-step guide
- Support contact options
- Timeout redirect to payment-failed

#### 5. **Payment Failed Page** (`src/app/payment-failed/page.tsx`)

Displayed when payment fails or times out:
- Error message (specific to failure reason)
- Troubleshooting steps
- Alternative payment method suggestions
- Retry button
- Contact support options
- Transaction ID display (if available)

**Failure Reasons:**
- `insufficient_funds` - Not enough balance
- `card_declined` - Card rejected by bank
- `invalid_details` - Wrong payment information
- `timeout` - Session expired
- `network_error` - Connection issue
- `unknown` - Generic failure

#### 6. **Payment Receipt Page** (`src/app/payment-receipt/page.tsx`)

Complete receipt viewer and downloader:
- Transaction details (ID, date, amount, method)
- Payer information
- Enrolled courses list
- Total amount breakdown
- Download to text file
- Print support
- Important notes
- Quick navigation buttons

**Features:**
- Receipt download as `.txt` file
- Print-ready formatting with CSS media queries
- Detailed transaction breakdown
- Payer and course information
- Auto-generated formatted receipt

#### 7. **Payment Verify Page** (`src/app/payment-verify/page.tsx`)

Manual verification for bank/UPI transfers:
- Reference ID display
- Step-by-step instructions
- Transaction ID input field
- Verification processing with feedback
- Success/failure states
- Contact support for unresolved payments
- Back navigation options

**Features:**
- Transaction ID/UTR/Reference input
- Real-time verification simulation
- Success/error feedback
- Redirect to payment-success on verification
- Support contact options

## Environment Variables

Required variables in `.env.local`:

```bash
# Razorpay Configuration
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_RxmGdYcNWt6JKC
NEXT_PUBLIC_RAZORPAY_KEY_SECRET=mR7OYRQQX1lp32aLtgLr8N53

# Moodle Configuration
MOODLE_URL=https://lms.premmcxtrainingacademy.com
MOODLE_TOKEN=your_token
MOODLE_COURSE_TOKEN=your_token
MOODLE_CREATE_USER_TOKEN=your_token
MOODLE_PAYMENT_TOKEN=your_token

# NextAuth Configuration
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=http://localhost:3000
JWT_SECRET=your_jwt_secret
```

## Data Flow

### Card Payment Flow

```
1. User enters card details in PaymentForm
   ↓
2. Client-side validation (16-digit, expiry, CVV)
   ↓
3. Validate against test cards / Razorpay credentials
   ↓
4. Generate transaction ID: TXN-{timestamp}-{random}
   ↓
5. Store in localStorage: payment_transactions
   ↓
6. Redirect to /payment-success?transactionId={id}&courses={ids}
   ↓
7. Show confirmation, simulate enrollment
   ↓
8. Auto-redirect to /my-courses after 3 seconds
```

### Bank/UPI Payment Flow

```
1. User selects Bank Transfer or UPI
   ↓
2. Generate transaction ID: BANK-{timestamp}-{random} or UPI-{timestamp}-{random}
   ↓
3. Store in localStorage with 'pending_verification' status
   ↓
4. Redirect to /payment-pending?transactionId={id}&method={method}
   ↓
5. Show account details or UPI ID with instructions
   ↓
6. User completes transfer and gets transaction ID from bank
   ↓
7. User enters transaction ID in verification form
   ↓
8. Verification redirects to /payment-success?transactionId={id}&status=verified
   ↓
9. Show confirmation and enrollment status
```

## Transaction Storage

### localStorage Structure

```javascript
// Key: 'payment_transactions'
// Value: Array of transaction objects

{
  transactionId: "TXN-1234567890-ABC123DEF",
  courseIds: [1, 2, 3],
  amount: 100000,
  paymentMethod: "card", // "card" | "bank_transfer" | "upi"
  cardLast4: "4111", // Only for card payments
  cardHolder: "John Doe", // Only for card payments
  timestamp: "2024-01-15T10:30:00.000Z",
  status: "completed", // "completed" | "pending_verification" | "failed"
  validatedAgainstEnv: true
}
```

## Testing

### Test Card Numbers (Demo Mode)

```
Visa: 4111 1111 1111 1111
Mastercard: 5555 5555 5555 4444
American Express: 3782 822463 10005

Expiry: Any future date (MM/YY)
CVV: Any 3 digits
Cardholder: Any name
```

### Testing Payment Flow

**Card Payment:**
```
1. Add courses to cart
2. Go to /checkout
3. Enter test card number (4111111111111111)
4. Enter future expiry date (e.g., 12/25)
5. Enter CVV (e.g., 123)
6. Enter cardholder name
7. Click "Pay Now"
8. View /payment-success page
9. Verify enrollment simulation
10. Auto-redirect to /my-courses
```

**Bank Transfer:**
```
1. Add courses to cart
2. Go to /checkout
3. Select "Bank Transfer" method
4. Click "Proceed to Payment"
5. View /payment-pending page with bank details
6. Note the Reference ID
7. Click "Verify Payment"
8. Enter any 10+ digit transaction ID
9. View success confirmation
10. Auto-redirect to /payment-success
```

**UPI Payment:**
```
1. Add courses to cart
2. Go to /checkout
3. Select "UPI" method
4. Click "Proceed to Payment"
5. View /payment-pending page with UPI details
6. Copy UPI ID or scan code
7. Click "Verify Payment"
8. Enter transaction ID from UPI app
9. View success confirmation
10. Auto-redirect to /payment-success
```

## API Routes

The system uses primarily client-side processing. No backend API calls are made for payment verification. All validation is done on the frontend.

### Notable Disabled Routes

- `/api/payment/verify` - Backend verification (now replaced with localStorage)
- `/api/payment/confirm` - Backend confirmation (replaced with client-side redirects)

### Active Routes

- `/api/courses` - Fetch available courses (still used)
- `/api/auth/[...nextauth]` - Authentication (still used)
- `/api/enrollment/*` - Enrollment endpoints (still used)

## Security Considerations

### Frontend-Only Approach

**Advantages:**
- Fast, no network latency
- Works offline for credentials validation
- Simple testing and debugging
- Transparent for demo/testing

**Disadvantages:**
- No real payment processing (demo only)
- Credentials visible in client code (OK for test credentials)
- No backend fraud detection
- Manual verification required for bank/UPI

### Production Recommendations

1. **Integrate Real Payment Gateway:**
   ```typescript
   // Use Razorpay SDK or similar
   import Razorpay from 'razorpay'
   
   const razorpay = new Razorpay({
     key_id: process.env.RAZORPAY_KEY_ID,
     key_secret: process.env.RAZORPAY_KEY_SECRET,
   })
   ```

2. **Backend Verification:**
   ```typescript
   // Verify payment on backend before enrolling
   const verifyPayment = async (transactionId, amount) => {
     const verified = await razorpay.payments.fetch(transactionId)
     return verified.status === 'captured'
   }
   ```

3. **Secure Enrollment:**
   ```typescript
   // Only enroll after backend verification
   POST /api/enrollment/verify
   - Verify payment on backend
   - Enroll user in Moodle
   - Return enrollment status
   ```

4. **SSL/TLS:**
   - Ensure HTTPS in production
   - Keep payment page encrypted

5. **PCI Compliance:**
   - Never store card data locally
   - Use tokenization for cards
   - Comply with PCI DSS standards

## Enrollment System

### Current Implementation

The `/payment-success` page simulates enrollment with:

```typescript
const enrollUserInCourses = async () => {
  for (const courseId of courses) {
    // Simulate 500ms per course enrollment
    await new Promise((resolve) => setTimeout(resolve, 500))
    
    // Update enrollment status
    setEnrollmentStatus(prev => ({
      ...prev,
      [courseId]: { status: 'completed', role: 'student' }
    }))
  }
}
```

### Production Implementation

Should call Moodle API:

```typescript
const enrollUserInCourses = async (userId, courseIds) => {
  for (const courseId of courseIds) {
    const response = await fetch(`${MOODLE_URL}/webservice/rest/server.php`, {
      method: 'POST',
      body: new URLSearchParams({
        wstoken: MOODLE_PAYMENT_TOKEN,
        wsfunction: 'enrol_manual_enrol_users',
        moodlewsrestformat: 'json',
        enrolments: JSON.stringify([
          {
            userid: userId,
            courseid: courseId,
            roleid: 5, // Student role
          }
        ])
      })
    })
    
    const data = await response.json()
    setEnrollmentStatus(prev => ({
      ...prev,
      [courseId]: {
        status: data.success ? 'completed' : 'failed',
        role: 'student'
      }
    }))
  }
}
```

## Troubleshooting

### Common Issues

1. **Payment form not submitting**
   - Check card validation: must be 16 digits
   - Expiry must be MM/YY format with future date
   - CVV must be 3-4 digits
   - Cardholder name must not be empty

2. **Redirect not working**
   - Check browser console for errors
   - Ensure localStorage is enabled
   - Verify correct transaction ID in URL

3. **Data not persisting**
   - Check localStorage is enabled
   - Clear browser cache and try again
   - Check that `payment_transactions` key exists

4. **Enrollment simulation stuck**
   - Check browser console for JavaScript errors
   - Refresh page to reset state
   - Check that courses array is not empty

### Debug Commands

```javascript
// Check payment transactions in localStorage
JSON.parse(localStorage.getItem('payment_transactions'))

// Check payment methods support
console.log({
  localStorage: typeof Storage !== 'undefined',
  fetch: typeof fetch !== 'undefined',
  env: {
    razorpayKey: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  }
})

// Clear all payment data
localStorage.removeItem('payment_transactions')
```

## File Structure

```
src/
├── app/
│   ├── checkout/
│   │   └── page.tsx (Checkout page with PaymentForm)
│   ├── payment-success/
│   │   └── page.tsx (Success confirmation & enrollment)
│   ├── payment-pending/
│   │   └── page.tsx (Bank/UPI payment instructions)
│   ├── payment-failed/
│   │   └── page.tsx (Payment failure handling)
│   ├── payment-receipt/
│   │   └── page.tsx (Receipt viewer & downloader)
│   ├── payment-verify/
│   │   └── page.tsx (Manual verification for bank/UPI)
│   └── ...other pages
├── components/
│   ├── PaymentForm.tsx (Main payment form component)
│   ├── Navbar.tsx
│   └── ...other components
└── ...other directories
```

## URLs Reference

| Page | URL | Purpose |
|------|-----|---------|
| Checkout | `/checkout` | Main payment page |
| Success | `/payment-success` | Payment confirmation |
| Pending | `/payment-pending` | Bank/UPI instructions |
| Failed | `/payment-failed` | Payment error page |
| Receipt | `/payment-receipt` | Receipt viewer |
| Verify | `/payment-verify` | Manual verification |

## Future Enhancements

1. **Real Payment Gateway Integration**
   - Connect to Razorpay SDK
   - Implement secure tokenization
   - Add webhook handlers

2. **Payment Retry Logic**
   - Automatic retry mechanism
   - Failed payment tracking
   - Manual retry options

3. **Analytics & Reporting**
   - Payment success rate tracking
   - Revenue reporting
   - Enrollment conversion metrics

4. **Customer Support**
   - Live chat integration
   - Payment dispute handling
   - Refund processing

5. **Compliance**
   - PCI DSS compliance
   - GDPR implementation
   - Payment reconciliation

## Support

For issues or questions about the payment system:
- Email: support@premmcx.com
- Phone: +91 9876 543 210
- Documentation: Check code comments in respective components
