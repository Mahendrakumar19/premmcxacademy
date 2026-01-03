"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";

interface Payment {
  id: string;
  courseId: number;
  courseName: string;
  amount: number;
  status: "pending" | "completed" | "failed" | "free";
  paymentId?: string;
  orderId?: string;
  timestamp: number;
}

export default function PaymentHistoryPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user) {
      router.push("/auth/login?callbackUrl=/payment-history");
      return;
    }
    loadPaymentHistory();
  }, [session]);

  const loadPaymentHistory = async () => {
    try {
      setLoading(true);
      // Fetch from backend API (real-time)
      const res = await fetch('/api/payment/history');
      if (res.ok) {
        const json = await res.json();
        setPayments(json.payments || []);
      } else {
        console.error('Failed to fetch payment history');
      }
    } catch (error) {
      console.error("Failed to load payment history:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!session?.user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading payment history...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </Link>

        <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-100">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Payment History</h1>

          {payments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg text-gray-600 mb-4">No payments yet</p>
              <Link
                href="/courses"
                className="inline-block px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
              >
                Browse Courses
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Course</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Amount</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 text-gray-900">{payment.courseName}</td>
                      <td className="py-3 px-4">
                        {payment.amount > 0 ? (
                          <span className="font-semibold text-gray-900">₹{payment.amount.toLocaleString("en-IN")}</span>
                        ) : (
                          <span className="text-green-600 font-semibold">Free</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            payment.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : payment.status === "failed"
                              ? "bg-red-100 text-red-800"
                              : payment.status === "free"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600 text-sm">
                        {new Date(payment.timestamp * 1000).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <Link
                          href={`/learn/${payment.courseId}`}
                          className="text-orange-600 hover:underline text-sm font-medium"
                        >
                          View Course
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

