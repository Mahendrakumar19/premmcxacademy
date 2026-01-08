'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

function PaymentReceiptContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const orderId = searchParams.get('orderId');
  const paymentId = searchParams.get('paymentId');
  const status_param = searchParams.get('status');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    if (!orderId) {
      setError('Invalid payment receipt. Order ID not found.');
      setLoading(false);
      return;
    }

    fetchPaymentDetails();
  }, [orderId, status, router]);

  const fetchPaymentDetails = async () => {
    try {
      const res = await fetch(`/api/payment/receipt?orderId=${orderId}&paymentId=${paymentId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to fetch payment details');
      }

      const data = await res.json();
      setPaymentDetails(data);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError(String(err) || 'Failed to load payment receipt');
      console.error('Error fetching payment details:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading payment receipt...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md">
            <div className="mb-4">
              <svg className="w-16 h-16 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link
              href="/"
              className="inline-block px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />
      
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Success Message */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <svg className="w-16 h-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-lg text-gray-600">Your enrollment has been confirmed</p>
        </div>

        {/* Receipt Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="border-b border-gray-200 pb-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Receipt</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Order ID</p>
                <p className="font-mono font-semibold text-gray-900">{paymentDetails?.orderId}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-500">Payment ID</p>
                <p className="font-mono font-semibold text-gray-900">{paymentDetails?.paymentId || 'Free'}</p>
              </div>
              <div>
                <p className="text-gray-500">Date</p>
                <p className="font-semibold text-gray-900">
                  {paymentDetails?.date ? new Date(paymentDetails.date).toLocaleDateString('en-IN', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  }) : 'Today'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-gray-500">Status</p>
                <p className="font-semibold text-green-600">Completed</p>
              </div>
            </div>
          </div>

          {/* Courses */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Enrolled Courses</h3>
            <div className="space-y-3">
              {paymentDetails?.courses && paymentDetails.courses.length > 0 ? (
                paymentDetails.courses.map((course: any, index: number) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-900">{course.courseName}</p>
                      <p className="text-sm text-gray-600">Course ID: {course.courseId}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        ₹{parseFloat(String(course.amount || '0')).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-600">No course information available</p>
              )}
            </div>
          </div>

          {/* Total Amount */}
          <div className="border-t border-gray-200 pt-6 flex justify-between items-center">
            <p className="text-lg font-semibold text-gray-900">Total Amount</p>
            <p className="text-2xl font-bold text-indigo-600">
              ₹{paymentDetails?.totalAmount ? parseFloat(String(paymentDetails.totalAmount)).toLocaleString('en-IN') : '0'}
            </p>
          </div>

          {/* Transaction Details */}
          {paymentDetails?.paymentMethod && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Transaction Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Payment Method</p>
                  <p className="font-semibold text-gray-900 capitalize">{paymentDetails.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-gray-500">Currency</p>
                  <p className="font-semibold text-gray-900">{paymentDetails.currency || 'INR'}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/my-courses"
            className="inline-flex items-center justify-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            View My Courses
          </Link>
          <button
            onClick={() => {
              const element = document.querySelector('.receipt-card');
              if (element) {
                window.print();
              }
            }}
            className="inline-flex items-center justify-center px-6 py-3 bg-gray-200 text-gray-900 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Download Receipt
          </button>
        </div>

        {/* Footer Note */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Note:</span> A receipt has been sent to your email. You can now access the course content from your dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment receipt...</p>
        </div>
      </div>
    </div>
  );
}

export default function PaymentReceiptPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <PaymentReceiptContent />
    </Suspense>
  );
}
