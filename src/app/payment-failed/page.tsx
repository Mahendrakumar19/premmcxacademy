'use client';

import React, { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

function PaymentFailedContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const reason = searchParams.get('reason') || 'unknown';
  const transactionId = searchParams.get('transactionId');

  const getErrorMessage = (reason: string) => {
    const messages: { [key: string]: { title: string; description: string } } = {
      insufficient_funds: {
        title: 'Insufficient Funds',
        description: 'Your card or account does not have enough balance. Please top up and try again.',
      },
      card_declined: {
        title: 'Card Declined',
        description: 'Your card was declined by the bank. Please check your card details or use a different card.',
      },
      invalid_details: {
        title: 'Invalid Payment Details',
        description: 'The payment details you entered are incorrect. Please check and try again.',
      },
      timeout: {
        title: 'Payment Timeout',
        description: 'Your payment session has expired. Please start over and complete the payment within the time limit.',
      },
      network_error: {
        title: 'Network Error',
        description: 'Unable to process your payment due to a network issue. Please check your connection and try again.',
      },
      unknown: {
        title: 'Payment Failed',
        description: 'Your payment could not be processed. Please try again or contact support.',
      },
    };

    return messages[reason] || messages.unknown;
  };

  const error = getErrorMessage(reason);

  return (
    <div className="min-h-screen bg-linear-to-br from-red-50 to-pink-50">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center h-24 w-24 bg-red-100 rounded-full mb-6 animate-pulse">
            <svg
              className="h-12 w-12 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 14l-2-2m0 0l-2-2m2 2l2-2m-2 2l-2 2m2-2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Payment Failed</h1>
          <p className="text-xl text-gray-600">{error.title}</p>
        </div>

        {/* Error Details */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="border-l-4 border-red-600 pl-6 py-4">
            <p className="text-gray-700 text-lg">{error.description}</p>
          </div>

          {transactionId && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Transaction ID (if any)</p>
              <code className="text-sm font-mono bg-white px-3 py-2 rounded border border-gray-300">
                {transactionId}
              </code>
            </div>
          )}
        </div>

        {/* Troubleshooting Tips */}
        <div className="bg-blue-50 rounded-xl p-8 mb-8 border border-blue-200">
          <h3 className="text-xl font-bold text-blue-900 mb-4">Troubleshooting Steps</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-blue-500 text-white rounded-full text-sm font-bold">
                1
              </span>
              <span className="text-blue-900">
                Check your payment method details (card number, CVV, expiry date)
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-blue-500 text-white rounded-full text-sm font-bold">
                2
              </span>
              <span className="text-blue-900">
                Ensure your account has sufficient funds for the transaction
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-blue-500 text-white rounded-full text-sm font-bold">
                3
              </span>
              <span className="text-blue-900">
                Try using a different payment method or card
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-blue-500 text-white rounded-full text-sm font-bold">
                4
              </span>
              <span className="text-blue-900">
                Check your internet connection and try again
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-blue-500 text-white rounded-full text-sm font-bold">
                5
              </span>
              <span className="text-blue-900">
                Contact your bank if the issue persists
              </span>
            </li>
          </ul>
        </div>

        {/* Alternative Payment Methods */}
        <div className="bg-gray-50 rounded-xl p-8 mb-8 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Alternative Payment Options</h3>
          <p className="text-gray-600 mb-6">
            Try a different payment method if available:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 border-2 border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition">
              <div className="text-2xl mb-2">💳</div>
              <p className="font-semibold text-gray-900">Credit/Debit Card</p>
            </button>
            <button className="p-4 border-2 border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition">
              <div className="text-2xl mb-2">📱</div>
              <p className="font-semibold text-gray-900">UPI Payment</p>
            </button>
            <button className="p-4 border-2 border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition">
              <div className="text-2xl mb-2">🏦</div>
              <p className="font-semibold text-gray-900">Bank Transfer</p>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => router.back()}
            className="flex-1 px-6 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition"
          >
            Try Again
          </button>
          <Link
            href="/contact"
            className="flex-1 px-6 py-3 bg-gray-200 text-gray-900 rounded-lg font-semibold hover:bg-gray-300 transition text-center"
          >
            Contact Support
          </Link>
          <Link
            href="/cart"
            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-900 rounded-lg font-semibold hover:border-gray-400 transition text-center"
          >
            Return to Cart
          </Link>
        </div>

        {/* Support Section */}
        <div className="mt-12 bg-white rounded-xl shadow-lg p-8 border border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Still Need Help?</h3>
          <p className="text-gray-600 mb-6">
            Our customer support team is here to assist you. Please reach out with any questions:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">📧 Email</p>
              <a
                href="mailto:support@premmcx.com"
                className="text-orange-600 hover:underline font-semibold"
              >
                support@premmcx.com
              </a>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">📞 Phone</p>
              <a
                href="tel:+919876543210"
                className="text-orange-600 hover:underline font-semibold"
              >
                +91 9876 543 210
              </a>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">⏰ Support Hours</p>
              <p className="text-gray-900 font-semibold">Mon-Fri, 9 AM - 6 PM IST</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">🌐 Chat Support</p>
              <a href="#" className="text-orange-600 hover:underline font-semibold">
                Start Live Chat
              </a>
            </div>
          </div>

          {transactionId && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-700 mb-2">
                <strong>Please mention this Transaction ID when contacting support:</strong>
              </p>
              <code className="text-blue-900 font-mono bg-white px-3 py-2 rounded block">
                {transactionId}
              </code>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PaymentFailedPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentFailedContent />
    </Suspense>
  );
}
