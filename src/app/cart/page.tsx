'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Navbar from '@/components/Navbar';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';

export default function CartPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { items, removeFromCart, clearCart, getTotalPrice, getItemCount } = useCart();
  const [loading, setLoading] = React.useState(false);

  const totalPrice = getTotalPrice();
  const itemCount = getItemCount();
  const hasFreeCourses = items.some((item) => item.price === 0);
  const hasPaidCourses = items.some((item) => item.price > 0);

  const handleProceedToCheckout = async () => {
    if (!session?.user) {
      // Redirect to login
      router.push(`/auth/login?callbackUrl=/checkout`);
      return;
    }

    router.push('/checkout');
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
          <p className="text-gray-600">{itemCount} course{itemCount !== 1 ? 's' : ''} in your cart</p>
        </div>

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
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                {/* Cart Items List */}
                {items.map((item, index) => (
                  <div key={item.id} className={`p-6 ${index !== items.length - 1 ? 'border-b border-gray-200' : ''}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">{item.fullname}</h3>
                        <p className="text-sm text-gray-600 mb-3">{item.categoryName || 'Course'}</p>
                        <div className="flex items-center gap-4">
                          <span className="text-2xl font-bold text-green-400">
                            {item.price > 0 ? `₹${item.price.toLocaleString()}` : 'FREE'}
                          </span>
                          {item.price === 0 && <span className="text-xs bg-green-600 text-white px-3 py-1 rounded-full">No payment needed</span>}
                        </div>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-2 text-gray-400 hover:text-red-400 transition-colors duration-200"
                        title="Remove from cart"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>

                    {/* Quick View Link */}
                    <Link
                      href={`/courses/${item.id}`}
                      className="mt-3 inline-block text-blue-400 hover:text-blue-300 text-sm transition-colors duration-200"
                    >
                      View Course Details →
                    </Link>
                  </div>
                ))}

                {/* Clear Cart Button */}
                <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
                  <button
                    onClick={handleClearCart}
                    className="text-sm text-red-600 hover:text-red-500 transition-colors duration-200"
                  >
                    Clear Cart
                  </button>
                  <span className="text-sm text-gray-600">{itemCount} item{itemCount !== 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>

                {/* Pricing Breakdown */}
                <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-600 line-clamp-1">{item.fullname}</span>
                      <span className="text-gray-900 font-medium">
                        {item.price > 0 ? `₹${item.price.toLocaleString()}` : 'FREE'}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="mb-6">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="text-gray-900">₹{totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between mb-4">
                    <span className="text-gray-600">Tax (0%):</span>
                    <span className="text-gray-900">₹0</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold border-t border-gray-200 pt-4">
                    <span className="text-gray-900">Total:</span>
                    <span className="text-green-400">₹{totalPrice.toLocaleString()}</span>
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
                <button
                  onClick={handleProceedToCheckout}
                  disabled={itemCount === 0}
                  className={`w-full px-6 py-3 rounded-lg font-bold text-white transition-colors duration-200 ${
                    itemCount === 0
                      ? 'bg-gray-600 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {session?.user ? 'Proceed to Checkout' : 'Login & Checkout'}
                </button>

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
