'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useRouter } from 'next/navigation';

export default function DemoBookingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<'type' | 'form'>('type');
  const [demoType, setDemoType] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    tradingExperience: 'beginner',
    interestedIn: 'all',
    message: '',
  });

  const demoOptions = [
    {
      id: 'call',
      title: 'Live Demo Call',
      description: '30-minute one-on-one consultation with trading experts',
      icon: '📞',
    },
    {
      id: 'trading',
      title: 'Live Trading Session',
      description: 'Real-time market trading with live strategy demonstration',
      icon: '💻',
    },
    {
      id: 'courses',
      title: 'Course Feedback',
      description: 'Personalized course recommendations based on your goals',
      icon: '📚',
    },
  ];

  const handleSelectDemo = (type: string) => {
    setDemoType(type);
    setCurrentStep('form');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Here you would typically send the data to your backend
      console.log('Demo Booking Data:', {
        demoType,
        ...formData,
      });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setSubmitted(true);

      // Redirect after 3 seconds
      setTimeout(() => {
        router.push('/');
      }, 3000);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="text-center max-w-md">
            <div className="mb-6">
              <svg className="w-20 h-20 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Success!</h2>
            <p className="text-xl text-gray-600 mb-6">
              Thank you for booking a demo session. Our team will contact you shortly to confirm your appointment.
            </p>
            <p className="text-sm text-gray-500">Redirecting you to home page...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Step 1: Demo Type Selection */}
        {currentStep === 'type' && (
          <div>
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Book Your Free Demo</h1>
              <p className="text-xl text-gray-600">Choose the type of demo session that works best for you</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {demoOptions.map((option) => (
                <div
                  key={option.id}
                  onClick={() => handleSelectDemo(option.id)}
                  className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer border-2 border-transparent hover:border-indigo-600"
                >
                  <div className="text-5xl mb-4">{option.icon}</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{option.title}</h3>
                  <p className="text-gray-600 mb-6">{option.description}</p>
                  <button className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors duration-200">
                    Select
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Demo Booking Form */}
        {currentStep === 'form' && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                {demoOptions.find((opt) => opt.id === demoType)?.title}
              </h1>
              <button
                onClick={() => {
                  setCurrentStep('type');
                  setDemoType('');
                }}
                className="px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg font-semibold transition-colors"
              >
                ← Change Type
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 border border-gray-100">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Full Name */}
                <div>
                  <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    placeholder="John Doe"
                    disabled={loading}
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    placeholder="john@example.com"
                    disabled={loading}
                  />
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    placeholder="+91 XXXXX XXXXX"
                    disabled={loading}
                  />
                </div>

                {/* Trading Experience */}
                <div>
                  <label htmlFor="tradingExperience" className="block text-sm font-semibold text-gray-700 mb-2">
                    Trading Experience *
                  </label>
                  <select
                    id="tradingExperience"
                    name="tradingExperience"
                    value={formData.tradingExperience}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    disabled={loading}
                  >
                    <option value="beginner">Beginner (No trading experience)</option>
                    <option value="intermediate">Intermediate (1-2 years experience)</option>
                    <option value="advanced">Advanced (2+ years experience)</option>
                  </select>
                </div>

                {/* Interested In */}
                <div>
                  <label htmlFor="interestedIn" className="block text-sm font-semibold text-gray-700 mb-2">
                    Interested In *
                  </label>
                  <select
                    id="interestedIn"
                    name="interestedIn"
                    value={formData.interestedIn}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    disabled={loading}
                  >
                    <option value="all">All Trading Types</option>
                    <option value="stocks">Stock Trading</option>
                    <option value="indices">Index Trading (NIFTY, BANKNIFTY)</option>
                    <option value="mcx">MCX (Commodities)</option>
                    <option value="forex">Forex Trading</option>
                    <option value="options">Options Trading</option>
                  </select>
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                    Additional Questions
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none"
                    placeholder="Tell us anything you'd like us to know..."
                    disabled={loading}
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Booking Your Demo...
                    </>
                  ) : (
                    'Book My Free Demo'
                  )}
                </button>

                {/* Terms */}
                <p className="text-xs text-gray-500 text-center">
                  By submitting, you agree to our{' '}
                  <Link href="/terms" className="text-indigo-600 hover:underline">
                    Terms
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-indigo-600 hover:underline">
                    Privacy Policy
                  </Link>
                </p>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
