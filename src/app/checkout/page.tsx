'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useCart } from '@/context/CartContext';
import { loadRazorpayScript } from '@/lib/razorpay';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { items, clearCart, getTotalPrice } = useCart();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login?callbackUrl=/checkout');
    }

    if (items.length === 0 && status === 'authenticated') {
      router.push('/courses');
    }
  }, [status, items, router]);

  useEffect(() => {
    loadRazorpayScript();
  }, []);

  const handleEnrollFreeCourses = async () => {
    setProcessing(true);
    setError(null);

    try {
      // Enroll in all courses
      for (const item of items) {
        const res = await fetch('/api/enrollment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            courseId: item.id,
            userId: session?.user?.id,
          }),
        });

        if (!res.ok) {
          throw new Error('Enrollment failed');
        }
      }

      clearCart();
      router.push('/dashboard?enrolled=true');
    } catch (err) {
      setError('Failed to enroll in courses. Please try again.');
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  const handlePayment = async () => {
    setProcessing(true);
    setError(null);

    try {
      // Create Razorpay order
      const orderRes = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseIds: items.map((i) => i.id),
          amount: getTotalPrice() * 100, // Convert to paise
          currency: 'INR',
        }),
      });

      if (!orderRes.ok) {
        throw new Error('Failed to create order');
      }

      const { orderId, amount, currency } = await orderRes.json();

      // Initialize Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
        amount,
        currency,
        name: 'Prem MCX LMS',
        description: `Enrollment for ${items.length} course${items.length > 1 ? 's' : ''}`,
        order_id: orderId,
        prefill: {
          name: session?.user?.name || '',
          email: session?.user?.email || '',
        },
        theme: {
          color: '#3B82F6',
        },
        handler: async function (response: any) {
          try {
            // Verify payment
            const verifyRes = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                courseIds: items.map((i) => i.id),
                userId: session?.user?.id,
              }),
            });

            if (!verifyRes.ok) {
              throw new Error('Payment verification failed');
            }

            const result = await verifyRes.json();

            if (result.success) {
              clearCart();
              router.push('/dashboard?enrolled=true');
            } else {
              setError('Payment verification failed');
            }
          } catch (err) {
            setError('Payment verification failed. Please contact support.');
            console.error(err);
          } finally {
            setProcessing(false);
          }
        },
        modal: {
          ondismiss: function () {
            setProcessing(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      setError('Failed to initiate payment. Please try again.');
      console.error(err);
      setProcessing(false);
    }
  };

  const handleCheckout = () => {
    const allFree = items.every((item) => item.price === 0);

    if (allFree) {
      handleEnrollFreeCourses();
    } else {
      handlePayment();
    }
  };

  if (status === 'loading' || items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  const totalPrice = getTotalPrice();
  const hasFreeCourses = items.some((item) => item.price === 0);
  const hasPaidCourses = items.some((item) => item.price > 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Checkout</h1>
          <p className="text-gray-600">Complete your enrollment</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
              </div>

              <div className="divide-y divide-gray-200">
                {items.map((item) => (
                  <div key={item.id} className="p-6">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{item.fullname}</h3>
                        <p className="text-sm text-gray-600">{item.categoryName || 'Course'}</p>
                      </div>
                      <div className="text-right">
                        {item.price > 0 ? (
                          <span className="text-xl font-bold text-gray-900">₹{item.price.toLocaleString()}</span>
                        ) : (
                          <span className="text-lg font-semibold text-green-600">FREE</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Account Info */}
            <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Account Information</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium text-gray-900">{session?.user?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium text-gray-900">{session?.user?.email}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Summary</h2>

              <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal ({items.length} course{items.length > 1 ? 's' : ''}):</span>
                  <span className="font-medium">₹{totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Tax:</span>
                  <span className="font-medium">₹0</span>
                </div>
              </div>

              <div className="flex justify-between text-xl font-bold text-gray-900 mb-6">
                <span>Total:</span>
                <span className="text-blue-600">₹{totalPrice.toLocaleString()}</span>
              </div>

              {/* Info Messages */}
              {hasFreeCourses && !hasPaidCourses && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-700">
                    All courses are free! Click below to enroll instantly.
                  </p>
                </div>
              )}

              {hasPaidCourses && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700">
                    Secure payment powered by Razorpay. Your data is protected.
                  </p>
                </div>
              )}

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={processing}
                className={`w-full px-6 py-4 rounded-lg font-bold text-white text-lg transition-all duration-200 ${
                  processing
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg'
                }`}
              >
                {processing ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing...
                  </span>
                ) : totalPrice === 0 ? (
                  'Enroll Now'
                ) : (
                  `Pay ₹${totalPrice.toLocaleString()}`
                )}
              </button>

              {/* Security Info */}
              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Secure checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
