"use client";
import React from "react";
import Link from "next/link";

type Props = {
  id: number;
  fullname: string;
  summary?: string;
  shortname?: string;
  enrolledusercount?: number;
  price?: number;
  originalPrice?: number;
  discountPercent?: number;
  courseType?: string;
  hasLimitedOffer?: boolean;
};

export default function CourseCard({ 
  id, 
  fullname, 
  summary, 
  shortname, 
  enrolledusercount,
  price,
  originalPrice,
  discountPercent,
  courseType,
  hasLimitedOffer
}: Props) {
  const cleanSummary = summary?.replace(/<[^>]*>/g, '').substring(0, 100);
  
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Link href={`/courses/${id}`}>
      <article className="group relative h-full w-full bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-0 transition-all hover:shadow-xl cursor-pointer overflow-hidden">
        {/* Discount Badge */}
        {hasLimitedOffer && discountPercent && (
          <div className="absolute left-3 top-3 z-10 flex items-center gap-1 bg-gradient-to-r from-red-500 to-pink-600 rounded-lg px-3 py-2 text-xs font-bold text-white shadow-lg">
            <span>🔥</span>
            <span>Extra {discountPercent}% OFF</span>
          </div>
        )}
        
        {/* Thumbnail placeholder */}
        <div className="relative h-48 w-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center text-6xl border-b border-gray-200 dark:border-gray-700">
          📚
        </div>
        
        <div className="relative p-4 flex flex-col">
          {/* Course Type Badges */}
          {courseType && (
            <div className="mb-3 flex flex-wrap gap-2">
              {courseType.split(' ').map((type, i) => (
                <span key={i} className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide border border-blue-100 dark:border-blue-800">
                  {type}
                </span>
              ))}
            </div>
          )}
          
          <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 min-h-10 leading-snug">
            {fullname}
          </h3>
          
          {/* Pricing */}
          {price && (
            <div className="mt-auto pt-2">
              <div className="flex items-baseline gap-2 mb-3 flex-wrap">
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  {formatPrice(price)}
                </span>
                {originalPrice && originalPrice > price && (
                  <>
                    <span className="text-sm text-gray-400 dark:text-gray-500 line-through">
                      {formatPrice(originalPrice)}
                    </span>
                    {discountPercent && (
                      <span className="bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-md px-2 py-0.5 text-xs font-bold border border-green-100 dark:border-green-800">
                        {discountPercent}% OFF
                      </span>
                    )}
                  </>
                )}
              </div>
              
              {/* CTA Button */}
              <button className="w-full rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:shadow-md">
                Get this course
              </button>
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}
