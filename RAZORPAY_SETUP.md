# Razorpay Payment Gateway Setup Guide

## ❌ Issue: "Failed to create order"

This error occurs when the Razorpay API credentials are not configured in your environment variables.

---

## ✅ What I Fixed

### 1. **Better Error Handling in Create Order API** ([src/app/api/payment/create-order/route.ts](src/app/api/payment/create-order/route.ts))
   - Added validation for missing environment variables
   - Improved error messages to help diagnose issues
   - Added amount validation (minimum ₹0.01)
   - Better logging of payment details

### 2. **Improved Payment Form Component** ([src/app/api/payment/create-order/route.ts](src/components/RazorpayPaymentForm.tsx))
   - Added script loading indicator
   - Better validation before payment attempt
   - Added Razorpay SDK availability check
   - Better error message display

---

## 🔧 Required Setup

### Step 1: Get Razorpay Credentials

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Log in or create an account
3. Navigate to **Settings → API Keys**
4. Copy your:
   - **Key ID** (starts with `rzp_`)
   - **Key Secret** (keep this secret!)

### Step 2: Set Environment Variables

Create a `.env.local` file in your project root with these variables:

```env
# Razorpay Payment Gateway
RAZORPAY_KEY_ID=rzp_your_key_id_here
RAZORPAY_KEY_SECRET=your_key_secret_here

# Public key for frontend
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_your_key_id_here
```

### Step 3: Verify Setup

After adding the environment variables:

1. **Restart the development server**
   ```bash
   npm run dev
   ```

2. **Test payment flow**
   - Go to checkout page
   - Try purchasing a course
   - Check browser console for logs

---

## 🧪 Testing

### Test Razorpay Credentials
Use these test credentials in development/sandbox mode:

**Key ID:** `rzp_test_1DP5mmOlF5G5ag`
**Key Secret:** `aRuwytoUeKx0F9LGRaF0TNrU`

### Test Payment Cards

Razorpay provides test cards:
- **Success:** `4111 1111 1111 1111`
- **Failed:** `4222 2222 2222 2222`
- **Declined:** `4000 0000 0000 0002`

Use any future expiry date and any 3-digit CVV.

---

## 📋 Troubleshooting

### Error: "Missing Razorpay credentials"
- [ ] Verify `.env.local` file exists
- [ ] Check `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are set
- [ ] Restart dev server after adding env variables
- [ ] Check environment variables are not empty

### Error: "Payment gateway is not configured"
- [ ] Ensure `NEXT_PUBLIC_RAZORPAY_KEY_ID` is set
- [ ] This is the public key (safe to expose)

### Error: "Razorpay SDK failed to load"
- [ ] Check internet connection
- [ ] Verify no firewall blocking `checkout.razorpay.com`
- [ ] Try clearing browser cache
- [ ] Check browser console for network errors

### Error: "Failed to create order" (after setup)
- [ ] Check Razorpay key ID format (must start with `rzp_`)
- [ ] Verify account doesn't have API access restrictions
- [ ] Check Razorpay dashboard for any alerts
- [ ] Make sure you're using test credentials in development

---

## 🔐 Security Best Practices

1. **Never commit `.env.local` to Git**
   - Add to `.gitignore` (already included)
   - Use `.env.example` for documentation

2. **Keep secrets secret**
   - Only `RAZORPAY_KEY_ID` is public (prefixed with `NEXT_PUBLIC_`)
   - Never expose `RAZORPAY_KEY_SECRET` on frontend

3. **Production Setup**
   - Use production Razorpay keys for live payments
   - Add environment variables in your hosting platform
   - Use separate keys for staging and production

---

## 📚 Related Files

- [src/app/api/payment/create-order/route.ts](src/app/api/payment/create-order/route.ts) - Order creation API
- [src/components/RazorpayPaymentForm.tsx](src/components/RazorpayPaymentForm.tsx) - Payment form
- [src/app/api/payment/verify/route.ts](src/app/api/payment/verify/route.ts) - Payment verification
- [src/lib/razorpay.ts](src/lib/razorpay.ts) - Razorpay utilities

---

## 🆘 Still Having Issues?

1. **Check server logs** - Look for error messages in terminal
2. **Browser console** - Check for client-side errors (F12)
3. **Network tab** - Check API requests to `/api/payment/create-order`
4. **Razorpay status** - Verify account is active and not suspended

---

## ✨ Next Steps

After fixing the payment issue:

1. Test with test cards (see Testing section)
2. Verify payments appear in Razorpay dashboard
3. Check payment verification endpoint logs
4. Test course enrollment after payment
5. Test refund workflow

---

**Last Updated:** February 24, 2026
