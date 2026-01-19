'use client';

import React, { useState } from 'react';
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

  // GST calculation (18% = 9% SGST + 9% CGST)
  const gstAmount = Math.round(totalAmount * 0.18);
  const finalAmount = totalAmount + gstAmount;

  const handlePayment = async () => {
    if (!session?.user?.email) {
      setError('Please log in to continue');
      onError('Please log in to continue');
      return;
    }

    setLoading(true);
    setError(null);

    try {
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
        throw new Error(errorData.error || 'Failed to create order');
      }

      const orderData = await orderResponse.json();

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

            if (!verifyResponse.ok) {
              const errorData = await verifyResponse.json();
              throw new Error(errorData.error || 'Payment verification failed');
            }

            // Payment verified successfully
            // Call the success callback instead of redirecting
            setLoading(false);
            onSuccess();
          } catch (err) {
            const message = err instanceof Error ? err.message : 'Payment verification failed';
            setError(message);
            onError(message);
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            setError('Payment cancelled');
          },
        },
        notes: {
          courses: items.map((item) => item.name).join(', '),
          gstAmount: gstAmount.toString(),
          subtotal: totalAmount.toString(),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Payment failed. Please try again.';
      setError(message);
      onError(message);
      setLoading(false);
    }
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

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
          disabled={loading || isProcessing || totalAmount === 0}
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
