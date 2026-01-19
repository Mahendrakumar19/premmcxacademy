'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Navbar from '@/components/Navbar';
import { useCart } from '@/context/CartContext';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { clearCart } = useCart();
  const [enrolling, setEnrolling] = useState(true);
  const [enrollmentResults, setEnrollmentResults] = useState<
    Array<{ courseId: number; success: boolean; error?: string }>
  >([]);
  const [enrollmentError, setEnrollmentError] = useState<string | null>(null);

  const transactionId = searchParams.get('transactionId');
  const courseIds = searchParams.get('courses')?.split(',').map(Number) || [];

  useEffect(() => {
    if (!session?.user?.id) {
      router.push('/auth/login');
      return;
    }

    // Enroll user in all courses
    const performEnrollment = async () => {
      try {
        // Simulate enrollment for all courses
        const results = await Promise.all(
          courseIds.map(async (courseId) => {
            try {
              // In a real scenario, this would call the Moodle API
              // For now, we simulate successful enrollment
              await new Promise((resolve) => setTimeout(resolve, 500));
              return {
                courseId,
                success: true,
                enrollmentStatus: 'confirmed'
              };
            } catch {
              return {
                courseId,
                success: false,
                error: 'Enrollment failed'
              };
            }
          })
        );
        setEnrollmentResults(results);
      } catch {
        setEnrollmentError('Failed to enroll in courses');
      }
    };

    performEnrollment();
  }, [session, router, courseIds]);

  const enrollUserInCourses = async () => {
    try {
      // Simulate enrollment for all courses
      const results = await Promise.all(
        courseIds.map(async (courseId) => {
          try {
            // In a real scenario, this would call the Moodle API
            // For now, we simulate successful enrollment
            await new Promise((resolve) => setTimeout(resolve, 500));
            return { courseId, success: true };
          } catch (error) {
            return {
              courseId,
              success: false,
              error: error instanceof Error ? error.message : 'Enrollment failed',
            };
          }
        })
      );

      setEnrollmentResults(results);
      
      const allSuccessful = results.every((r) => r.success);
      if (allSuccessful) {
        clearCart();
        // Redirect to my-courses after 3 seconds
        setTimeout(() => {
          router.push('/my-courses?enrolled=true');
        }, 3000);
      } else {
        setEnrollmentError('Some enrollments failed. Please contact support.');
      }
    } catch (error) {
      setEnrollmentError(
        error instanceof Error ? error.message : 'Enrollment failed'
      );
    } finally {
      setEnrolling(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 to-emerald-50">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center h-24 w-24 bg-green-100 rounded-full mb-6 animate-bounce">
            <svg
              className="h-12 w-12 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-xl text-gray-600">Your payment has been processed successfully.</p>
        </div>

        {/* Transaction Details */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Transaction Details</h2>

          <div className="space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-gray-200">
              <span className="text-gray-700 font-medium">Transaction ID:</span>
              <span className="text-gray-900 font-mono text-sm bg-gray-100 px-4 py-2 rounded">
                {transactionId}
              </span>
            </div>

            <div className="flex justify-between items-center pb-4 border-b border-gray-200">
              <span className="text-gray-700 font-medium">Date & Time:</span>
              <span className="text-gray-900">
                {new Date().toLocaleString('en-IN', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </span>
            </div>

            <div className="flex justify-between items-center pb-4 border-b border-gray-200">
              <span className="text-gray-700 font-medium">Payer:</span>
              <span className="text-gray-900">{session?.user?.name}</span>
            </div>

            <div className="flex justify-between items-center pb-4 border-b border-gray-200">
              <span className="text-gray-700 font-medium">Email:</span>
              <span className="text-gray-900">{session?.user?.email}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-medium">Courses Enrolled:</span>
              <span className="text-gray-900 font-semibold">{courseIds.length}</span>
            </div>
          </div>
        </div>

        {/* Enrollment Status */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Enrollment Status</h2>

          {enrolling ? (
            <div className="space-y-4">
              <p className="text-gray-600 mb-4">Enrolling you in courses...</p>
              {courseIds.map((courseId) => (
                <div key={courseId} className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                  <span className="text-gray-700">Course {courseId}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {enrollmentResults.map((result) => (
                <div
                  key={result.courseId}
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    result.success ? 'bg-green-50' : 'bg-red-50'
                  }`}
                >
                  {result.success ? (
                    <>
                      <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className={result.success ? 'text-green-700' : 'text-red-700'}>
                        Successfully enrolled in course {result.courseId}
                      </span>
                    </>
                  ) : (
                    <>
                      <svg className="h-5 w-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <span className="text-red-700">
                        Failed to enroll in course {result.courseId}: {result.error}
                      </span>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}

          {enrollmentError && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{enrollmentError}</p>
              <button
                onClick={() => router.push('/my-courses')}
                className="mt-2 text-red-600 hover:text-red-700 font-medium"
              >
                Go to My Courses →
              </button>
            </div>
          )}
        </div>

        {/* Next Steps */}
        <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-lg mb-8">
          <h3 className="text-lg font-bold text-blue-900 mb-3">Next Steps</h3>
          <ul className="space-y-2 text-blue-800">
            <li className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 bg-blue-600 rounded-full"></span>
              Check your email for course confirmation and access details
            </li>
            <li className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 bg-blue-600 rounded-full"></span>
              Go to "My Courses" to start learning
            </li>
            <li className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 bg-blue-600 rounded-full"></span>
              Save this transaction ID for your records
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => router.push('/my-courses')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Go to My Courses
          </button>
          <button
            onClick={() => router.push('/courses')}
            className="px-6 py-3 bg-gray-200 text-gray-900 rounded-lg font-semibold hover:bg-gray-300 transition"
          >
            Browse More Courses
          </button>
        </div>

        {/* Download Receipt */}
        <div className="mt-8 p-6 bg-gray-50 rounded-lg text-center">
          <p className="text-gray-600 mb-3">Need a receipt?</p>
          <button
            onClick={() => {
              // Generate simple receipt
              const receiptContent = `
PAYMENT RECEIPT
===============
Transaction ID: ${transactionId}
Date: ${new Date().toLocaleString('en-IN')}
Payer: ${session?.user?.name}
Email: ${session?.user?.email}
Courses Enrolled: ${courseIds.length}
Status: Successful
===============
              `;
              const element = document.createElement('a');
              element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(receiptContent));
              element.setAttribute('download', `receipt-${transactionId}.txt`);
              element.style.display = 'none';
              document.body.appendChild(element);
              element.click();
              document.body.removeChild(element);
            }}
            className="text-blue-600 hover:text-blue-700 font-medium underline"
          >
            Download Receipt
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
