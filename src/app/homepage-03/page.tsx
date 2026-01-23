import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function Homepage03() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-900 via-red-900 to-black pt-20 pb-32 px-6">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div className="absolute -bottom-8 left-20 w-96 h-96 bg-red-500 rounded-full mix-blend-multiply filter blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Stay Updated with <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400">Market Insights</span>
              </h1>
              <p className="text-xl text-gray-300 mb-8">
                Connect with our expert trading community. Attend live webinars, read in-depth market analysis, and get daily trading updates to stay ahead in the MCX market.
              </p>
              <div className="flex gap-4">
                <Link href="/webinars" className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-bold hover:shadow-lg transition-all hover:scale-105">
                  Join Webinars
                </Link>
                <Link href="/blog" className="px-8 py-4 border-2 border-white text-white rounded-lg font-bold hover:bg-white hover:text-orange-900 transition-all">
                  Read Blog
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-1">
                <div className="bg-gray-900 rounded-2xl p-8 h-80">
                  <div className="text-center flex flex-col justify-center h-full">
                    <svg className="w-24 h-24 mx-auto text-orange-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-gray-400">Market Updates & Analysis</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Overview */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">What We Offer</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: '📰', title: 'Market Updates', desc: 'Daily MCX market analysis and price updates' },
              { icon: '💬', title: 'Trading Ideas', desc: 'Real-time trading signals and recommendations' },
              { icon: '🎙️', title: 'Live Webinars', desc: 'Weekly trading sessions with expert traders' },
              { icon: '🔍', title: 'Deep Analysis', desc: 'Technical and fundamental market analysis' },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-xl p-8 shadow-md hover:shadow-xl transition-all hover:-translate-y-2">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Webinar Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">Join Our Webinar Series</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all">
              <div className="h-48 bg-gradient-to-br from-orange-300 to-red-400"></div>
              <div className="p-8">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-bold uppercase text-orange-600 bg-orange-50 px-3 py-1 rounded-full">Live</span>
                  <span className="text-xs text-gray-500">Every Monday & Wednesday</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">MCX Trading Masterclass</h3>
                <p className="text-gray-600 mb-4">Interactive sessions where our expert traders share proven strategies, analyze real market scenarios, and answer your trading questions live.</p>
                <Link href="/webinars" className="text-orange-600 font-bold hover:text-orange-700">
                  Register Now →
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all">
              <div className="h-48 bg-gradient-to-br from-orange-400 to-red-500"></div>
              <div className="p-8">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-bold uppercase text-orange-600 bg-orange-50 px-3 py-1 rounded-full">Weekly</span>
                  <span className="text-xs text-gray-500">Every Friday</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Market Analysis & Trading Ideas</h3>
                <p className="text-gray-600 mb-4">Get deep analysis on current market trends, important levels to watch, and specific trading ideas based on technical and fundamental analysis.</p>
                <Link href="/webinars" className="text-orange-600 font-bold hover:text-orange-700">
                  Join Now →
                </Link>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Link href="/webinars" className="inline-block px-8 py-4 bg-orange-600 text-white rounded-lg font-bold hover:bg-orange-700 transition-all">
              View All Webinars →
            </Link>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">Latest Blog Articles</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {[
              {
                title: 'Understanding MCX Commodity Trading',
                desc: 'A comprehensive guide to getting started with MCX commodity trading, from account setup to executing your first trade.',
                date: 'Today',
              },
              {
                title: 'Technical Analysis Patterns for MCX Traders',
                desc: 'Learn the most reliable technical patterns used by professional MCX traders to identify entry and exit points.',
                date: 'Yesterday',
              },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-xl p-8 shadow-md hover:shadow-xl transition-all">
                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600 mb-4">{item.desc}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{item.date}</span>
                  <Link href="/blog" className="text-orange-600 font-bold hover:text-orange-700">
                    Read More →
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/blog" className="inline-block px-8 py-4 bg-orange-600 text-white rounded-lg font-bold hover:bg-orange-700 transition-all">
              Read All Articles →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-orange-600 to-red-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Get Trading Updates & Insights</h2>
          <p className="text-xl text-orange-100 mb-8">Join our community of MCX traders and stay informed with daily market analysis and trading opportunities.</p>
          <div className="flex gap-4 justify-center">
            <Link href="/webinars" className="px-8 py-4 bg-white text-orange-600 rounded-lg font-bold hover:shadow-lg transition-all hover:scale-105">
              Join Webinars
            </Link>
            <Link href="/blog" className="px-8 py-4 border-2 border-white text-white rounded-lg font-bold hover:bg-white hover:text-orange-600 transition-all">
              Read Blog
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
