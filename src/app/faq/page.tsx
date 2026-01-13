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
          q: "How do I enroll in a course?",
          a: "Browse our course catalog on the homepage, select a course you're interested in, and click 'Add to Cart'. Once you've added all desired courses, proceed to checkout and complete the payment process. You'll gain instant access after enrollment."
        },
        {
          q: "What are the prerequisites for your courses?",
          a: "Most beginner courses require no prior knowledge. Intermediate and advanced courses may require basic understanding of trading concepts. Each course page lists specific prerequisites in the course description."
        },
        {
          q: "Can I access courses on mobile devices?",
          a: "Yes! Our platform is fully responsive and works on all devices. You can also download our mobile app from the Google Play Store for an optimized mobile learning experience."
        },
        {
          q: "How long do I have access to a course?",
          a: "Once enrolled, you have lifetime access to all course materials, including future updates. You can learn at your own pace without any time restrictions."
        }
      ]
    },
    {
      category: "Courses & Content",
      questions: [
        {
          q: "What trading topics do you cover?",
          a: "We specialize in share and commodity market trading, with comprehensive courses on natural gas, crude oil, gold, silver, and other commodities. Our curriculum includes technical analysis, fundamental analysis, intraday price action, and risk management strategies."
        },
        {
          q: "Are the courses live or pre-recorded?",
          a: "We offer both! Most courses feature high-quality pre-recorded video lessons that you can watch anytime. We also conduct live webinars, interactive sessions, and Q&A sessions with expert instructors regularly."
        },
        {
          q: "Do you provide certificates upon completion?",
          a: "Yes, you'll receive a certificate of completion for each course you finish. These certificates demonstrate your commitment to learning and can be shared on LinkedIn or included in your professional portfolio."
        },
        {
          q: "Can I download course materials?",
          a: "Yes, most course materials including PDFs, study guides, and supplementary resources are available for download. Video lectures are streamable online to protect content integrity."
        },
        {
          q: "Do you offer offline classes?",
          a: "Yes! In addition to our online courses, we offer offline classes at our training center in Gaya, Bihar. Contact us at +91 7717756371 for offline batch schedules and availability."
        }
      ]
    },
    {
      category: "Payment & Enrollment",
      questions: [
        {
          q: "What payment methods do you accept?",
          a: "We accept all major payment methods through Razorpay including credit/debit cards, net banking, UPI, and digital wallets. All transactions are secure and encrypted."
        },
        {
          q: "Is there a refund policy?",
          a: "Yes, we offer a 7-day money-back guarantee. If you're not satisfied with a course within the first 7 days of enrollment and have completed less than 20% of the content, you can request a full refund."
        },
        {
          q: "Are there any hidden fees?",
          a: "No hidden fees! The price you see is the price you pay. All course materials, certificates, and lifetime access are included in the enrollment fee."
        },
        {
          q: "Do you offer discounts or bundle pricing?",
          a: "Yes! We regularly offer seasonal discounts, bundle deals, and special promotions. Subscribe to our newsletter or follow us on social media to stay updated on latest offers."
        },
        {
          q: "Can I pay in installments?",
          a: "Currently, we require full payment at enrollment. However, we're working on introducing EMI options for premium courses. Contact us for corporate or bulk enrollment pricing."
        }
      ]
    },
    {
      category: "Learning & Support",
      questions: [
        {
          q: "How do I track my learning progress?",
          a: "Your dashboard displays detailed progress tracking for each enrolled course, including completed lessons, quiz scores, and overall completion percentage. You can access it anytime from the 'My Courses' section."
        },
        {
          q: "Can I ask questions to instructors?",
          a: "Absolutely! Each course has a discussion forum where you can ask questions, share insights, and interact with instructors and fellow learners. Instructors typically respond within 24-48 hours."
        },
        {
          q: "What if I face technical issues?",
          a: "Our support team is available Monday to Saturday, 9 AM - 7 PM IST. Contact us via email at premmcxtrainingacademy@gmail.com or call +91 7717756371. We'll resolve your issues promptly."
        },
        {
          q: "Do you provide mentorship or one-on-one coaching?",
          a: "Yes, we offer personalized mentorship programs for serious traders. These include one-on-one sessions, portfolio reviews, and customized trading strategies. Contact us for mentorship program details and pricing."
        }
      ]
    },
    {
      category: "Account & Technical",
      questions: [
        {
          q: "How do I reset my password?",
          a: "Click on 'Forgot Password' on the login page, enter your registered email, and you'll receive password reset instructions. If you don't receive the email, check your spam folder or contact support."
        },
        {
          q: "Can I change my registered email address?",
          a: "Yes, you can update your email address from your account settings. For security reasons, you'll need to verify both your old and new email addresses."
        },
        {
          q: "What are the system requirements?",
          a: "Our platform works on any modern web browser (Chrome, Firefox, Safari, Edge) with a stable internet connection. For best video streaming experience, we recommend at least 2 Mbps internet speed."
        },
        {
          q: "Is my personal information secure?",
          a: "Yes, we take data security very seriously. All personal information is encrypted and stored securely. We never share your data with third parties without your consent. Read our Privacy Policy for complete details."
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
