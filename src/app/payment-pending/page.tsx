'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

function PaymentPendingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const transactionId = searchParams.get('transactionId');
  const method = searchParams.get('method') || 'bank_transfer';

  useEffect(() => {
    // Auto-redirect after 5 minutes if payment not confirmed
    const timeout = setTimeout(() => {
      router.push('/payment-failed?reason=timeout');
    }, 5 * 60 * 1000);

    return () => clearTimeout(timeout);
  }, [router]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-yellow-50 to-orange-50">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center h-24 w-24 bg-yellow-100 rounded-full mb-6 animate-pulse">
            <svg
              className="h-12 w-12 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Payment Pending</h1>
          <p className="text-xl text-gray-600">
            Complete your {method === 'upi' ? 'UPI' : 'bank'} transfer to confirm enrollment
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {method === 'upi' ? 'UPI Payment Instructions' : 'Bank Transfer Instructions'}
          </h2>

          {method === 'upi' ? (
            <div className="space-y-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="font-bold text-blue-900 mb-3">UPI ID</h3>
                <div className="flex items-center gap-3">
                  <code className="text-lg font-mono bg-white px-4 py-2 rounded border border-blue-200 flex-1">
                    premmcx@bank
                  </code>
                  <button
                    onClick={() => copyToClipboard('premmcx@bank')}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              <div className="border-l-4 border-blue-600 pl-4 py-2">
                <p className="text-gray-700">
                  <strong>Step 1:</strong> Open your UPI app (Google Pay, PhonePe, Paytm, etc.)
                </p>
                <p className="text-gray-700 mt-2">
                  <strong>Step 2:</strong> Paste the UPI ID or scan the code below
                </p>
                <p className="text-gray-700 mt-2">
                  <strong>Step 3:</strong> Enter the amount as shown below
                </p>
                <p className="text-gray-700 mt-2">
                  <strong>Step 4:</strong> Complete the payment and note your transaction ID
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-700 mb-1">Account Name</p>
                  <p className="text-lg font-bold text-blue-900">Prem MCX Training</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-700 mb-1">Account Number</p>
                  <p className="text-lg font-bold text-blue-900 font-mono">1234567890</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-700 mb-1">Bank Name</p>
                  <p className="text-lg font-bold text-blue-900">ICICI Bank</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-700 mb-1">IFSC Code</p>
                  <p className="text-lg font-bold text-blue-900 font-mono">ICIC0000001</p>
                </div>
              </div>

              <div className="border-l-4 border-blue-600 pl-4 py-2">
                <p className="text-gray-700">
                  <strong>Step 1:</strong> Use NEFT or IMPS transfer
                </p>
                <p className="text-gray-700 mt-2">
                  <strong>Step 2:</strong> Enter the amount shown below
                </p>
                <p className="text-gray-700 mt-2">
                  <strong>Step 3:</strong> Note your transaction ID/Reference Number
                </p>
                <p className="text-gray-700 mt-2">
                  <strong>Step 4:</strong> Verify payment below with your transaction ID
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Amount Due */}
        <div className="bg-linear-to-r from-orange-600 to-yellow-600 text-white rounded-xl shadow-lg p-8 mb-8">
          <h3 className="text-lg font-semibold mb-4">Amount to Transfer</h3>
          <div className="text-5xl font-bold mb-4">₹1,00,000</div>
          <p className="text-orange-100">
            This is the total amount for all your enrolled courses
          </p>
        </div>

        {/* Transaction ID Reference */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Reference Information</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">Your Transaction ID</p>
              <div className="flex items-center gap-2">
                <code className="text-sm bg-gray-100 px-4 py-3 rounded font-mono flex-1 break-all">
                  {transactionId}
                </code>
                <button
                  onClick={() => copyToClipboard(transactionId || '')}
                  className="px-4 py-3 bg-gray-200 text-gray-900 rounded hover:bg-gray-300 transition"
                >
                  {copied ? '✓' : 'Copy'}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Mention this ID in the payment remarks/description
              </p>
            </div>

            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800">
                <strong>⚠️ Important:</strong> Include your Transaction ID in the payment reference so we can match it with your courses.
              </p>
            </div>
          </div>
        </div>

        {/* Verify Payment */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Verify Payment</h3>
          <p className="text-gray-600 mb-6">
            Once you've sent the payment, enter your transaction ID below to verify:
          </p>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Enter your transaction ID / Reference Number"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
            />
            <button
              onClick={() => router.push(`/payment-verify?reference=${transactionId}`)}
              className="w-full px-6 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition"
            >
              Verify Payment
            </button>
          </div>
        </div>

        {/* Support */}
        <div className="bg-gray-50 rounded-xl p-8 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-3">Need Help?</h3>
          <p className="text-gray-600 mb-4">
            If your payment doesn't reflect within 30 minutes, please contact our support team:
          </p>
          <div className="space-y-2">
            <p className="text-gray-700">
              <strong>Email:</strong>{' '}
              <a href="mailto:support@premmcx.com" className="text-orange-600 hover:underline">
                support@premmcx.com
              </a>
            </p>
            <p className="text-gray-700">
              <strong>Phone:</strong>{' '}
              <a href="tel:+919876543210" className="text-orange-600 hover:underline">
                +91 9876 543 210
              </a>
            </p>
            <p className="text-gray-700">
              <strong>Transaction ID:</strong>{' '}
              <code className="bg-gray-200 px-2 py-1 rounded font-mono text-sm">{transactionId}</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPendingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentPendingContent />
    </Suspense>
  );
}
