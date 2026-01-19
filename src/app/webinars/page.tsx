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

export default function WebinarsLandingPage() {
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
      <section className="bg-gradient-to-br from-orange-600 via-red-600 to-pink-600 text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Live Trading Webinars
            </h1>
            <p className="text-xl md:text-2xl text-gray-100 mb-8 leading-relaxed">
              Join live sessions with expert traders. Learn market analysis, trading strategies, and risk management in real-time.
            </p>
            <button className="px-8 py-4 bg-white text-orange-600 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors">
              Register Now - Free
            </button>
          </div>
        </div>
      </section>

      {/* Ad Space - Top */}
      <div className="bg-white py-8 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <ins className="adsbygoogle" style={{ display: 'block', textAlign: 'center' }} data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID} data-ad-slot="6666666666" data-ad-format="horizontal" />
          <script dangerouslySetInnerHTML={{ __html: '(adsbygoogle = window.adsbygoogle || []).push({});' }} />
        </div>
      </div>

      {/* Upcoming Webinars */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-4xl font-bold text-gray-900 mb-4 text-center">Upcoming Webinars</h2>
        <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
          Join our expert traders for live market analysis and trading strategies. All webinars are FREE and open to everyone.
        </p>

        <div className="space-y-6">
          {[1, 2, 3].map((webinar) => (
            <div key={webinar} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-orange-600 p-6 md:p-8">
              <div className="grid md:grid-cols-4 gap-6 items-center">
                <div>
                  <div className="text-orange-600 font-bold text-lg mb-2">
                    {webinar === 1 ? 'Jan 20, 2024' : webinar === 2 ? 'Jan 22, 2024' : 'Jan 25, 2024'}
                  </div>
                  <div className="text-gray-600 text-sm">
                    {webinar === 1 ? '4:00 PM IST' : webinar === 2 ? '5:30 PM IST' : '3:00 PM IST'}
                  </div>
                </div>
                <div className="md:col-span-2">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {webinar === 1 ? 'Advanced Technical Analysis for MCX Trading' : webinar === 2 ? 'Risk Management & Position Sizing' : 'Live Market Analysis Session'}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {webinar === 1 ? 'Master candlestick patterns, support & resistance, and trend analysis.' : webinar === 2 ? 'Learn how to manage risk and size positions for maximum profitability.' : 'Real-time market movements and trading opportunities analysis.'}
                  </p>
                </div>
                <div>
                  <button className="w-full px-6 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-colors">
                    Register
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Ad Space */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <ins className="adsbygoogle" style={{ display: 'block', textAlign: 'center' }} data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID} data-ad-slot="7777777777" data-ad-format="rectangle" />
            <script dangerouslySetInnerHTML={{ __html: '(adsbygoogle = window.adsbygoogle || []).push({});' }} />
          </div>
        </div>
      </div>

      {/* Why Join */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-8">
            <div className="text-4xl mb-4">🎓</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Learn from Experts</h3>
            <p className="text-gray-700">Get insights from professional traders with years of market experience.</p>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-pink-50 rounded-lg p-8">
            <div className="text-4xl mb-4">💬</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Live Q&A</h3>
            <p className="text-gray-700">Ask questions directly to traders and get personalized insights during sessions.</p>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-lg p-8">
            <div className="text-4xl mb-4">📹</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Recorded Sessions</h3>
            <p className="text-gray-700">Access recordings of all webinars if you miss the live session.</p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">What Attendees Say</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((testimonial) => (
              <div key={testimonial} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center gap-1 mb-4">
                  {'⭐⭐⭐⭐⭐'.split('').map((star, i) => <span key={i}>{star}</span>)}
                </div>
                <p className="text-gray-700 mb-4">
                  "{testimonial === 1 ? 'These webinars changed my understanding of market mechanics. Highly recommended!' : testimonial === 2 ? 'The live Q&A sessions are extremely valuable. Best free trading education.' : 'Professional trainers, practical insights, and real market examples. Worth every minute.'}"
                </p>
                <p className="text-gray-900 font-semibold">
                  {testimonial === 1 ? 'Raj Kumar' : testimonial === 2 ? 'Priya Sharma' : 'Amit Patel'}
                </p>
                <p className="text-gray-600 text-sm">Trader since {2018 + testimonial}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-orange-600 to-red-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Level Up Your Trading?</h2>
          <p className="text-lg text-gray-100 mb-8 max-w-2xl mx-auto">
            Attend webinars, join our academy courses, and become a successful trader with our comprehensive learning ecosystem.
          </p>
          <button className="px-8 py-4 bg-white text-orange-600 rounded-lg font-bold hover:bg-gray-100 transition-colors mr-4 mb-4">
            Register for Webinar
          </button>
          <button className="px-8 py-4 border-2 border-white text-white rounded-lg font-bold hover:bg-white hover:text-orange-600 transition-colors">
            View All Courses
          </button>
        </div>
      </section>

      {/* Footer Ad */}
      <div className="bg-white py-8 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <ins className="adsbygoogle" style={{ display: 'block', textAlign: 'center' }} data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID} data-ad-slot="8888888888" data-ad-format="horizontal" />
          <script dangerouslySetInnerHTML={{ __html: '(adsbygoogle = window.adsbygoogle || []).push({});' }} />
        </div>
      </div>

      {/* Minimal Footer */}
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-600">
          <p><a href="/privacy-webinars" className="text-orange-600 hover:underline">Privacy</a> • <a href="/terms-webinars" className="text-orange-600 hover:underline">Terms</a> • &copy; 2024 PremMCX</p>
        </div>
      </footer>
    </div>
  );
}
