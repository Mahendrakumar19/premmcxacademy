# Learning Platform Integration Configuration Guide

This document explains how to configure your learning platform backend to support automatic login and restricted payment flow with the Next.js frontend.

## 1. Web Services Configuration

### Enable Web Services
1. In your learning platform admin panel
2. Enable web services 
3. Configure external services according to your platform's documentation
4. Create a new service or use the existing web service configuration

### Create Web Service Tokens
1. In your learning platform admin panel, navigate to the web services tokens section
2. Create tokens for:
   - **User token**: For user-specific operations (stored in user session)
   - **Payment token**: For payment-related operations (stored in environment variables)

### Required Permissions
Ensure the service user has these permissions:
- Access to view courses
- Access to enroll in courses
- Access to manage roles
- Access to view payments
- Access to connect payment gateways

## 2. Payment Gateway Configuration

### Payment Gateway Setup
1. Install the payment gateway plugin in your learning platform
2. Navigate to the payment methods section in your admin panel
3. Enable your payment provider and configure:
   - API Key
   - API Secret
   - Webhook URL (optional for real-time updates)

### Course Enrollment Configuration
1. For each paid course, navigate to the enrollment methods section
2. Add payment-based enrollment method
3. Set the fee amount (this should match the `coursecost` custom field)
4. Configure payment gateway

## 3. Custom Fields Configuration

### Course Cost Field
1. Navigate to the custom fields section in your admin panel
2. Create a new custom field:
   - **Short name**: `coursecost`
   - **Name**: `Course Cost`
   - **Type**: Text
   - **Category**: Pricing (create if doesn't exist)

### Currency Field
1. Create another custom field:
   - **Short name**: `currency`
   - **Name**: `Currency`
   - **Type**: Text
   - **Default**: `INR`

## 4. Auto-Login and Payment Return URL Configuration

### Payment Return URL
When redirecting to the learning platform for payment, the URL should include:
```
/enrol/index.php?id={courseId}&token={userToken}&returnUrl={encodedReturnUrl}
```

Where:
- `courseId`: The course ID to enroll in
- `userToken`: The user's token for auto-login
- `returnUrl`: The URL to return to after payment (URL-encoded)

### Webhook Endpoint
Configure your learning platform to send payment notifications to:
```
POST /api/payment-callback
```

## 5. Security Considerations

### Token Security
- Store the payment token securely in environment variables
- Never expose tokens to the client-side
- Use short-lived tokens where possible
- Implement proper token validation

### Payment Verification
- Always verify payment status through learning platform API
- Don't rely solely on client-side confirmation
- Implement server-side enrollment verification

## 6. API Endpoints Used

### Required Learning Platform Web Service Functions
- `core_enrol_get_users_courses` - Get user's enrolled courses
- `core_enrol_get_course_enrolment_methods` - Get course enrollment methods
- `enrol_manual_enrol_users` - Manual enrollment (admin token required)
- `enrol_self_enrol_user` - Self enrollment (user token required)
- `paygw_razorpay_get_config_for_js` - Get payment gateway configuration
- `paygw_razorpay_create_transaction_complete` - Complete payment transaction
- `core_payment_create_payment_intent` - Create payment intent

## 7. Environment Variables Required

In your learning platform installation, ensure these settings are properly configured:
- Web services enabled
- Payment gateways configured
- CORS settings allow your Next.js frontend domain
- Proper SSL certificates for secure communication