# Real Razorpay Integration Guide

This document explains the complete Razorpay payment integration with GST taxation and backend verification.

## Overview

The system now implements **real Razorpay payment processing** with:
- ✅ Custom checkout pages (not Razorpay hosted)
- ✅ Razorpay payment gateway integration
- ✅ GST taxation (18% = 9% SGST + 9% CGST) per Indian norms
- ✅ Backend payment signature verification
- ✅ Automatic course enrollment via Moodle API
- ✅ Transaction receipt generation
- ✅ Instant course access after payment

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER FLOW                                │
├─────────────────────────────────────────────────────────────────┤

1. CHECKOUT PAGE (/checkout)
   ├─ Display courses with prices
   ├─ Calculate subtotal
   ├─ Calculate GST (18% = 9% SGST + 9% CGST)
   └─ Display total (incl. GST)
        │
        ↓
2. PAYMENT FORM (RazorpayPaymentForm)
   ├─ User clicks "Pay with Razorpay"
   ├─ POST /api/payment/create-order
   │  └─ Create Razorpay order with GST-inclusive amount
   │
   ├─ Razorpay modal opens
   │  ├─ User enters payment details
   │  └─ Razorpay processes payment
   │
   ├─ Payment response received
   └─ POST /api/payment/verify
      ├─ Verify Razorpay signature
      ├─ Enroll user in courses (Moodle API)
      └─ Redirect to receipt page
        │
        ↓
3. PAYMENT RECEIPT PAGE (/payment-receipt)
   ├─ GET /api/payment/receipt
   ├─ Display transaction details
   ├─ Show GST breakdown
   ├─ Print/Download receipt
   └─ Link to "My Courses"
        │
        ↓
4. MY COURSES PAGE
   └─ User sees newly enrolled courses
```

---

## Component Files

### Frontend Components

#### 1. **RazorpayPaymentForm** (`src/components/RazorpayPaymentForm.tsx`)
- Handles Razorpay payment initiation
- GST calculation: `amount * 1.18`
- Creates payment order via API
- Handles Razorpay modal UI
- Verifies payment with backend
- Redirects to receipt on success

```tsx
// Key features:
- Loads Razorpay SDK via script tag
- Calculates GST (9% SGST + 9% CGST)
- Displays GST breakdown in payment form
- Handles payment handler callback
- Shows loading state during payment processing
```

#### 2. **Checkout Page** (`src/app/checkout/page.tsx`)
- Modified to use RazorpayPaymentForm
- Displays GST taxation details
- Shows total amount with GST
- Supports free and paid courses

```tsx
// GST Breakdown Display:
Subtotal: ₹X
SGST (9%): ₹X * 0.09
CGST (9%): ₹X * 0.09
─────────────────────────
Total (incl. GST): ₹X * 1.18
```

### Backend API Endpoints

#### 1. **Create Order** (`/api/payment/create-order`)
```typescript
POST /api/payment/create-order

Request:
{
  "amount": 10000,              // Subtotal (before GST)
  "currency": "INR",
  "courseIds": [1, 2, 3],
  "receipt": "receipt-1234567890",
  "userEmail": "user@example.com",
  "userName": "John Doe"
}

Response:
{
  "id": "order_1234567890",     // Razorpay Order ID
  "amount": 11800,              // Amount in paise (with GST)
  "currency": "INR",
  "receipt": "receipt-1234567890",
  "status": "created"
}
```

**Logic:**
1. Receives subtotal amount (before GST)
2. Calculates GST-inclusive amount: `subtotal * 1.18`
3. Creates Razorpay order with amount in paise (amount * 100)
4. Returns order ID to frontend

#### 2. **Verify Payment** (`/api/payment/verify`)
```typescript
POST /api/payment/verify

Request:
{
  "razorpay_order_id": "order_1234567890",
  "razorpay_payment_id": "pay_1234567890",
  "razorpay_signature": "signature_hash",
  "courseIds": [1, 2, 3],
  "userEmail": "user@example.com"
}

Response:
{
  "success": true,
  "orderId": "order_1234567890",
  "paymentId": "pay_1234567890",
  "message": "Payment verified successfully"
}
```

**Logic:**
1. Verifies Razorpay signature using HMAC SHA256
2. Signature formula: `HMAC-SHA256(order_id|payment_id, secret_key)`
3. Enrolls user in courses via Moodle API
4. Returns success status

#### 3. **Fetch Receipt** (`/api/payment/receipt`)
```typescript
GET /api/payment/receipt?orderId=order_id&paymentId=pay_id

Response:
{
  "orderId": "order_1234567890",
  "paymentId": "pay_1234567890",
  "date": "15 January 2025, 02:30 PM",
  "subtotal": 10000,
  "gst": 1800,
  "total": 11800,
  "courses": [
    { "id": 1, "name": "Course 1", "price": 3933 },
    { "id": 2, "name": "Course 2", "price": 3933 },
    { "id": 3, "name": "Course 3", "price": 3934 }
  ],
  "userEmail": "user@example.com",
  "userName": "John Doe",
  "status": "completed"
}
```

**Logic:**
1. Fetches payment details from Razorpay API
2. Fetches order details from Razorpay API
3. Extracts course IDs from order notes
4. Calculates GST breakdown
5. Returns formatted receipt data

#### 4. **Old Verify Endpoint** (`/api/payment/confirm`)
- Kept for backward compatibility
- Uses same signature verification logic
- Also enrolls users in courses

---

## Payment Flow Details

### Step 1: Create Order
```
User submits checkout with:
- Courses selected
- Total price (before GST)

Frontend calls: POST /api/payment/create-order
- Request: subtotal amount = ₹10,000
- Backend calculates: GST amount = ₹1,800
- Backend creates order with: amount = ₹11,800 (in paise: 1,180,000)
- Response: order_id, razorpay_key_id
```

### Step 2: Razorpay Payment
```
Frontend shows Razorpay modal with:
- Amount: ₹11,800 (including GST)
- Order ID: order_1234567890
- Customer details: Name, Email, Phone

User enters payment details in modal:
- Card/UPI/Bank details
- Razorpay handles encryption and security

Razorpay processes payment and returns:
- payment_id
- signature (HMAC-SHA256 hash)
```

### Step 3: Verify Signature (Security)
```
Frontend receives payment response and calls: POST /api/payment/verify

Backend verifies:
1. Signature = HMAC-SHA256(order_id|payment_id, RAZORPAY_KEY_SECRET)
2. If signature matches → Payment is genuine
3. If signature doesn't match → Payment is rejected

Signature formula:
  shasum = HMAC-SHA256("order_123|pay_123", "secret_key")
  if (shasum === razorpay_signature) → Valid
```

### Step 4: Enroll User
```
After signature verification, backend:
1. Gets user ID from email via Moodle API
2. Calls Moodle enrol_manual_enrol_users webservice
3. Parameters:
   - userid: Moodle user ID
   - courseid: Course ID
   - roleid: 5 (Student role)
4. Updates enrollment status
```

### Step 5: Generate Receipt
```
Frontend redirects to: /payment-receipt?orderId=xxx&paymentId=yyy

Backend fetches from Razorpay:
1. /v1/payments/{paymentId} → Payment details
2. /v1/orders/{orderId} → Order details

Constructs receipt with:
- Subtotal: ₹10,000
- SGST (9%): ₹900
- CGST (9%): ₹900
- Total: ₹11,800
```

---

## GST Taxation Details

### Calculation
```
Subtotal (List Price): ₹10,000
  ├─ SGST (9%): ₹10,000 × 0.09 = ₹900
  └─ CGST (9%): ₹10,000 × 0.09 = ₹900
  ──────────────────────────────────────
Total GST (18%): ₹1,800
──────────────────────────────────────────
FINAL AMOUNT: ₹10,000 + ₹1,800 = ₹11,800
```

### Invoice Breakdown
The system shows per Indian GST norms:
- **Subtotal** (Taxable amount): Original course price
- **SGST** (State GST - 9%): State tax component
- **CGST** (Central GST - 9%): Central tax component
- **Total with GST** (18%): Amount charged to customer

### Display Locations
1. **Checkout Page** → Full breakdown
2. **Payment Form** → Summary in order section
3. **Payment Receipt** → Detailed breakdown

---

## Environment Variables

```env
# Razorpay Credentials (from .env.local)
RAZORPAY_KEY_ID=rzp_live_RxmGdYcNWt6JKC
RAZORPAY_KEY_SECRET=mR7OYRQQX1lp32aLtgLr8N53
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_RxmGdYcNWt6JKC

# Moodle Configuration
MOODLE_URL=https://lms.premmcxtrainingacademy.com
MOODLE_TOKEN=67a9120b2faf13be6ec9cb28453eaafb

# NextAuth Configuration
NEXTAUTH_SECRET=4f3e7c8d2b9a1f5e6c4d8a3b7f2e9c1d5a6b8f3e7d4c2b9a5f8e1d3c6a9b2e
NEXTAUTH_URL=http://localhost:3000
```

---

## Security Features

### 1. **Signature Verification**
```typescript
// Backend verification (unbreakable)
const shasum = crypto.createHmac('sha256', RAZORPAY_KEY_SECRET);
shasum.update(`${order_id}|${payment_id}`);
const digest = shasum.digest('hex');
if (digest !== razorpay_signature) → REJECT
```

### 2. **HTTPS Only**
- Razorpay SDK loaded via HTTPS
- All API calls use HTTPS
- Never expose secret key to frontend

### 3. **Amount Verification**
- Verify amount matches order
- Check amount includes correct GST

### 4. **User Verification**
- Verify user is authenticated
- Check user email matches payment
- Verify user hasn't been enrolled already

---

## Testing Guide

### Test with Razorpay Test Cards

1. **Test Successful Payment**
   ```
   Card: 4111 1111 1111 1111 (Visa)
   Expiry: Any future date (MM/YY)
   CVV: Any 3 digits
   Result: Payment successful → Enrollment completed
   ```

2. **Test Failed Payment**
   ```
   Card: 4000 0000 0000 0002 (Visa - declined)
   Expiry: Any future date
   CVV: Any 3 digits
   Result: Payment failed → User redirected to error page
   ```

3. **Webhook Testing**
   ```
   Razorpay sends webhooks on payment:
   - payment.authorized
   - payment.failed
   - payment.captured
   
   Set webhook URL in Razorpay Dashboard:
   https://yourdomain.com/api/webhook/razorpay
   ```

### Manual Testing Steps

1. Go to `/checkout` with courses in cart
2. Review GST breakdown
3. Click "Pay with Razorpay"
4. Razorpay modal appears
5. Enter test card details
6. Complete payment
7. Verify signature check passes
8. Check enrollment in Moodle
9. Receipt page displays correctly

---

## Troubleshooting

### Issue: "Order creation failed"
```
Cause: RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET missing
Fix: Check .env.local has both variables
```

### Issue: "Invalid payment signature"
```
Cause: Signature verification failed
Fix: Ensure RAZORPAY_KEY_SECRET matches Razorpay account
```

### Issue: "User not found with email"
```
Cause: User doesn't exist in Moodle
Fix: Ensure user is created in Moodle before payment
```

### Issue: "Enrollment failed"
```
Cause: MOODLE_TOKEN not sufficient permissions
Fix: Ensure token has enrol/manual:enrol capability
```

---

## Database Schema (Future Implementation)

```sql
-- Payments Table
CREATE TABLE payments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  razorpay_payment_id VARCHAR(100) UNIQUE NOT NULL,
  razorpay_order_id VARCHAR(100) UNIQUE NOT NULL,
  user_id INT NOT NULL,
  amount_paise INT NOT NULL, -- Amount in paise (amount * 100)
  currency VARCHAR(3) DEFAULT 'INR',
  status ENUM('pending', 'captured', 'failed', 'refunded'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Payment Courses Table
CREATE TABLE payment_courses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  payment_id INT NOT NULL,
  course_id INT NOT NULL,
  amount_paise INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (payment_id) REFERENCES payments(id)
);

-- Receipts Table
CREATE TABLE receipts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  payment_id INT NOT NULL,
  subtotal_amount INT NOT NULL,
  gst_amount INT NOT NULL,
  total_amount INT NOT NULL,
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (payment_id) REFERENCES payments(id)
);
```

---

## API Documentation

### Create Order Endpoint
```
POST /api/payment/create-order
Authorization: NextAuth Session (Required)

Request Body:
{
  "amount": 10000,              // Subtotal in rupees
  "currency": "INR",            // Optional, defaults to INR
  "courseIds": [1, 2, 3],       // Array of course IDs
  "receipt": "receipt-xxx",     // Unique receipt identifier
  "userEmail": "user@email.com",
  "userName": "User Full Name"
}

Response (200):
{
  "id": "order_xxx",            // Razorpay Order ID
  "amount": 1180000,            // Amount in paise (with GST)
  "currency": "INR",
  "receipt": "receipt-xxx",
  "status": "created"
}

Error Response (400):
{
  "error": "Invalid amount"
}

Error Response (500):
{
  "error": "Failed to create order"
}
```

### Verify Payment Endpoint
```
POST /api/payment/verify

Request Body:
{
  "razorpay_order_id": "order_xxx",
  "razorpay_payment_id": "pay_xxx",
  "razorpay_signature": "signature_hash",
  "courseIds": [1, 2, 3],
  "userEmail": "user@email.com"
}

Response (200):
{
  "success": true,
  "orderId": "order_xxx",
  "paymentId": "pay_xxx",
  "message": "Payment verified successfully"
}

Error Response (400):
{
  "error": "Missing payment details"
}

Error Response (401):
{
  "error": "Invalid payment signature"
}

Error Response (500):
{
  "error": "Payment verification failed"
}
```

### Get Receipt Endpoint
```
GET /api/payment/receipt?orderId=order_xxx&paymentId=pay_xxx

Response (200):
{
  "orderId": "order_xxx",
  "paymentId": "pay_xxx",
  "date": "15 January 2025, 02:30 PM",
  "subtotal": 10000,
  "gst": 1800,
  "total": 11800,
  "courses": [...],
  "userEmail": "user@email.com",
  "userName": "User Full Name",
  "status": "completed"
}

Error Response (400):
{
  "error": "Missing order or payment ID"
}

Error Response (500):
{
  "error": "Failed to fetch receipt details"
}
```

---

## Future Enhancements

1. **Database Storage**
   - Store payments in database
   - Add payment history tracking
   - Support payment refunds

2. **Email Receipts**
   - Send receipt to user email
   - Automatic receipt generation
   - PDF receipt download

3. **Webhook Handling**
   - Handle Razorpay webhooks
   - Automatic reconciliation
   - Failed payment retry logic

4. **Analytics**
   - Track conversion rates
   - Monitor failed payments
   - Revenue reporting

5. **Bulk Enrollment**
   - Group payment enrollment
   - Corporate bulk payments
   - Subscription support

---

## Support & Documentation

- **Razorpay Docs:** https://razorpay.com/docs/
- **Razorpay SDK:** https://github.com/razorpay/razorpay-js
- **Indian GST:** https://www.gst.gov.in/
- **Moodle Enrol API:** https://docs.moodle.org/en/Web_services

---

**Last Updated:** January 2025
**Status:** Production Ready ✅
