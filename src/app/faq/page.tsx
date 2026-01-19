'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      category: "Getting Started",
      questions: [
        {
          q: "How do I enroll in Prem MCX courses?",
          a: "Browse our MCX and forex trading courses on the homepage, select the courses you're interested in, add them to your cart, and proceed to checkout. You'll get instant access after payment via Razorpay."
        },
        {
          q: "What are the prerequisites for MCX trading courses?",
          a: "Our beginner courses on intraday trading, option chains, and commodity trading require no prior knowledge. Advanced courses require basic understanding of trading concepts. We cover everything from basics to advanced strategies."
        },
        {
          q: "Can I access courses on mobile devices?",
          a: "Yes! Our platform is fully responsive and works on all devices. You can learn MCX and forex trading on the go with full access to videos, notes, and live sessions."
        },
        {
          q: "How long do I have access to courses?",
          a: "Once enrolled, you have lifetime access to all course materials including 500+ hours of content. Learn at your own pace with no time restrictions and access all future updates."
        }
      ]
    },
    {
      category: "MCX & Trading Courses",
      questions: [
        {
          q: "What trading topics do you specialize in?",
          a: "We specialize in Equity, Index, MCX & Forex trading with expert guidance on intraday price action, option chain strategies, technical analysis, NIFTY/BANKNIFTY, Stock Options, Gold, Silver, Crude Oil, and Cryptocurrency trading."
        },
        {
          q: "Do you teach option trading and option chains?",
          a: "Yes! Our comprehensive option chain courses cover option buying, selling, spreads, Greeks, and advanced strategies for NIFTY and BANKNIFTY. We teach both theory and practical application."
        },
        {
          q: "Are courses live or pre-recorded?",
          a: "We offer both! Pre-recorded video lessons (500+ hours) for flexible learning plus daily live market analysis sessions, webinars, and interactive Q&A with our 3+ expert instructors."
        },
        {
          q: "Do you teach astrology-based trading?",
          a: "Yes, we offer unique courses combining astrological analysis with technical analysis and price action for enhanced market timing and trading decisions."
        },
        {
          q: "Do you provide trading certificates?",
          a: "Yes, you'll receive completion certificates for each course. These showcase your trading education and can be shared on LinkedIn or professional portfolios."
        }
      ]
    },
    {
      category: "Payment & Enrollment",
      questions: [
        {
          q: "What payment methods do you accept?",
          a: "We accept all major payment methods through Razorpay including credit/debit cards, net banking, UPI, and digital wallets. All transactions are secure and encrypted with 18% GST included."
        },
        {
          q: "Is there a refund policy?",
          a: "Yes, we offer a 30-day money-back guarantee on all courses. If you're not satisfied within 30 days of enrollment, you can request a full refund with no questions asked."
        },
        {
          q: "Are there any hidden fees?",
          a: "No hidden fees! The price shown includes the course, all materials, lifetime access, and certificates. GST (9% SGST + 9% CGST) is transparently shown at checkout."
        },
        {
          q: "Do you offer discounts or bundle pricing?",
          a: "Yes! We regularly offer seasonal discounts, bundle deals on multiple courses, and special promotions. Subscribe to our newsletter for latest offers."
        },
        {
          q: "Do you offer bulk or corporate training?",
          a: "Yes, we offer corporate training programs and bulk enrollment discounts for institutions and trading groups. Contact us at +91 7717756371 for corporate pricing."
        }
      ]
    },
    {
      category: "Learning & Support",
      questions: [
        {
          q: "How do I track my learning progress?",
          a: "Your dashboard displays detailed progress for each course including completed lessons, quiz scores, and completion percentage. Access it anytime from 'My Courses'."
        },
        {
          q: "Can I ask questions to instructors?",
          a: "Yes! Each course has discussion forums where you ask questions, share trades, and interact with instructors and 32,500+ fellow traders. Instructors respond within 24 hours."
        },
        {
          q: "Do you offer live trading sessions?",
          a: "Yes! We conduct daily live market analysis sessions on NIFTY, BANKNIFTY, commodities, and forex. These include real-time price action analysis and trade setups."
        },
        {
          q: "What is your customer support availability?",
          a: "Our support team is available Monday to Saturday, 9 AM - 7 PM IST. Contact us via email at premmcxtrainingacademy@gmail.com or call +91 7717756371."
        },
        {
          q: "Do you offer mentorship?",
          a: "Yes! We offer personalized 1-on-1 mentorship for serious traders including portfolio review, customized strategies, and trade guidance. Contact us for mentorship details."
        }
      ]
    },
    {
      category: "Account & Technical",
      questions: [
        {
          q: "How do I reset my password?",
          a: "Click 'Forgot Password' on login, enter your email, and follow the reset instructions. Check spam folder if you don't receive the email."
        },
        {
          q: "Can I update my account details?",
          a: "Yes, update your email, phone, and other details from account settings. For security, you may need to verify changes."
        },
        {
          q: "What are the system requirements?",
          a: "Works on any modern browser (Chrome, Firefox, Safari, Edge) with stable internet. For video streaming, we recommend 2+ Mbps internet speed."
        },
        {
          q: "Is my data and payment information secure?",
          a: "Yes, all data is encrypted and secured. Payments go through Razorpay's secure gateway. We never share data with third parties without consent. Read our Privacy Policy."
        }
      ]
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Navbar />
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-indigo-100 max-w-3xl mx-auto">
              Find answers to common questions about our courses, enrollment process, payment methods, and more.
            </p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-4xl mx-auto px-4 -mt-8">
        <div className="bg-white rounded-2xl shadow-xl p-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for answers..."
              className="w-full px-6 py-4 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none pl-12"
            />
            <svg
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* FAQ Content */}
      <div className="max-w-5xl mx-auto px-4 py-16">
        {faqs.map((category, categoryIndex) => (
          <div key={categoryIndex} className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 text-white rounded-lg flex items-center justify-center text-lg font-bold">
                {categoryIndex + 1}
              </span>
              {category.category}
            </h2>
            
            <div className="space-y-4">
              {category.questions.map((faq, faqIndex) => {
                const globalIndex = faqs.slice(0, categoryIndex).reduce((acc, cat) => acc + cat.questions.length, 0) + faqIndex;
                const isOpen = openIndex === globalIndex;
                
                return (
                  <div
                    key={faqIndex}
                    className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden transition-all hover:shadow-lg"
                  >
                    <button
                      onClick={() => toggleFAQ(globalIndex)}
                      className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-lg font-semibold text-gray-900 pr-8">
                        {faq.q}
                      </span>
                      <svg
                        className={`w-6 h-6 text-indigo-600 transform transition-transform flex-shrink-0 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {isOpen && (
                      <div className="px-6 pb-5 pt-2">
                        <p className="text-gray-600 leading-relaxed">
                          {faq.a}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Still Have Questions */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Still Have Questions?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Can't find what you're looking for? Our support team is here to help!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="px-8 py-4 bg-white text-indigo-600 rounded-xl font-semibold hover:bg-gray-50 transition-colors shadow-lg"
            >
              Contact Support
            </a>
            <a
              href="tel:+917717756371"
              className="px-8 py-4 bg-indigo-700 text-white rounded-xl font-semibold hover:bg-indigo-800 transition-colors shadow-lg"
            >
              Call Us: +91 7717756371
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
