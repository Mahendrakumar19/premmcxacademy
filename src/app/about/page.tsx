"use client";
import React from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 py-20">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            About <span className="text-yellow-300">PremMCX</span>
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Leading academy for share and commodity market trading, specializing in technical and fundamental analysis for natural gas, crude oil, gold, and silver trading.
          </p>
        </div>
      </section>

      <main className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        {/* Stats */}
        <section className="mb-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { number: "10,000+", label: "Active Students", icon: "👥" },
              { number: "50+", label: "Expert Courses", icon: "📚" },
              { number: "95%", label: "Success Rate", icon: "🎯" },
              { number: "24/7", label: "Support Available", icon: "💬" }
            ].map((stat, idx) => (
              <div key={idx} className="bg-white rounded-2xl shadow-lg p-6 text-center border border-indigo-100 hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="text-4xl mb-3">{stat.icon}</div>
                <div className="mb-2 text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {stat.number}
                </div>
                <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Mission */}
        <section className="mb-20">
          <div className="bg-white rounded-3xl shadow-lg p-10 md:p-12 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Our Mission</h2>
            </div>
            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              At Prem MCX Training Academy, we believe that financial education is the key to wealth creation. Our mission is to democratize access to professional trading knowledge and empower individuals to achieve financial independence through smart, disciplined trading in both share and commodity markets.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              We combine cutting-edge technical and fundamental analysis, time-tested strategies, and personalized mentorship through our interactive lessons, real-world case studies, and live webinars to help students master trading in natural gas, crude oil, gold, silver, and stock markets.
            </p>
          </div>
        </section>

          {/* What We Offer */}
          <section className="mb-20">
            <h2 className="mb-12 text-4xl font-bold text-gray-900 text-center">What We Offer</h2>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  ),
                  title: "Comprehensive Courses",
                  description: "From basics to advanced strategies, our structured curriculum covers everything you need to master MCX trading with real-time price tracking and payment integration."
                },
                {
                  icon: (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  ),
                  title: "Expert Mentorship",
                  description: "Learn directly from seasoned traders with years of real market experience and proven track records in commodity trading."
                },
                {
                  icon: (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  ),
                  title: "Live Market Analysis",
                  description: "Daily live sessions analyzing real-time market conditions with proper course pricing and secure payment channels via Razorpay."
                },
                {
                  icon: (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  ),
                  title: "Proven Strategies",
                  description: "Access to time-tested trading strategies for scalping, swing trading, and position trading with transparent pricing."
                },
                {
                  icon: (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  ),
                  title: "Community Support",
                  description: "Join a vibrant community of traders, share insights, and learn from collective experiences in our exclusive forums."
                },
                {
                  icon: (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ),
                  title: "Lifetime Access",
                  description: "All course materials, recordings, and updates are yours forever with secure payment processing and instant enrollment."
                }
              ].map((item, idx) => (
                <div key={idx} className="group bg-white rounded-2xl shadow-md p-8 border border-gray-100 hover:shadow-xl hover:border-indigo-200 transition-all hover:-translate-y-2">
                  <div className="mb-4 w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Why Choose Us */}
          <section className="mb-20">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-3xl p-10 md:p-12 border border-indigo-100">
              <h2 className="mb-8 text-4xl font-bold text-gray-900 text-center">Why Choose PremMCX?</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  "Industry-leading instructors with 10+ years of trading experience",
                  "Real-time market analysis and trade alerts",
                  "Personalized attention in small batch sizes",
                  "30-day money-back guarantee on all paid courses",
                  "Flexible learning schedules for working professionals",
                  "Practical, hands-on approach with live trading examples",
                  "Secure payment processing with Razorpay integration",
                  "Transparent pricing fetched directly from Moodle",
                  "Instant course enrollment after payment verification",
                  "Regular market updates and strategy workshops"
                ].map((point, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-4 bg-white rounded-xl hover:shadow-md transition-shadow">
                    <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-gray-700 font-medium">{point}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Contact CTA */}
          <section className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl shadow-2xl p-12 text-center">
            <h2 className="mb-4 text-3xl md:text-4xl font-bold text-white">Ready to Start Your Trading Journey?</h2>
            <p className="mb-8 text-xl text-indigo-100 max-w-2xl mx-auto">
              Join thousands of successful traders who transformed their financial future with PremMCX Academy.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/">
                <button className="rounded-xl bg-white hover:bg-gray-100 px-8 py-4 text-lg font-semibold text-indigo-600 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                  Browse Courses
                </button>
              </Link>
              <Link href="/contact">
                <button className="rounded-xl bg-transparent border-2 border-white px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-white hover:text-indigo-600">
                  Contact Us
                </button>
              </Link>
            </div>
          </section>
        </main>
    </div>
  );
}
