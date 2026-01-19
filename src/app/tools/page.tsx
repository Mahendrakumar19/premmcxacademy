"use client";
import React, { useEffect } from 'react';
import Script from 'next/script';
import Navbar from "@/components/Navbar";

declare global {
  interface Window {
    adsbygoogle?: any;
    fbq?: any;
  }
}

export default function ToolsLandingPage() {
  useEffect(() => {
    // Initialize Google AdSense
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({
        google_ad_client: process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID,
        enable_page_level_ads: true,
      });
    } catch (error) {
      console.error('Error initializing AdSense:', error);
    }

    // Track Meta Pixel PageView (only if fbq is loaded)
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'PageView');
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Meta Pixel Script */}
      {process.env.NEXT_PUBLIC_META_PIXEL_ID && (
        <>
          <Script
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${process.env.NEXT_PUBLIC_META_PIXEL_ID}');
                fbq('track', 'PageView');
              `,
            }}
          />
        </>
      )}
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-600 via-emerald-600 to-teal-500 text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Advanced Trading Tools
            </h1>
            <p className="text-xl md:text-2xl text-gray-100 mb-8 leading-relaxed">
              Access powerful calculators, chart tools, and analysis software to enhance your trading decisions.
            </p>
            <button className="px-8 py-4 bg-white text-green-600 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors">
              Try Free Tools Now
            </button>
          </div>
        </div>
      </section>

      {/* Ad Space - Top */}
      <div className="bg-white py-8 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <ins className="adsbygoogle" style={{ display: 'block', textAlign: 'center' }} data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID} data-ad-slot="2222222222" data-ad-format="horizontal" />
          <script dangerouslySetInnerHTML={{ __html: '(adsbygoogle = window.adsbygoogle || []).push({});' }} />
        </div>
      </div>

      {/* Tools Grid */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">Essential Trading Tools</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { name: 'Position Size Calculator', icon: '📊', desc: 'Calculate optimal position sizes based on risk' },
            { name: 'Pivot Point Calculator', icon: '🎯', desc: 'Find support and resistance levels' },
            { name: 'Lot Size Calculator', icon: '📈', desc: 'Determine appropriate lot sizes' },
            { name: 'Risk/Reward Ratio', icon: '⚡', desc: 'Analyze risk-reward scenarios' },
            { name: 'Profit/Loss Calculator', icon: '💰', desc: 'Compute P&L for trades' },
            { name: 'Technical Indicators', icon: '📉', desc: 'Pre-built indicator analysis' },
          ].map((tool, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6">
              <div className="text-4xl mb-4">{tool.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{tool.name}</h3>
              <p className="text-gray-600 mb-4">{tool.desc}</p>
              <button className="text-green-600 font-semibold hover:text-green-700">
                Use Tool →
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Sidebar Ad Space */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <ins className="adsbygoogle" style={{ display: 'block', textAlign: 'center' }} data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID} data-ad-slot="3333333333" data-ad-format="rectangle" />
            <script dangerouslySetInnerHTML={{ __html: '(adsbygoogle = window.adsbygoogle || []).push({});' }} />
          </div>
        </div>
      </div>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-8 md:p-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Why Use Our Tools?</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex gap-4">
              <span className="text-2xl">✓</span>
              <div>
                <h4 className="font-bold text-gray-900 mb-2">Accurate Calculations</h4>
                <p className="text-gray-700">Real-time calculations with precision</p>
              </div>
            </div>
            <div className="flex gap-4">
              <span className="text-2xl">✓</span>
              <div>
                <h4 className="font-bold text-gray-900 mb-2">Free Access</h4>
                <p className="text-gray-700">All tools available for free to users</p>
              </div>
            </div>
            <div className="flex gap-4">
              <span className="text-2xl">✓</span>
              <div>
                <h4 className="font-bold text-gray-900 mb-2">User-Friendly</h4>
                <p className="text-gray-700">Simple interfaces for quick analysis</p>
              </div>
            </div>
            <div className="flex gap-4">
              <span className="text-2xl">✓</span>
              <div>
                <h4 className="font-bold text-gray-900 mb-2">Mobile Ready</h4>
                <p className="text-gray-700">Access tools on any device, anytime</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Master Trading with Our Premium Course</h2>
          <p className="text-lg text-gray-100 mb-8 max-w-2xl mx-auto">
            Combine tools with expert guidance. Enroll in our comprehensive trading course today.
          </p>
          <button className="px-8 py-4 bg-white text-green-600 rounded-lg font-bold hover:bg-gray-100 transition-colors">
            View Courses
          </button>
        </div>
      </section>

      {/* Footer Ad */}
      <div className="bg-white py-8 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <ins className="adsbygoogle" style={{ display: 'block', textAlign: 'center' }} data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID} data-ad-slot="4444444444" data-ad-format="horizontal" />
          <script dangerouslySetInnerHTML={{ __html: '(adsbygoogle = window.adsbygoogle || []).push({});' }} />
        </div>
      </div>

      {/* Minimal Footer */}
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-600">
          <p><a href="/privacy-tools" className="text-green-600 hover:underline">Privacy</a> • <a href="/terms-tools" className="text-green-600 hover:underline">Terms</a> • &copy; 2024 PremMCX</p>
        </div>
      </footer>
    </div>
  );
}
