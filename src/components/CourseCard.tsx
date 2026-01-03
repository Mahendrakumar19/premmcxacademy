"use client";
import React from "react";
import Link from "next/link";

type Props = {
  id: number;
  fullname: string;
  summary?: string;
  shortname?: string;
  cost?: string; // From Moodle payment gateway
  currency?: string; // Currency code from Moodle
};

export default function CourseCard({ 
  id, 
  fullname, 
  cost,
  currency = 'INR'
}: Props) {
  const formatPrice = (amount: string, curr: string) => {
    const numAmount = parseFloat(amount);
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: curr,
      maximumFractionDigits: 0,
    }).format(numAmount);
  };

  const hasCost = cost && parseFloat(cost) > 0;

  return (
    <Link href={`/courses/${id}`}>
      <article className="group relative h-full w-full bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-0 transition-all hover:shadow-xl cursor-pointer overflow-hidden">
        {/* Course Badge - Only show if there's a cost */}
        {hasCost && (
          <div className="absolute left-3 top-3 z-10 flex items-center gap-1 bg-linear-to-r from-blue-500 to-blue-600 rounded-lg px-3 py-2 text-xs font-bold text-white shadow-lg">
            <span>💳</span>
            <span>Paid Course</span>
          </div>
        )}
        
        {/* Thumbnail placeholder */}
        <div className="relative h-48 w-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center text-6xl border-b border-gray-200 dark:border-gray-700">
          📚
        </div>
        
        <div className="relative p-4 flex flex-col">
          
          <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 min-h-10 leading-snug">
            {fullname}
          </h3>
          
          {/* Pricing from Moodle */}
          <div className="mt-auto pt-2">
            {hasCost && (
              <div className="flex items-baseline gap-2 mb-3 flex-wrap">
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  {formatPrice(cost, currency)}
                </span>
              </div>
            )}
            
            {/* CTA Button */}
            <button className="w-full rounded-lg bg-linear-to-r from-orange-500 to-orange-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:shadow-md">
              {hasCost ? 'Enroll Now' : 'Start Learning'}
            </button>
          </div>
        </div>
      </article>
    </Link>
  );
}
