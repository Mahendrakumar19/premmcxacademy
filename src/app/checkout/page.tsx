'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useCart } from '@/context/CartContext';
import { loadRazorpayScript } from '@/lib/razorpay';
import { paymentService } from '@/lib/payment-service';

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
      const courseIds = items.map((i) => i.courseId);
      
      // For free courses, complete enrollment via Moodle's payment system with 0 amount
      // This ensures enrollment goes through the same flow as paid courses
      const enrollRes = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: `free-${Date.now()}`, // Generate unique order ID for free enrollment
          paymentId: 'free-enrollment',
          signature: 'free',
          courseIds,
          userId: session?.user?.id,
          isFree: true, // Flag to indicate this is a free enrollment
        }),
      });

      if (!enrollRes.ok) {
        const errorData = await enrollRes.json();
        throw new Error(errorData.error || 'Enrollment failed');
      }

      const result = await enrollRes.json();

      if (result.success) {
        clearCart();
        // Redirect to payment receipt page for free enrollment
        router.push(`/payment-receipt?orderId=free-${Date.now()}&paymentId=FREE`);
      } else {
        throw new Error('Enrollment failed');
      }
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError(String(err) || 'Failed to enroll in courses. Please try again.');
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  const handlePayment = async () => {
    setProcessing(true);
    setError(null);

    try {
      // Get payment details from Moodle backend
      const courseIds = items.map((i) => i.courseId);
      const totalAmount = getTotalPrice();
      
      // Create payment order via Moodle's backend
      const orderRes = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseIds,
          amount: totalAmount * 100, // Convert to paise
          currency: 'INR',
          userId: session?.user?.id,
        }),
      });

      if (!orderRes.ok) {
        const errorData = await orderRes.json();
        throw new Error(errorData.error || 'Failed to create order');
      }

      const { orderId, amount, currency, razorpayKeyId, directEnrollment } = await orderRes.json();

      // If direct enrollment mode (no Razorpay gateway), directly process enrollment
      if (directEnrollment) {
        console.log('💳 Processing direct enrollment via Moodle backend...');
        
        const verifyRes = await fetch('/api/payment/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId,
            paymentId: razorpayKeyId ? 'DIRECT_ENROLLMENT' : 'DIRECT_ENROLLMENT_NO_GATEWAY',
            signature: razorpayKeyId ? 'DIRECT_ENROLLMENT' : 'DIRECT_ENROLLMENT_NO_GATEWAY',
            courseIds,
            userId: session?.user?.id,
            isDirect: true,
          }),
        });

        if (!verifyRes.ok) {
          throw new Error('Enrollment failed');
        }

        const result = await verifyRes.json();

        if (result.success) {
          clearCart();
          router.push('/my-courses?enrolled=true');
        } else {
          throw new Error('Enrollment failed');
        }
        
        setProcessing(false);
        return;
      }
      
      // If no payment gateway configured and not direct enrollment, show error
      if (!razorpayKeyId && !directEnrollment) {
        setError('Payment gateway is not configured. You may need to contact the administrator or try enrolling directly through the Moodle site.');
        setProcessing(false);
        return;
      }

      // Initialize Razorpay with Moodle's payment details (if Razorpay is configured)
      const options = {
        key: razorpayKeyId,
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
            // Verify payment and enroll via Moodle backend
            const verifyRes = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                courseIds,
                userId: session?.user?.id,
              }),
            });

            if (!verifyRes.ok) {
              throw new Error('Payment verification failed');
            }

            const result = await verifyRes.json();

            if (result.success) {
              clearCart();
              // Redirect to payment receipt page with transaction details
              router.push(`/payment-receipt?orderId=${response.razorpay_order_id}&paymentId=${response.razorpay_payment_id}`);
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
    } catch (err: any) {
      setError(err.message || 'Failed to initiate payment. Please try again.');
      console.error(err);
      setProcessing(false);
    }
  };

  const handleCheckout = () => {
    const allFree = items.every((item) => !item.cost || parseFloat(item.cost) === 0);

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
  const hasFreeCourses = items.some((item) => !item.cost || parseFloat(item.cost) === 0);
  const hasPaidCourses = items.some((item) => parseFloat(item.cost || '0') > 0);

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
                  <div key={item.courseId} className="p-6">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{item.courseName}</h3>
                        <p className="text-sm text-gray-600">Course</p>
                      </div>
                      <div className="text-right">
                        {parseFloat(item.cost || '0') > 0 ? (
                          <span className="text-xl font-bold text-gray-900">₹{parseFloat(item.cost).toLocaleString()}</span>
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
              {items.length === 1 && hasPaidCourses && !hasFreeCourses ? (
                // For single paid course, offer both options
                <div className="space-y-3">
                  <button
                    onClick={handleCheckout}
                    disabled={processing}
                    className={`w-full px-6 py-4 rounded-xl font-bold text-white text-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] ${
                      processing
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl'
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
                    ) : (
                      `Pay ₹${totalPrice.toLocaleString()} via Checkout`
                    )}
                  </button>
                  
                  <button
                    onClick={async () => {
                      if (items[0]) {
                        try {
                          const result = await paymentService.processDirectPayment({
                            courseId: items[0].courseId,
                            amount: parseFloat(items[0].cost) * 100, // Convert to paise
                            currency: items[0].currency
                          });
                          
                          // If payment service indicates user is not authenticated, handle it
                          if (!result.success && result.message === 'User not authenticated') {
                            // The payment service already redirects to login, so we don't need to do anything else
                            return;
                          }
                        } catch (error) {
                          console.error('Error processing payment:', error);
                          router.push(`/auth/login?callbackUrl=/checkout`);
                        }
                      } else {
                        router.push(`/auth/login?callbackUrl=/checkout`);
                      }
                    }}
                    disabled={processing}
                    className={`w-full px-6 py-4 rounded-xl font-bold text-white text-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] ${
                      processing
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-600 shadow-lg hover:shadow-xl'
                    }`}
                  >
                    Pay & Enroll Now
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleCheckout}
                  disabled={processing}
                  className={`w-full px-6 py-4 rounded-xl font-bold text-white text-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] ${
                    processing
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl'
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
              )}

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
