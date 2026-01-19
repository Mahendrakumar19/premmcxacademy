'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

interface ReceiptData {
  transactionId: string;
  date: string;
  amount: string;
  paymentMethod: string;
  courses: Array<{ id: string; name: string; price: string }>;
  payerName: string;
  payerEmail: string;
  status: 'completed' | 'pending' | 'failed';
}

function PaymentReceiptContent() {
  const searchParams = useSearchParams();
  const [receiptData] = useState<ReceiptData>({
    transactionId: searchParams.get('transactionId') || 'TXN-DEMO-001',
    date: new Date().toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    amount: searchParams.get('amount') || '₹1,00,000',
    paymentMethod: searchParams.get('method') || 'card',
    courses: [
      { id: '1', name: 'Advanced MCX Trading', price: '₹30,000' },
      { id: '2', name: 'Technical Analysis Mastery', price: '₹35,000' },
      { id: '3', name: 'Risk Management', price: '₹35,000' },
    ],
    payerName: 'John Doe',
    payerEmail: 'john@example.com',
    status: 'completed',
  });

  const downloadReceipt = () => {
    const receiptContent = `
╔════════════════════════════════════════════════════════════════╗
║                    PAYMENT RECEIPT                             ║
║               Prem MCX Training Academy                        ║
╚════════════════════════════════════════════════════════════════╝

Transaction ID: ${receiptData.transactionId}
Date & Time: ${receiptData.date}
Status: ${receiptData.status.toUpperCase()}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PAYER INFORMATION:
Name: ${receiptData.payerName}
Email: ${receiptData.payerEmail}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

COURSES ENROLLED:
${receiptData.courses
  .map((course, idx) => `${idx + 1}. ${course.name} - ${course.price}`)
  .join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Payment Method: ${receiptData.paymentMethod}
Total Amount: ${receiptData.amount}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

IMPORTANT NOTES:
• Keep this receipt for your records
• Your course access will be activated within 24 hours
• Check your email for login credentials
• For support: support@premmcx.com | +91 9876 543 210

Generated on: ${new Date().toISOString()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;

    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `receipt-${receiptData.transactionId}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const printReceipt = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 to-blue-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Print Styles */}
        <style>{`
          @media print {
            body { background: white; }
            .no-print { display: none; }
            .receipt-container { box-shadow: none; }
          }
        `}</style>

        {/* Header with Print Actions */}
        <div className="no-print flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Payment Receipt</h1>
            <p className="text-gray-600 mt-2">Your payment has been processed successfully</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={downloadReceipt}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                />
              </svg>
              Download
            </button>
            <button
              onClick={printReceipt}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4H9a2 2 0 00-2 2v2a2 2 0 002 2h10a2 2 0 002-2v-2a2 2 0 00-2-2h-2m-4-4V9m0 4v4"
                />
              </svg>
              Print
            </button>
          </div>
        </div>

        {/* Receipt Container */}
        <div className="receipt-container bg-white rounded-xl shadow-2xl overflow-hidden">
          {/* Receipt Header */}
          <div className="bg-linear-to-r from-orange-600 to-orange-700 text-white p-8 text-center">
            <h2 className="text-3xl font-bold mb-2">Prem MCX Training Academy</h2>
            <p className="text-orange-100">Official Payment Receipt</p>
          </div>

          {/* Receipt Content */}
          <div className="p-8">
            {/* Transaction Status */}
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center h-12 w-12 bg-green-100 rounded-full">
                  <svg className="h-6 w-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Payment Status</p>
                  <p className="text-xl font-bold text-green-600">COMPLETED</p>
                </div>
              </div>
            </div>

            {/* Key Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 pb-8 border-b border-gray-200">
              <div>
                <p className="text-sm text-gray-600 mb-1">Transaction ID</p>
                <p className="text-lg font-mono font-bold text-gray-900">{receiptData.transactionId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Date & Time</p>
                <p className="text-lg font-bold text-gray-900">{receiptData.date}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Payment Method</p>
                <p className="text-lg font-bold text-gray-900 capitalize">
                  {receiptData.paymentMethod === 'card'
                    ? 'Credit/Debit Card'
                    : receiptData.paymentMethod === 'upi'
                      ? 'UPI'
                      : 'Bank Transfer'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                <p className="text-lg font-bold text-orange-600">{receiptData.amount}</p>
              </div>
            </div>

            {/* Payer Information */}
            <div className="mb-8 pb-8 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Payer Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Full Name</p>
                  <p className="font-semibold text-gray-900">{receiptData.payerName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Email Address</p>
                  <p className="font-semibold text-gray-900">{receiptData.payerEmail}</p>
                </div>
              </div>
            </div>

            {/* Courses Enrolled */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Courses Enrolled</h3>
              <div className="space-y-3">
                {receiptData.courses.map((course, idx) => (
                  <div key={idx} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-900">{course.name}</p>
                      <p className="text-sm text-gray-600">Course ID: {course.id}</p>
                    </div>
                    <p className="font-bold text-gray-900">{course.price}</p>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="mt-4 p-4 bg-orange-50 rounded-lg border-2 border-orange-200">
                <div className="flex justify-between items-center">
                  <p className="text-lg font-bold text-gray-900">Total Amount</p>
                  <p className="text-2xl font-bold text-orange-600">{receiptData.amount}</p>
                </div>
              </div>
            </div>

            {/* Important Notes */}
            <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded mb-8">
              <h4 className="font-bold text-blue-900 mb-2">Important Notes</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>✓ Keep this receipt for your records</li>
                <li>✓ Your course access will be activated within 24 hours</li>
                <li>✓ Check your email for login credentials and course details</li>
                <li>✓ Refund policy: 30 days money-back guarantee</li>
              </ul>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 pt-6 text-center text-sm text-gray-600">
              <p className="mb-2">Thank you for your purchase!</p>
              <p className="mb-4">For support: support@premmcx.com | +91 9876 543 210</p>
              <p className="text-xs text-gray-500">
                Generated on: {new Date().toISOString()}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="no-print flex flex-col sm:flex-row gap-4 mt-8">
          <Link
            href="/my-courses"
            className="flex-1 px-6 py-4 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition text-center"
          >
            Go to My Courses
          </Link>
          <Link
            href="/payment-history"
            className="flex-1 px-6 py-4 bg-gray-200 text-gray-900 rounded-lg font-semibold hover:bg-gray-300 transition text-center"
          >
            View Payment History
          </Link>
          <Link
            href="/courses"
            className="flex-1 px-6 py-4 border-2 border-orange-600 text-orange-600 rounded-lg font-semibold hover:bg-orange-50 transition text-center"
          >
            Browse More Courses
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PaymentReceiptPage() {
  return (
    <Suspense fallback={<div>Loading receipt...</div>}>
      <PaymentReceiptContent />
    </Suspense>
  );
}
