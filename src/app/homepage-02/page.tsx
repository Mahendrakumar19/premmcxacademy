import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function Homepage02() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-900 via-emerald-900 to-black pt-20 pb-32 px-6">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-green-500 rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div className="absolute -bottom-8 left-20 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Professional <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">Trading Tools</span>
              </h1>
              <p className="text-xl text-gray-300 mb-8">
                Access our comprehensive collection of trading calculators and analysis tools. Designed specifically for MCX traders, these tools help you make better trading decisions with precision and confidence.
              </p>
              <div className="flex gap-4">
                <Link href="/tools" className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-bold hover:shadow-lg transition-all hover:scale-105">
                  Access Tools
                </Link>
                <Link href="/dashboard" className="px-8 py-4 border-2 border-white text-white rounded-lg font-bold hover:bg-white hover:text-green-900 transition-all">
                  Dashboard
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-1">
                <div className="bg-gray-900 rounded-2xl p-8 h-80">
                  <div className="text-center flex flex-col justify-center h-full">
                    <svg className="w-24 h-24 mx-auto text-green-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <p className="text-gray-400">Trading Analysis Tools</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tools Overview */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">Essential Trading Tools</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: '🧮', title: 'Position Calculator', desc: 'Calculate optimal position size based on your risk' },
              { icon: '📊', title: 'Profit/Loss Analyzer', desc: 'Track and analyze all your trades and performance' },
              { icon: '🎯', title: 'Entry/Exit Planner', desc: 'Plan trades with exact entry and exit targets' },
              { icon: '💰', title: 'Portfolio Tracker', desc: 'Monitor your open positions in real-time' },
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

      {/* How to Use */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">How Our Tools Help You Trade Better</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-6">
              {[
                { num: '01', title: 'Faster Calculations', desc: 'Get instant calculations instead of manual spreadsheets' },
                { num: '02', title: 'Better Decisions', desc: 'Make data-driven trading decisions with accurate analysis' },
                { num: '03', title: 'Risk Management', desc: 'Protect your capital with proper position sizing tools' },
              ].map((item, i) => (
                <div key={i} className="flex gap-6">
                  <div className="text-4xl font-bold text-green-600 flex-shrink-0">{item.num}</div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-600">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Get Started in Seconds</h3>
              <p className="text-gray-700 mb-6">All tools are free for registered members. No complex setup required - just log in and start calculating. Our tools are designed for simplicity and accuracy.</p>
              <ul className="space-y-3 mb-8">
                {['Free access for all members', 'Fast and accurate calculations', 'No installation needed', 'Mobile-friendly interface'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/tools" className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-all">
                Use Tools Now →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-green-600 to-emerald-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Start Using Professional Tools Today</h2>
          <p className="text-xl text-green-100 mb-8">Get instant access to all trading calculators and analysis tools - completely free for our members.</p>
          <div className="flex gap-4 justify-center">
            <Link href="/tools" className="px-8 py-4 bg-white text-green-600 rounded-lg font-bold hover:shadow-lg transition-all hover:scale-105">
              Access Tools Now
            </Link>
            <Link href="/courses" className="px-8 py-4 border-2 border-white text-white rounded-lg font-bold hover:bg-white hover:text-green-600 transition-all">
              Learn More
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
