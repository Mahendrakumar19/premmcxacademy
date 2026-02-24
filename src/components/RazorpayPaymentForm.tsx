'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Script from 'next/script';

interface PaymentFormProps {
  items: Array<{ courseId: number; name: string; price: number }>;
  totalAmount: number;
  onSuccess: () => void;
  onError: (error: string) => void;
  isProcessing?: boolean;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface Window {
    Razorpay: any;
  }
}

export default function RazorpayPaymentForm({
  items,
  totalAmount,
  onSuccess,
  onError,
  isProcessing = false,
}: PaymentFormProps) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // GST calculation (18% = 9% SGST + 9% CGST)
  const gstAmount = Math.round(totalAmount * 0.18);
  const finalAmount = totalAmount + gstAmount;

  // Check if Razorpay key is configured
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
      setError('Razorpay key is not configured. Please contact support.');
      console.warn('⚠️ NEXT_PUBLIC_RAZORPAY_KEY_ID environment variable is missing');
    }
  }, []);

  const handlePayment = async () => {
    if (!session?.user?.email) {
      setError('Please log in to continue');
      onError('Please log in to continue');
      return;
    }

    if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
      setError('Payment gateway is not configured. Please contact support.');
      onError('Payment gateway is not configured');
      return;
    }

    if (!scriptLoaded) {
      setError('Payment gateway is loading. Please wait and try again.');
      return;
    }

    if (items.length === 0) {
      setError('No courses selected');
      onError('No courses selected');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('📋 Initiating payment with items:', items);
      console.log('💰 Total Amount:', finalAmount);
      
      // Create order on backend
      const orderResponse = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: finalAmount,
          currency: 'INR',
          courseIds: items.map((item) => item.courseId),
          receipt: `receipt-${Date.now()}`,
          userEmail: session.user.email,
          userName: session.user.name,
        }),
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        console.error('❌ Order creation failed:', errorData);
        throw new Error(errorData.error || 'Failed to create order');
      }

      const orderData = await orderResponse.json();
      console.log('✅ Order created successfully:', orderData.id);

      // Initialize Razorpay payment
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: 'INR',
        name: 'Prem MCX Training Academy',
        description: `${items.length} Course(s) Enrollment`,
        image: '/premmcx-logo.png',
        order_id: orderData.id,
        prefill: {
          name: session.user.name,
          email: session.user.email,
          contact: '',
        },
        handler: async (response: {razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string}) => {
          try {
            console.log('💳 ✅ PAYMENT SUCCESS: Razorpay handler triggered');
            console.log('📋 Payment details:', {
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature.substring(0, 20) + '...',
            });
            console.log('💳 Now calling /api/payment/verify endpoint...');
            
            // Verify payment on backend
            const verifyResponse = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                courseIds: items.map((item) => item.courseId),
                userEmail: session.user.email,
              }),
            });

            const verifyData = await verifyResponse.json();

            if (!verifyResponse.ok) {
              throw new Error(verifyData.error || 'Payment verification failed');
            }

            console.log('✅ PAYMENT VERIFICATION SUCCESS - Response from backend:');
            console.log('✅', verifyData);

            // Check enrollment results
            if (verifyData.enrollmentResults) {
              const failedEnrollments = verifyData.enrollmentResults.filter((r: any) => !r.success);
              if (failedEnrollments.length > 0) {
                console.warn('⚠️ Some enrollments failed:', failedEnrollments);
                setError(`Payment successful but some enrollments failed. Please contact support with Order ID: ${response.razorpay_order_id}`);
              }
            }

            // Payment verified successfully
            setLoading(false);
            onSuccess();
          } catch (err) {
            const message = err instanceof Error ? err.message : 'Payment verification failed';
            console.error('❌ Verification error:', message);
            setError(message);
            onError(message);
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            console.log('❌ PAYMENT CANCELLED: User dismissed the Razorpay checkout modal');
            setLoading(false);
            setError('Payment cancelled');
            onError('Payment cancelled by user');
          },
        },
        notes: {
          courses: items.map((item) => item.name).join(', '),
          gstAmount: gstAmount.toString(),
          subtotal: totalAmount.toString(),
        },
      };

      if (!window.Razorpay) {
        throw new Error('Razorpay SDK failed to load. Please refresh and try again.');
      }

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Payment failed. Please try again.';
      console.error('❌ Payment error:', message);
      setError(message);
      onError(message);
      setLoading(false);
    }
  };

  return (
    <>
      <Script 
        src="https://checkout.razorpay.com/v1/checkout.js" 
        strategy="lazyOnload"
        onLoad={() => {
          console.log('✅ Razorpay SDK loaded');
          setScriptLoaded(true);
        }}
        onError={() => {
          console.error('❌ Failed to load Razorpay SDK');
          setError('Failed to load payment gateway. Please refresh the page.');
        }}
      />

      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Details</h2>

        {/* Order Breakdown */}
        <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
          <div className="flex justify-between text-gray-700">
            <span>Subtotal:</span>
            <span>₹{totalAmount.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between text-gray-700">
            <span>SGST (9%):</span>
            <span>₹{(totalAmount * 0.09).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
          </div>
          <div className="flex justify-between text-gray-700">
            <span>CGST (9%):</span>
            <span>₹{(totalAmount * 0.09).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
          </div>
          <div className="flex justify-between font-bold text-lg text-blue-600">
            <span>Total (incl. GST):</span>
            <span>₹{finalAmount.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Razorpay Button */}
        <button
          onClick={handlePayment}
          disabled={loading || isProcessing || totalAmount === 0 || !scriptLoaded}
          className="w-full px-6 py-4 bg-blue-600 text-white rounded-lg font-bold text-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Processing...
            </>
          ) : !scriptLoaded ? (
            'Loading Payment Gateway...'
          ) : totalAmount === 0 ? (
            'Free Enrollment'
          ) : (
            `Pay ₹${finalAmount.toLocaleString('en-IN')} with Razorpay`
          )}
        </button>

        {totalAmount === 0 && (
          <button
            onClick={onSuccess}
            className="w-full mt-4 px-6 py-4 bg-green-600 text-white rounded-lg font-bold text-lg hover:bg-green-700 transition"
          >
            Enroll Free Courses
          </button>
        )}

        {/* Security Info */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-900">
            ✓ Secured by Razorpay | ✓ PCI DSS Compliant | ✓ Instant Enrollment
          </p>
        </div>
      </div>
    </>
  );
}
