"use client";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useCart } from "@/context/CartContext";

export default function Navbar() {
  const { data: session, status } = useSession();
  const { getItemCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const cartCount = getItemCount();

  // Ensure light mode only
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    localStorage.removeItem('theme');
  }, []);

  return (
    <nav className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-linear-to-br from-yellow-400 to-orange-500 text-lg font-bold text-white shadow-md">
              P
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-gray-900">
              Prem MCX
            </span>
            <span className="text-xs text-gray-500">Trading Academy</span>
          </div>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden items-center gap-5 md:flex">
          <Link
            href="/"
            className="text-sm font-semibold text-gray-700 transition-all hover:text-orange-600"
          >
            Home
          </Link>
          <Link
            href="/courses"
            className="text-sm font-semibold text-gray-700 transition-all hover:text-orange-600"
          >
            Courses
          </Link>
          <Link
            href="/about"
            className="text-sm font-semibold text-gray-700 transition-all hover:text-orange-600"
          >
            About Us
          </Link>
          
          {/* Shopping Cart */}
          <Link
            href="/cart"
            className="relative flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 border border-gray-200 transition-all hover:bg-gray-200"
          >
            <span className="text-base">🛒</span>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                {cartCount}
              </span>
            )}
          </Link>

          {/* User Menu */}
          {status === "loading" ? (
            <div className="h-9 w-9 rounded-full bg-gray-200 animate-pulse"></div>
          ) : session?.user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 transition-all hover:bg-gray-50"
              >
                <div className="h-8 w-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-sm">
                  {session.user.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <span className="hidden md:block text-sm font-semibold text-gray-700">
                  {session.user.name?.split(" ")[0] || "User"}
                </span>
                <svg
                  className={`w-4 h-4 text-gray-600 transition-transform ${
                    showUserMenu ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="text-sm font-semibold text-gray-900">
                      {session.user.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {session.user.email}
                    </p>
                  </div>
                  <Link
                    href="/dashboard"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <svg className="w-4 h-4 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Dashboard
                  </Link>
                  <Link
                    href="/my-courses"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <svg className="w-4 h-4 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    My Courses
                  </Link>
                  <Link
                    href="/dashboard/grades"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <svg className="w-4 h-4 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Grades
                  </Link>
                  <Link
                    href="/profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <svg className="w-4 h-4 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Profile
                  </Link>
                  <div className="border-t border-gray-200 my-2"></div>
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="text-sm font-semibold text-gray-700 hover:text-orange-600 transition-all"
              >
                Login
              </Link>
              <Link
                href="/auth/register"
                className="rounded-lg bg-linear-to-r from-orange-500 to-orange-600 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:shadow-md"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 border border-gray-200 md:hidden"
        >
          <span className="text-gray-700">{mobileMenuOpen ? "✕" : "☰"}</span>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="bg-white border-t border-gray-200 px-6 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            <Link
              href="/"
              className="text-sm font-semibold text-gray-700"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/courses"
              className="text-sm font-semibold text-gray-700"
              onClick={() => setMobileMenuOpen(false)}
            >
              Courses
            </Link>
            <Link
              href="/about"
              className="text-sm font-semibold text-gray-700"
              onClick={() => setMobileMenuOpen(false)}
            >
              About Us
            </Link>
            <Link
              href="/cart"
              className="flex items-center gap-2 text-sm font-semibold text-gray-700"
              onClick={() => setMobileMenuOpen(false)}
            >
              Cart 🛒 {cartCount > 0 && `(${cartCount})`}
            </Link>
            
            {session?.user ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-sm font-semibold text-gray-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  📊 Dashboard
                </Link>
                <Link
                  href="/my-courses"
                  className="text-sm font-semibold text-gray-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  📚 My Courses
                </Link>
                <Link
                  href="/profile"
                  className="text-sm font-semibold text-gray-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  👤 Profile
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    signOut({ callbackUrl: "/" });
                  }}
                  className="text-left text-sm font-semibold text-red-600"
                >
                  🚪 Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-sm font-semibold text-gray-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="rounded-lg bg-linear-to-r from-orange-500 to-orange-600 px-6 py-2 text-sm font-semibold text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
