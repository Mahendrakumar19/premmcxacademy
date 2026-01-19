'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useCart } from '@/context/CartContext';
import RazorpayPaymentForm from '@/components/RazorpayPaymentForm';

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { items, clearCart, getTotalPrice, getTotalWithGST, getGSTAmount } = useCart();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login?callbackUrl=/checkout');
    }

    if (items.length === 0 && status === 'authenticated' && !success) {
      router.push('/courses');
    }
  }, [status, items, router, success]);

  const handlePaymentSuccess = () => {
    setSuccess(true);
    clearCart();
    // Don't redirect to any LMS page - just show success message
  };

  const handlePaymentError = (errorMsg: string) => {
    setError(errorMsg);
    setProcessing(false);
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="max-w-md w-full text-center">
            <div className="inline-flex items-center justify-center h-16 w-16 bg-green-100 rounded-full mb-4">
              <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-6">Your enrollment has been completed. You will receive a confirmation email shortly.</p>
            
            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => router.push('/courses')}
                className="w-full px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Browse More Courses
              </button>
              <button
                onClick={() => router.push('/cart')}
                className="w-full px-6 py-3 bg-gray-200 text-gray-900 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
              >
                Return to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const totalPrice = getTotalPrice();
  const coursesList = items.map((item) => ({
    courseId: item.courseId,
    name: item.courseName,
    price: parseFloat(item.cost || '0'),
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Complete Your Purchase</h1>
          <p className="text-gray-600">Secure checkout with Razorpay and instant enrollment</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div>
            <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.courseId} className="flex justify-between items-center pb-4 border-b border-gray-200">
                    <div>
                      <p className="font-semibold text-gray-900">{item.courseName}</p>
                      <p className="text-sm text-gray-600">1x Course</p>
                    </div>
                    <div className="text-right">
                      {parseFloat(item.cost || '0') > 0 ? (
                        <p className="text-lg font-bold text-gray-900">₹{parseFloat(item.cost).toLocaleString()}</p>
                      ) : (
                        <p className="text-lg font-bold text-green-600">FREE</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Tax Breakdown */}
              {totalPrice > 0 && (
                <div className="space-y-3 mb-6 pb-6 border-b-2 border-gray-200">
                  <div className="flex justify-between items-center text-gray-700">
                    <span>Subtotal:</span>
                    <span className="font-semibold">₹{totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-700">
                    <span>SGST (9%):</span>
                    <span className="font-semibold">₹{(totalPrice * 0.09).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-700">
                    <span>CGST (9%):</span>
                    <span className="font-semibold">₹{(totalPrice * 0.09).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg text-blue-600">
                    <span>Total GST (18%):</span>
                    <span>₹{(totalPrice * 0.18).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                  </div>
                </div>
              )}

              <div className="pt-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xl font-bold text-gray-900">Total Amount (incl. GST):</span>
                  <span className="text-3xl font-bold text-blue-600">
                    ₹{(totalPrice * 1.18).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </span>
                </div>
                {totalPrice > 0 && (
                  <p className="text-xs text-gray-500">*GST @ 18% (9% SGST + 9% CGST)</p>
                )}
              </div>

              {totalPrice === 0 && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-700 text-sm font-medium">✓ All courses are free! No payment required.</p>
                </div>
              )}
            </div>

            {/* Account Info */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Enrollment Details</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Enrolling as:</p>
                  <p className="font-semibold text-gray-900">{session?.user?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email:</p>
                  <p className="font-semibold text-gray-900">{session?.user?.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div>
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            <RazorpayPaymentForm
              items={coursesList}
              totalAmount={totalPrice}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
              isProcessing={processing}
            />

            {/* Security Badges */}
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 text-center border border-gray-200">
                <div className="text-2xl mb-2">🔒</div>
                <p className="text-sm font-medium text-gray-900">Secure Checkout</p>
                <p className="text-xs text-gray-600 mt-1">Razorpay Protected</p>
              </div>
              <div className="bg-white rounded-lg p-4 text-center border border-gray-200">
                <div className="text-2xl mb-2">⚡</div>
                <p className="text-sm font-medium text-gray-900">Instant Access</p>
                <p className="text-xs text-gray-600 mt-1">Immediate Enrollment</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
