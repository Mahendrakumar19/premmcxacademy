'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const helpCategories = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      title: "Getting Started",
      description: "Learn how to create an account, enroll in courses, and navigate the platform",
      articles: [
        { title: "Creating Your Account", link: "#create-account" },
        { title: "How to Enroll in a Course", link: "#enroll-course" },
        { title: "Navigating Your Dashboard", link: "#dashboard" },
        { title: "Platform Overview", link: "#overview" }
      ]
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      title: "Courses & Learning",
      description: "Everything about accessing lessons, tracking progress, and course materials",
      articles: [
        { title: "Accessing Course Content", link: "#access-content" },
        { title: "Tracking Your Progress", link: "#track-progress" },
        { title: "Downloading Materials", link: "#download-materials" },
        { title: "Participating in Live Sessions", link: "#live-sessions" }
      ]
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      title: "Payments & Billing",
      description: "Information about payment methods, invoices, and refunds",
      articles: [
        { title: "Payment Methods Accepted", link: "#payment-methods" },
        { title: "Understanding Pricing", link: "#pricing" },
        { title: "Refund Policy", link: "#refunds" },
        { title: "Accessing Your Invoices", link: "#invoices" }
      ]
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      title: "Account Management",
      description: "Manage your profile, password, and account settings",
      articles: [
        { title: "Updating Your Profile", link: "#update-profile" },
        { title: "Resetting Your Password", link: "#reset-password" },
        { title: "Email Preferences", link: "#email-preferences" },
        { title: "Deactivating Your Account", link: "#deactivate" }
      ]
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      title: "Technical Support",
      description: "Troubleshooting common technical issues and platform requirements",
      articles: [
        { title: "System Requirements", link: "#system-requirements" },
        { title: "Video Playback Issues", link: "#video-issues" },
        { title: "Login Problems", link: "#login-issues" },
        { title: "Mobile App Support", link: "#mobile-app" }
      ]
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: "Security & Privacy",
      description: "Learn about data protection, privacy policies, and security measures",
      articles: [
        { title: "Privacy Policy", link: "/privacy" },
        { title: "Data Security", link: "#data-security" },
        { title: "Cookie Policy", link: "#cookies" },
        { title: "Terms of Service", link: "#terms" }
      ]
    }
  ];

  const quickGuides = [
    {
      title: "Quick Start Guide",
      time: "5 min read",
      description: "Get up and running with your first course in minutes"
    },
    {
      title: "Video Tutorial Library",
      time: "Watch",
      description: "Watch step-by-step tutorials for all major features"
    },
    {
      title: "Trading Basics",
      time: "10 min read",
      description: "Essential concepts for beginners in commodity trading"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">
              How Can We Help You?
            </h1>
            <p className="text-xl text-indigo-100 max-w-3xl mx-auto mb-8">
              Search our help center or browse categories below to find the answers you need
            </p>
            
            {/* Search Bar */}
            <div className="max-w-3xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for help articles, guides, tutorials..."
                  className="w-full px-6 py-5 rounded-2xl text-gray-900 text-lg focus:outline-none focus:ring-4 focus:ring-white/30 pl-14 shadow-2xl"
                />
                <svg
                  className="absolute left-5 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access Cards */}
      <div className="max-w-7xl mx-auto px-4 -mt-12 mb-16">
        <div className="grid md:grid-cols-3 gap-6">
          {quickGuides.map((guide, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow cursor-pointer border border-gray-100"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                  {index + 1}
                </div>
                <span className="text-sm text-indigo-600 font-semibold bg-indigo-50 px-3 py-1 rounded-full">
                  {guide.time}
                </span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{guide.title}</h3>
              <p className="text-gray-600">{guide.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Help Categories */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">
          Browse by Category
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {helpCategories.map((category, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all border border-gray-100 group"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform">
                {category.icon}
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {category.title}
              </h3>
              
              <p className="text-gray-600 mb-6">
                {category.description}
              </p>
              
              <ul className="space-y-3">
                {category.articles.map((article, articleIndex) => (
                  <li key={articleIndex}>
                    <a
                      href={article.link}
                      className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium group/link"
                    >
                      <svg className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      {article.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Support Section */}
      <div className="bg-gradient-to-br from-gray-50 to-indigo-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-white rounded-3xl shadow-xl p-12">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Still Need Help?
              </h2>
              <p className="text-xl text-gray-600">
                Our support team is ready to assist you
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Email Support</h3>
                <p className="text-gray-600 mb-4">Get help via email</p>
                <a href="mailto:contact@premmcxtraining.com" className="text-indigo-600 hover:text-indigo-700 font-semibold">
                  premmcxtrainingacademy@gmail.com
                </a>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Phone Support</h3>
                <p className="text-gray-600 mb-4">Mon-Sat, 9 AM - 7 PM IST</p>
                <a href="tel:+917717756371" className="text-indigo-600 hover:text-indigo-700 font-semibold">
                  +91 7717756371
                </a>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Live Chat</h3>
                <p className="text-gray-600 mb-4">Chat with our team</p>
                <Link href="/contact" className="text-indigo-600 hover:text-indigo-700 font-semibold">
                  Start a conversation
                </Link>
              </div>
            </div>
            
            <div className="text-center mt-12">
              <Link
                href="/contact"
                className="inline-block px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all hover:-translate-y-0.5"
              >
                Contact Support Team
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Link */}
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Looking for Quick Answers?
        </h2>
        <p className="text-xl text-gray-600 mb-8">
          Check our FAQ section for instant answers to common questions
        </p>
        <Link
          href="/faq"
          className="inline-flex items-center gap-2 px-8 py-4 bg-white text-indigo-600 rounded-xl font-semibold border-2 border-indigo-600 hover:bg-indigo-50 transition-colors"
        >
          Visit FAQ Page
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
