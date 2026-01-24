"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCart } from "@/context/CartContext";
import Image from "next/image";

type Props = {
  id: number;
  fullname: string;
  summary?: string;
  shortname?: string;
  cost?: string;
  currency?: string;
  gst?: string | number;
  imageurl?: string;
  courseimage?: string;
};

export default function CourseCard({ 
  id,
  fullname,
  cost,
  currency = 'INR',
  gst,
  imageurl,
  courseimage
}: Props) {
  const router = useRouter();
  const { status } = useSession();
  const { addToCart } = useCart();
  const [imageError, setImageError] = React.useState(false);

  const formatPrice = (amount: string, curr: string) => {
    const numAmount = parseFloat(amount);
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: curr,
      maximumFractionDigits: 0,
    }).format(numAmount);
  };

  // Calculate final price based on GST
  // GST = 0 means inclusive (show as-is)
  // GST = 18 means exclusive (will be added in cart)
  const basePrice = cost ? parseFloat(cost) : 0;
  const gstRate = gst ? parseInt(String(gst)) : 0;
  // For homepage, always show base price
  const displayPrice = basePrice;

  const hasCost = cost && parseFloat(cost) > 0;

  // Get the raw image URL from props
  const rawImageUrl = courseimage || imageurl;
  
  // If it's a Moodle image URL, use the proxy
  const imageUrl = (rawImageUrl?.includes('lms.prem') || rawImageUrl?.includes('pluginfile')) 
    ? `/api/proxy-image?url=${encodeURIComponent(rawImageUrl)}`
    : rawImageUrl || '/placeholder-course.jpg';

  const handleEnroll = (e: React.MouseEvent) => {
    e.preventDefault();

    if (hasCost) {
      // Paid course - start payment
      if (status === 'unauthenticated') {
        // Redirect to login
        router.push(`/auth/login?callbackUrl=${encodeURIComponent(`/courses/${id}`)}`);
        return;
      }

      // User is logged in - add to cart with base price and GST for calculation in cart
      addToCart({
        courseId: id,
        courseName: fullname,
        cost: String(basePrice.toFixed(2)),
        currency: currency,
        gst: gstRate,
        thumbnailUrl: imageUrl,
      });

      // Go directly to checkout
      router.push('/checkout');
    } else {
      // Free course - go to course details
      router.push(`/courses/${id}`);
    }
  };

  return (
    <div
      onClick={handleEnroll}
      className="group relative h-full w-full bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-0 transition-all hover:shadow-xl cursor-pointer overflow-hidden"
    >
      {/* Course Badge - Only show if there's a cost */}
      {hasCost && (
        <div className="absolute left-3 top-3 z-10 flex items-center gap-1 bg-linear-to-r from-blue-500 to-blue-600 rounded-lg px-3 py-2 text-xs font-bold text-white shadow-lg">
          <span>💳</span>
          <span>Paid Course</span>
        </div>
      )}
      
      {/* Thumbnail Image */}
      <div className="relative h-48 w-full bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center text-6xl border-b border-gray-200 dark:border-gray-700 overflow-hidden">
        {!imageError && imageUrl && imageUrl !== '/placeholder-course.jpg' ? (
          <img
            src={imageUrl}
            alt={fullname}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            decoding="async"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex items-center justify-center text-6xl">📚</div>
        )}
      </div>
      
      <div className="relative p-4 flex flex-col">
        
        <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 min-h-10 leading-snug">
          {fullname}
        </h3>
        
        {/* Pricing from Moodle */}
        <div className="mt-auto pt-2">
          {hasCost && (
            <div className="mb-3">
              <div className="flex items-baseline gap-2 mb-3 flex-wrap">
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  {formatPrice(String(displayPrice), currency)}
                </span>
              </div>
            </div>
          )}
          
          {/* CTA Button */}
          <button className="w-full rounded-lg bg-linear-to-r from-orange-500 to-orange-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:shadow-md">
            {hasCost ? 'Buy Now' : 'Start Learning'}
          </button>
        </div>
      </div>
    </div>
  );
}
