'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Navbar from '@/components/Navbar';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import { paymentService } from '@/lib/payment-service';

export default function CartPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { items, removeFromCart, clearCart, getTotalPrice, getItemCount } = useCart();
  const [loading] = React.useState(false);

  const totalPrice = getTotalPrice();
  const itemCount: number = getItemCount();
  const isEmptyCart = itemCount === 0;
  const hasFreeCourses = items.some((item) => !item.cost || parseFloat(item.cost) === 0);
  const hasPaidCourses = items.some((item) => parseFloat(item.cost || '0') > 0);

  const handleProceedToCheckout = async () => {
    if (!session?.user) {
      // Redirect to login
      router.push(`/auth/login?callbackUrl=/checkout`);
      return;
    }

    router.push('/checkout');
  };

  const handleDirectMoodlePayment = async (courseId: number) => {
    try {
      // Find the course in cart to get price details
      const course = items.find(item => item.courseId === courseId);
      
      if (!course) {
        alert('Course not found in cart');
        return;
      }
      
      // Process direct payment using the payment service
      const result = await paymentService.processDirectPayment({
        courseId: course.courseId,
        amount: parseFloat(course.cost) * 100, // Convert to paise
        currency: course.currency
      });
      
      // If payment service indicates user is not authenticated, handle it
      if (!result.success && result.message === 'User not authenticated') {
        // The payment service already redirects to login, so we don't need to do anything else
        return;
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('An error occurred while processing your payment. Please try again.');
    }
  };

  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      clearCart();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center gap-4 mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Shopping Cart</h1>
        </div>
        <p className="text-gray-600 mb-8">{itemCount} course{itemCount !== 1 ? 's' : ''} in your cart</p>

        {itemCount === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
            <div className="mb-6">
              <svg className="w-24 h-24 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Your Cart is Empty</h3>
            <p className="text-gray-600 mb-6">Start learning by adding courses to your cart</p>
            <Link
              href="/courses"
              className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
            >
              Browse Courses
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                {/* Cart Items List */}
                {items.map((item, index) => (
                  <div 
                    key={item.courseId} 
                    className={`p-6 transition-all duration-300 hover:bg-gray-50 ${index !== items.length - 1 ? 'border-b border-gray-100' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1 transition-colors duration-200">{item.courseName}</h3>
                        <p className="text-sm text-gray-500 mb-3">Course</p>
                        <div className="flex items-center gap-4">
                          <span className="text-2xl font-bold text-gray-900">
                            {parseFloat(item.cost || '0') > 0 ? `₹${parseFloat(item.cost).toLocaleString()}` : <span className="text-green-600 font-semibold">FREE</span>}
                          </span>
                          {(!item.cost || parseFloat(item.cost) === 0) && <span className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">No payment needed</span>}
                        </div>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.courseId)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-all duration-200 rounded-lg hover:bg-red-50"
                        title="Remove from cart"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>

                    {/* Quick View Link */}
                    <Link
                      href={`/courses/${item.courseId}`}
                      className="mt-3 inline-block text-indigo-600 hover:text-indigo-700 text-sm font-medium transition-colors duration-200"
                    >
                      View Course Details →
                    </Link>
                  </div>
                ))}

                {/* Clear Cart Button */}
                <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center bg-gray-50">
                  <button
                    onClick={handleClearCart}
                    className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors duration-200"
                  >
                    Clear Cart
                  </button>
                  <span className="text-sm text-gray-600 font-medium">{itemCount} item{itemCount !== 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-gray-200 rounded-2xl p-6 sticky top-6 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>

                {/* Pricing Breakdown */}
                <div className="space-y-3 mb-6 pb-6 border-b border-gray-100">
                  {items.map((item) => (
                    <div key={item.courseId} className="flex justify-between text-sm transition-all duration-200">
                      <span className="text-gray-600 line-clamp-1 font-medium">{item.courseName}</span>
                      <span className="text-gray-900 font-semibold">
                        {parseFloat(item.cost || '0') > 0 ? `₹${parseFloat(item.cost).toLocaleString()}` : <span className="text-green-600 font-semibold">FREE</span>}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="mb-6">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600 font-medium">Subtotal:</span>
                    <span className="text-gray-900 font-semibold">₹{totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between mb-4">
                    <span className="text-gray-600 font-medium">Tax (0%):</span>
                    <span className="text-gray-900 font-semibold">₹0</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold border-t border-gray-100 pt-4">
                    <span className="text-gray-900 font-semibold">Total:</span>
                    <span className="text-indigo-600 font-bold">₹{totalPrice.toLocaleString()}</span>
                  </div>
                </div>

                {/* Info Messages */}
                {hasFreeCourses && (
                  <div className="mb-4 p-3 bg-green-900 border border-green-700 rounded-lg">
                    <p className="text-xs text-green-300">Free courses require only registration - no payment needed!</p>
                  </div>
                )}

                {hasPaidCourses && (
                  <div className="mb-4 p-3 bg-blue-900 border border-blue-700 rounded-lg">
                    <p className="text-xs text-blue-300">Secure payment powered by Razorpay. Your data is protected.</p>
                  </div>
                )}

                {/* Checkout Button */}
                {itemCount === 1 && hasPaidCourses && !hasFreeCourses ? (
                  // For single paid course, offer direct Moodle payment option
                  <button
                    onClick={() => handleDirectMoodlePayment(items[0].courseId)}
                    disabled={isEmptyCart}
                    className={`w-full px-6 py-4 rounded-xl font-bold text-white transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] ${
                      isEmptyCart
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg hover:shadow-xl'
                    }`}
                  >
                    {session?.user ? 'Pay & Enroll Now' : 'Login & Pay Now'}
                  </button>
                ) : (
                  <button
                    onClick={handleProceedToCheckout}
                    disabled={isEmptyCart}
                    className={`w-full px-6 py-4 rounded-xl font-bold text-white transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] ${
                      isEmptyCart
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg hover:shadow-xl'
                    }`}
                  >
                    {session?.user ? 'Proceed to Checkout' : 'Login & Checkout'}
                  </button>
                )}

                {/* Continue Shopping */}
                <Link
                  href="/courses"
                  className="block mt-3 text-center text-blue-400 hover:text-blue-300 text-sm transition-colors duration-200"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
