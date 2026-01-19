'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

function PaymentVerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const reference = searchParams.get('reference');
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'pending' | 'verified' | 'error'>('pending');
  const [message, setMessage] = useState('');

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate verification (in real scenario, this would check with your backend/bank)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      if (verificationCode.length >= 10) {
        setStatus('verified');
        setMessage('Payment verified successfully! Your courses will be activated shortly.');

        // Redirect to success page after 3 seconds
        setTimeout(() => {
          router.push(
            `/payment-success?transactionId=${reference}&status=verified`
          );
        }, 3000);
      } else {
        setStatus('error');
        setMessage('Invalid verification code. Please check and try again.');
      }
    } catch (err) {
      setStatus('error');
      setMessage('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-50">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center h-24 w-24 bg-blue-100 rounded-full mb-6">
            <svg
              className="h-12 w-12 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m7 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Verify Payment</h1>
          <p className="text-xl text-gray-600">
            Confirm your bank transfer or UPI payment
          </p>
        </div>

        {status === 'pending' && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            {/* Reference ID */}
            <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-700 mb-1">Your Reference ID</p>
              <code className="text-lg font-mono font-bold text-blue-900 break-all">{reference}</code>
              <p className="text-sm text-blue-600 mt-2">Keep this for your records</p>
            </div>

            {/* Instructions */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">How to Verify</h3>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-full font-bold text-sm">
                    1
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Send Payment</p>
                    <p className="text-gray-600 text-sm mt-1">
                      Transfer the amount using bank/UPI with your reference ID
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-full font-bold text-sm">
                    2
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Get Confirmation</p>
                    <p className="text-gray-600 text-sm mt-1">
                      You will receive a UTR or transaction ID from your bank
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-full font-bold text-sm">
                    3
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Enter Verification Code</p>
                    <p className="text-gray-600 text-sm mt-1">
                      Paste your transaction ID or UTR below to verify
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Verification Form */}
            <form onSubmit={handleVerify} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Transaction ID / UTR / Reference Number
                </label>
                <input
                  type="text"
                  placeholder="Enter your transaction ID (e.g., 402365812945)"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
                  disabled={loading}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-200 outline-none font-mono text-lg disabled:bg-gray-100"
                  required
                />
                <p className="text-sm text-gray-600 mt-2">
                  You can find this in your bank's transaction confirmation
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    Verifying...
                  </span>
                ) : (
                  'Verify Payment'
                )}
              </button>
            </form>

            {/* Contact Support */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-700 mb-3">
                <strong>Not receiving your payment?</strong>
              </p>
              <p className="text-sm text-gray-600 mb-4">
                If your payment doesn't show up in 30 minutes, contact our support team:
              </p>
              <div className="flex gap-4">
                <a
                  href="mailto:support@premmcx.com"
                  className="text-blue-600 hover:underline font-semibold text-sm"
                >
                  📧 Email Support
                </a>
                <a
                  href="tel:+919876543210"
                  className="text-blue-600 hover:underline font-semibold text-sm"
                >
                  📞 Call Support
                </a>
              </div>
            </div>
          </div>
        )}

        {status === 'verified' && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center h-16 w-16 bg-green-100 rounded-full mb-6">
                <svg
                  className="h-8 w-8 text-green-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Verified!</h2>
              <p className="text-gray-600 mb-4">{message}</p>
              <p className="text-sm text-gray-500">Redirecting to course page...</p>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center h-16 w-16 bg-red-100 rounded-full mb-4">
                <svg
                  className="h-8 w-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h2>
              <p className="text-red-600 font-semibold mb-4">{message}</p>
            </div>

            <button
              onClick={() => {
                setStatus('pending');
                setMessage('');
                setVerificationCode('');
              }}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition mb-4"
            >
              Try Again
            </button>

            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-3">
                <strong>Need help?</strong> Contact our support team
              </p>
              <div className="flex gap-4">
                <a
                  href="mailto:support@premmcx.com"
                  className="text-blue-600 hover:underline font-semibold text-sm"
                >
                  Email Support
                </a>
                <a
                  href="tel:+919876543210"
                  className="text-blue-600 hover:underline font-semibold text-sm"
                >
                  Call Support
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Back Links */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Link
            href="/checkout"
            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-900 rounded-lg font-semibold hover:border-gray-400 transition text-center"
          >
            Return to Checkout
          </Link>
          <Link
            href="/cart"
            className="flex-1 px-6 py-3 bg-gray-200 text-gray-900 rounded-lg font-semibold hover:bg-gray-300 transition text-center"
          >
            Back to Cart
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PaymentVerifyPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentVerifyContent />
    </Suspense>
  );
}
