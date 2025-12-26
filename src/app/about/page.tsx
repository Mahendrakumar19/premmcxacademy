"use client";
import React from "react";
import Navbar from "@/components/Navbar";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="relative">
        <main className="relative mx-auto max-w-6xl px-6 py-12">
          {/* Hero Section */}
          <section className="mb-16 text-center">
            <h1 className="mb-4 text-5xl font-bold text-gray-900">
              About <span className="text-orange-500">Prem MCMX</span>
            </h1>
            <p className="mx-auto max-w-3xl text-lg text-gray-600">
              India's premier MCX commodity trading academy, empowering traders with professional strategies and live market analysis since 2020.
            </p>
          </section>

          {/* Stats */}
          <section className="mb-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { number: "5000+", label: "Active Students" },
              { number: "50+", label: "Expert Courses" },
              { number: "95%", label: "Success Rate" },
              { number: "24/7", label: "Support Available" }
            ].map((stat, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow-md p-6 text-center border border-gray-100">
                <div className="mb-2 text-4xl font-bold text-orange-500">
                  {stat.number}
                </div>
                <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                  {stat.label}
                </div>
              </div>
            ))}
          </section>

          {/* Mission */}
          <section className="mb-16 bg-white rounded-2xl shadow-md p-10 border border-gray-100">
            <h2 className="mb-6 text-3xl font-bold text-gray-900">Our Mission</h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-4">
              At Prem MCMX Trading Academy, we believe that financial education is the key to wealth creation. Our mission is to democratize access to professional trading knowledge and empower individuals to achieve financial independence through smart, disciplined MCX commodity trading.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              We combine cutting-edge market analysis, time-tested strategies, and personalized mentorship to help our students develop the skills and confidence needed to succeed in the commodity markets.
            </p>
          </section>

          {/* What We Offer */}
          <section className="mb-16">
            <h2 className="mb-8 text-3xl font-bold text-gray-900 text-center">What We Offer</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: "📚",
                  title: "Comprehensive Courses",
                  description: "From basics to advanced strategies, our structured curriculum covers everything you need to master MCX trading."
                },
                {
                  icon: "👨‍🏫",
                  title: "Expert Mentorship",
                  description: "Learn directly from seasoned traders with years of real market experience and proven track records."
                },
                {
                  icon: "📊",
                  title: "Live Market Analysis",
                  description: "Daily live sessions analyzing real-time market conditions, helping you understand market dynamics."
                },
                {
                  icon: "💡",
                  title: "Proven Strategies",
                  description: "Access to time-tested trading strategies for scalping, swing trading, and position trading."
                },
                {
                  icon: "🤝",
                  title: "Community Support",
                  description: "Join a vibrant community of traders, share insights, and learn from collective experiences."
                },
                {
                  icon: "🎯",
                  title: "Lifetime Access",
                  description: "All course materials, recordings, and updates are yours forever with no recurring fees."
                }
              ].map((item, idx) => (
                <div key={idx} className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
                  <div className="mb-4 text-4xl">{item.icon}</div>
                  <h3 className="mb-3 text-xl font-bold text-gray-900">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Why Choose Us */}
          <section className="mb-16 bg-orange-50 rounded-2xl p-10 border border-orange-100">
            <h2 className="mb-8 text-3xl font-bold text-gray-900 text-center">Why Choose Prem MCX?</h2>
            <div className="space-y-4">
              {[
                "✓ Industry-leading instructors with 10+ years of trading experience",
                "✓ Real-time market analysis and trade alerts",
                "✓ Personalized attention in small batch sizes",
                "✓ 30-day money-back guarantee on all courses",
                "✓ Flexible learning schedules for working professionals",
                "✓ Practical, hands-on approach with live trading examples",
                "✓ Continuous support even after course completion",
                "✓ Regular market updates and strategy workshops"
              ].map((point, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <span className="text-green-500 text-xl font-bold">✓</span>
                  <span className="text-gray-700 text-lg">{point.substring(2)}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Contact CTA */}
          <section className="bg-white rounded-2xl shadow-md p-12 text-center border border-gray-100">
            <h2 className="mb-4 text-3xl font-bold text-gray-900">Ready to Start Your Trading Journey?</h2>
            <p className="mb-8 text-lg text-gray-600">
              Join thousands of successful traders who transformed their financial future with Prem MCMX Academy.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <button className="rounded-lg bg-orange-500 hover:bg-orange-600 px-8 py-4 text-lg font-semibold text-white transition-all shadow-md">
                Browse Courses
              </button>
              <button className="rounded-lg bg-gray-50 border-2 border-gray-200 px-8 py-4 text-lg font-semibold text-gray-700 transition-all hover:bg-gray-100">
                Contact Us
              </button>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
