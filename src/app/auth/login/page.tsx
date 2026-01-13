"use client";
import React, { useState, Suspense } from "react";
import Link from "next/link";
import { signIn, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/context/CartContext";
import Image from "next/image";
import Navbar from "@/components/Navbar";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const rawCallbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  // Security: Ensure callbackUrl is an internal page path to prevent external redirects
  // or redirects to static files that might trigger downloads
  let callbackUrl = rawCallbackUrl;
  if (rawCallbackUrl.startsWith('http') || 
      rawCallbackUrl.includes('.svg') || 
      rawCallbackUrl.includes('.png') || 
      rawCallbackUrl.includes('.jpg') || 
      rawCallbackUrl.includes('.pdf')) {
    callbackUrl = '/dashboard';
  }

  const handleAdminLogin = async () => {
    if (!formData.username || !formData.password) {
      setError("Please enter your admin credentials");
      return;
    }
    
    setLoading(true);
    setError("");

    try {
      // 1. Authenticate with Moodle directly via proxy to get a token
      // We don't use NextAuth signIn because we don't want a session on this UI
      const loginRes = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "moodle_token",
          username: formData.username,
          password: formData.password
        })
      });

      const loginData = await loginRes.json();

      if (!loginRes.ok || !loginData.token) {
        setError(loginData.error || "Invalid admin credentials");
        return;
      }

      // 2. Use the token to get a native Moodle autologin URL
      const authRes = await fetch(`/api/moodle?action=autologin&token=${loginData.token}`);
      const authData = await authRes.json();
      
      if (authData.ok && authData.data?.key) {
        // 3. Construct the native autologin URL manually to bypass Moodle redirect issues
        const moodleUrl = process.env.NEXT_PUBLIC_MOODLE_URL || "https://lms.premmcxtrainingacademy.com";
        const baseUrl = moodleUrl.endsWith('/') ? moodleUrl.slice(0, -1) : moodleUrl;
        
        // Native Moodle autologin path
        const autologinPath = "/admin/tool/mobile/autologin.php";
        const targetUrl = `${baseUrl}/my`;
        
        // Construct final URL with required parameters
        const finalUrl = `${baseUrl}${autologinPath}?userid=${loginData.userid}&key=${authData.data.key}&url=${encodeURIComponent(targetUrl)}`;
        
        console.log("Direct Admin Redirect:", finalUrl);
        window.location.href = finalUrl;
      } else {
        // Fallback to standard Moodle login if autologin fails
        const moodleUrl = process.env.NEXT_PUBLIC_MOODLE_URL || "https://lms.premmcxtrainingacademy.com";
        window.location.href = `${moodleUrl}/login/index.php`;
      }
    } catch (err) {
      console.error("Admin login error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        username: formData.username,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid username or password");
      } else if (result?.ok) {
        // Check if there's a pending cart item to add after login
        const pendingItem = sessionStorage.getItem('pendingAddToCart');
        if (pendingItem) {
          try {
            const item = JSON.parse(pendingItem);
            addToCart(item);
            sessionStorage.removeItem('pendingAddToCart');
            // Redirect to cart instead of callback URL if there's a pending item
            router.push('/cart');
          } catch (err) {
            console.error('Error adding pending cart item:', err);
            router.push(callbackUrl);
          }
        } else {
          router.push(callbackUrl);
        }
        router.refresh();
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 justify-center">
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

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600 mb-6">
            Sign in to access your courses and continue learning
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                required
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                placeholder="Enter your username"
                disabled={loading}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                placeholder="Enter your password"
                disabled={loading}
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <Link
                href="/auth/forgot-password"
                className="text-sm font-semibold text-orange-500 hover:text-orange-600"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="mt-4">
            <button
              onClick={handleAdminLogin}
              disabled={loading}
              className="w-full bg-gray-800 hover:bg-gray-900 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Verifying Admin...
                </span>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Login as Admin
                </>
              )}
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{" "}
              <Link
                href="/auth/register"
                className="font-semibold text-orange-500 hover:text-orange-600"
              >
                Create Account
              </Link>
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-500">
              By signing in, you agree to our{" "}
              <Link href="/terms" className="text-orange-500 hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-orange-500 hover:underline">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-gray-600 hover:text-gray-900 font-medium"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
