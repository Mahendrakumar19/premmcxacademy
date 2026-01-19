"use client";
import React from 'react';
import Navbar from "@/components/Navbar";
import Link from 'next/link';

export default function BlogLandingPage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 to-white">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-linear-to-br from-indigo-600 via-purple-600 to-pink-500 text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Trading Insights & Market Analysis
            </h1>
            <p className="text-xl md:text-2xl text-gray-100 mb-8 leading-relaxed">
              Expert articles on MCX trading, option strategies, price action, technical analysis, and market insights from professional traders.
            </p>
            <button 
              onClick={() => document.getElementById('articles')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 bg-white text-indigo-600 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors"
            >
              Explore Articles
            </button>
          </div>
        </div>
      </section>

      {/* Featured Articles */}
      <section id="articles" className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">Latest Trading Articles</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              title: 'Mastering Intraday Price Action',
              category: 'Technical Analysis',
              description: 'Learn how to identify and trade intraday price action patterns with precision for consistent profits.'
            },
            {
              title: 'Option Chain Strategy Guide',
              category: 'Options Trading',
              description: 'Complete guide to understanding option chains and executing profitable option strategies in NIFTY and BANKNIFTY.'
            },
            {
              title: 'Gold & Silver Trading Tips',
              category: 'Commodities',
              description: 'Expert strategies for trading precious metals in the commodity market with proper risk management.'
            },
            {
              title: 'Crude Oil Trading Secrets',
              category: 'Commodities',
              description: 'Advanced techniques for trading crude oil futures with focus on intraday volatility and price momentum.'
            },
            {
              title: 'NIFTY & BANKNIFTY Trading',
              category: 'Index Trading',
              description: 'Master the art of trading major indices using proven technical analysis and price action methods.'
            },
            {
              title: 'Crypto Trading Essentials',
              category: 'Cryptocurrency',
              description: 'Navigate cryptocurrency markets with technical analysis and risk management principles.'
            }
          ].map((article, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden group">
              <div className="h-48 bg-linear-to-br from-blue-400 to-purple-500 group-hover:from-blue-500 group-hover:to-purple-600 transition-all" />
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-600 rounded-full text-sm font-medium">{article.category}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors">
                  {article.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {article.description}
                </p>
                <Link href="#" className="text-indigo-600 font-semibold hover:text-indigo-700">
                  Read More →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-linear-to-r from-indigo-600 to-purple-600 text-white py-16 mt-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Master Trading?</h2>
          <p className="text-lg text-gray-100 mb-8 max-w-2xl mx-auto">
            Enroll in our comprehensive courses with 500+ hours of content, expert instructors, and live trading sessions.
          </p>
          <Link 
            href="/cart"
            className="inline-block px-8 py-4 bg-white text-indigo-600 rounded-lg font-bold hover:bg-gray-100 transition-colors"
          >
            Explore Courses
          </Link>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center text-sm text-gray-600">
            <p>
              <Link href="/privacy-blog" className="text-indigo-600 hover:text-indigo-700">Privacy</Link>
              {' '} • {' '}
              <Link href="/terms-blog" className="text-indigo-600 hover:text-indigo-700">Terms</Link>
              {' '} • © 2024 Prem MCX Training Academy
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
