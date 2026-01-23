import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function Homepage01() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-black pt-20 pb-32 px-6">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div className="absolute -bottom-8 left-20 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Master <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">MCX Trading</span> Fundamentals
              </h1>
              <p className="text-xl text-gray-300 mb-8">
                Learn professional MCX trading with Prem MCX Training Academy. Our comprehensive courses cover everything from market basics to advanced trading strategies used by successful traders.
              </p>
              <div className="flex gap-4">
                <Link href="/courses" className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-bold hover:shadow-lg transition-all hover:scale-105">
                  View Our Courses
                </Link>
                <Link href="/about" className="px-8 py-4 border-2 border-white text-white rounded-lg font-bold hover:bg-white hover:text-indigo-900 transition-all">
                  About Academy
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-1">
                <div className="bg-gray-900 rounded-2xl p-8 h-80">
                  <div className="text-center flex flex-col justify-center h-full">
                    <svg className="w-24 h-24 mx-auto text-indigo-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12a1 1 0 100-2 1 1 0 000 2z" />
                    </svg>
                    <p className="text-gray-400">Structured MCX Training Program</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">What Our Courses Cover</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: '📊', title: 'MCX Basics', desc: 'Understanding MCX market structure and trading fundamentals' },
              { icon: '💡', title: 'Trading Strategies', desc: 'Proven strategies for commodities and futures trading' },
              { icon: '📈', title: 'Technical Analysis', desc: 'Chart patterns, indicators, and price action analysis' },
              { icon: '🎯', title: 'Risk Management', desc: 'Position sizing, stop losses, and capital preservation' },
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

      {/* Courses Overview */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">Our Training Courses</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Live Trading Sessions</h3>
              <p className="text-gray-700 mb-6">Join our live trading sessions where expert traders demonstrate real-time trading strategies and market analysis. Get instant feedback and learn directly from experienced professionals.</p>
              <Link href="/live-classes" className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-all">
                Join Live Classes →
              </Link>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Self-Paced Learning</h3>
              <p className="text-gray-700 mb-6">Access structured video courses that you can complete at your own pace. Each course includes practical examples, real market scenarios, and actionable trading techniques.</p>
              <Link href="/courses" className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition-all">
                Browse Courses →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">Why Choose Prem MCX Academy?</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { num: '01', title: 'Expert Instructors', desc: 'Learn from experienced MCX traders with real market experience' },
              { num: '02', title: 'Affordable Pricing', desc: 'Quality education at competitive prices with flexible payment options' },
              { num: '03', title: 'Lifetime Access', desc: 'Access all course materials forever, with regular updates' },
              { num: '04', title: 'Live Support', desc: 'Get help through live classes, webinars, and direct mentoring' },
              { num: '05', title: 'Practical Focus', desc: 'Real-world examples and live trading demonstrations' },
              { num: '06', title: 'Certificate Program', desc: 'Receive certificate of completion for each course' },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-xl p-8 shadow-md hover:shadow-xl transition-all">
                <div className="text-3xl font-bold text-indigo-600 mb-3">{item.num}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Start Your Trading Journey Today</h2>
          <p className="text-xl text-indigo-100 mb-8">Join hundreds of students who have transformed their trading skills with Prem MCX Training Academy</p>
          <div className="flex gap-4 justify-center">
            <Link href="/courses" className="px-8 py-4 bg-white text-indigo-600 rounded-lg font-bold hover:shadow-lg transition-all hover:scale-105">
              Explore Courses
            </Link>
            <Link href="/live-classes" className="px-8 py-4 border-2 border-white text-white rounded-lg font-bold hover:bg-white hover:text-indigo-600 transition-all">
              Join Live Class
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
