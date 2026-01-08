"use client";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useCart } from "@/context/CartContext";
import { useRoleBasedNavigation } from "@/hooks/useRoleBasedNavigation";
import { getRoleDisplayName } from "@/lib/rbac";
import Image from "next/image";

export default function Navbar() {
  const { data: session, status } = useSession();
  const { getItemCount } = useCart();
  const { isAdmin, isTeacher, role } = useRoleBasedNavigation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const cartCount = getItemCount();

  // Ensure light mode only
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    localStorage.removeItem('theme');
  }, []);

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 group">
          <Image src="/logo pp.svg" alt="PremMCX Logo" width={40} height={40} className="h-10 w-10" />
          <div className="flex flex-col">
            <span className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
              PremMCX
            </span>
            <span className="text-xs text-gray-500">Trading Academy</span>
          </div>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden items-center gap-6 md:flex">
          <Link
            href="/"
            className="text-sm font-semibold text-gray-700 hover:text-indigo-600 transition-colors relative group"
          >
            Home
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-600 group-hover:w-full transition-all duration-300"></span>
          </Link>
          {session?.user && (
            <>
              <Link
                href="/dashboard"
                className="text-sm font-semibold text-gray-700 hover:text-indigo-600 transition-colors relative group"
              >
                Dashboard
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-600 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link
                href="/my-courses"
                className="text-sm font-semibold text-gray-700 hover:text-indigo-600 transition-colors relative group"
              >
                My Courses
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-600 group-hover:w-full transition-all duration-300"></span>
              </Link>
            </>
          )}
          <Link
            href="/about"
            className="text-sm font-semibold text-gray-700 hover:text-indigo-600 transition-colors relative group"
          >
            About Us
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-600 group-hover:w-full transition-all duration-300"></span>
          </Link>
          
          {/* Shopping Cart */}
          <Link
            href="/cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 transition-all hover:shadow-md hover:scale-105"
          >
            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-xs font-bold text-white shadow-md">
                {cartCount}
              </span>
            )}
          </Link>

          {/* User Menu */}
          {status === "loading" ? (
            <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse"></div>
          ) : session?.user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 transition-all hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:border-indigo-200"
              >
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
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
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="text-sm font-semibold text-gray-900">
                      {session.user.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {session.user.email}
                    </p>
                    <p className="text-xs font-medium text-orange-600 mt-1">
                      {getRoleDisplayName(role)}
                    </p>
                  </div>

                  {/* Admin Menu Items */}
                  {isAdmin && (
                    <>
                      <div className="px-3 py-1 mt-2">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Admin Panel
                        </p>
                      </div>
                      <Link
                        href="/admin"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <svg className="w-4 h-4 mr-3 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Dashboard
                      </Link>
                      <Link
                        href="/admin/users"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <svg className="w-4 h-4 mr-3 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        User Management
                      </Link>
                      <Link
                        href="/admin/courses"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <svg className="w-4 h-4 mr-3 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        Course Management
                      </Link>
                      <Link
                        href="/admin/enrollments"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <svg className="w-4 h-4 mr-3 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Manage Enrollments
                      </Link>
                      <Link
                        href="/admin/enrollment-methods"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <svg className="w-4 h-4 mr-3 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Enrollment Methods
                      </Link>
                      <div className="border-t border-gray-200 my-2"></div>
                    </>
                  )}

                  {/* Teacher Menu Items */}
                  {isTeacher && (
                    <>
                      <div className="px-3 py-1 mt-2">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Teaching
                        </p>
                      </div>
                      <Link
                        href="/teacher/classes"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <svg className="w-4 h-4 mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        My Classes
                      </Link>
                      <Link
                        href="/teacher/enrollments"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <svg className="w-4 h-4 mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Enrollments
                      </Link>
                      <Link
                        href="/teacher/create-course"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <svg className="w-4 h-4 mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Create Course
                      </Link>
                      <div className="border-t border-gray-200 my-2"></div>
                    </>
                  )}

                  {/* Student Menu Items */}
                  <div className="px-3 py-1">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Learning
                    </p>
                  </div>
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
                  <Link
                    href="/preferences"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <svg className="w-4 h-4 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Preferences
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
            <Link
              href="/auth/login"
              className="rounded-lg bg-linear-to-r from-orange-500 to-orange-600 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:shadow-md"
            >
              Login
            </Link>
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
                {isAdmin && (
                  <>
                    <div className="border-t border-gray-200 my-2"></div>
                    <Link
                      href="/admin"
                      className="text-sm font-semibold text-orange-600"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      ⚙️ Admin Panel
                    </Link>
                    <Link
                      href="/admin/users"
                      className="text-sm font-semibold text-gray-700"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      👥 Users
                    </Link>
                    <Link
                      href="/admin/courses"
                      className="text-sm font-semibold text-gray-700"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      📖 Courses
                    </Link>
                    <Link
                      href="/admin/enrollments"
                      className="text-sm font-semibold text-gray-700"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      🎓 Enrollments
                    </Link>
                    <Link
                      href="/admin/enrollment-methods"
                      className="text-sm font-semibold text-gray-700"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      💰 Enrollment Methods
                    </Link>
                    <div className="border-t border-gray-200 my-2"></div>
                    <div className="border-t border-gray-200 my-2"></div>
                  </>
                )}
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
              <Link
                href="/auth/login"
                className="rounded-lg bg-linear-to-r from-orange-500 to-orange-600 px-6 py-2 text-sm font-semibold text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
