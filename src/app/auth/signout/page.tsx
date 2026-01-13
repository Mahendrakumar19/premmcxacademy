"use client";
import React, { useEffect } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";

export default function SignOutPage() {
  useEffect(() => {
    // Automatically trigger sign out and redirect to main site
    const performSignOut = async () => {
      await signOut({ 
        redirect: true, 
        callbackUrl: "https://premmcxtrainingacademy.com" 
      });
    };
    
    // Small delay to show the message
    const timer = setTimeout(() => {
      performSignOut();
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <Link href="/" className="inline-flex items-center gap-3">
            <Image 
              src="/logo p.png" 
              alt="PremMCX Logo" 
              width={56} 
              height={56}
              className="rounded-full shadow-lg"
            />
            <div className="flex flex-col items-start">
              <span className="text-2xl font-bold text-gray-900">Prem MCX</span>
              <span className="text-sm text-gray-600">Trading Academy</span>
            </div>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Signing Out</h1>
          <p className="text-gray-600 mb-6">
            You are being securely signed out of your account.
          </p>
          <div className="flex justify-center">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
        
        <p className="mt-6 text-sm text-gray-500">
          Redirecting to premmcxtrainingacademy.com...
        </p>
      </div>
    </div>
  </div>
  );
}
