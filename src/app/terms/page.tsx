export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">Terms of Service</h1>
            <p className="text-xl text-indigo-100 max-w-3xl mx-auto">
              Last Updated: December 30, 2025
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 space-y-8">
          
          {/* Introduction */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Agreement to Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              Welcome to PremMCX Training Academy. These Terms of Service ("Terms") govern your access to and use of our learning management system, website, mobile applications, and all related services (collectively, the "Platform"). By accessing or using our Platform, you agree to be bound by these Terms and our Privacy Policy.
            </p>
            <p className="text-gray-700 leading-relaxed mt-4">
              If you do not agree to these Terms, you may not access or use our Platform. We reserve the right to modify these Terms at any time. Continued use of the Platform after changes are posted constitutes acceptance of the modified Terms.
            </p>
          </section>

          {/* Eligibility */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Eligibility</h2>
            <p className="text-gray-700 mb-3">To use our Platform, you must:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Be at least 18 years old or have parental/guardian consent if you are between 13-18 years old</li>
              <li>Provide accurate, current, and complete information during registration</li>
              <li>Maintain the security of your account credentials</li>
              <li>Not use the Platform for any illegal or unauthorized purpose</li>
              <li>Comply with all applicable local, state, national, and international laws</li>
            </ul>
            <p className="text-gray-700 mt-4">
              We reserve the right to refuse service, terminate accounts, or cancel orders at our sole discretion.
            </p>
          </section>

          {/* Account Registration */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Account Registration and Security</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Account Creation</h3>
            <p className="text-gray-700">
              You must create an account to access most features of our Platform. You agree to provide accurate and complete information and to update this information as necessary to maintain its accuracy.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Account Security</h3>
            <p className="text-gray-700 mb-3">You are responsible for:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Maintaining the confidentiality of your password and account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorized access or security breach</li>
              <li>Logging out from your account at the end of each session</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Account Termination</h3>
            <p className="text-gray-700">
              We reserve the right to suspend or terminate your account if you violate these Terms, engage in fraudulent activity, or for any other reason at our sole discretion. You may delete your account at any time through your account settings.
            </p>
          </section>

          {/* Course Enrollment and Access */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Course Enrollment and Access</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Course Purchase</h3>
            <p className="text-gray-700 mb-3">
              When you enroll in a course, you agree to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Pay the full course fee at the time of enrollment (unless otherwise specified)</li>
              <li>Provide accurate payment information</li>
              <li>Accept that course prices may change, but enrolled students will not be affected</li>
              <li>Understand that some courses may have prerequisites or eligibility requirements</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Lifetime Access</h3>
            <p className="text-gray-700">
              Once enrolled, you receive lifetime access to course content, including future updates. However, this access is contingent upon:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>The Platform remaining operational</li>
              <li>Compliance with these Terms</li>
              <li>The course not being discontinued due to legal or technical reasons</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Course Content Changes</h3>
            <p className="text-gray-700">
              We reserve the right to modify, update, or discontinue course content at any time. While we strive to maintain and improve content, we do not guarantee that all courses will remain available indefinitely.
            </p>
          </section>

          {/* Payment and Refunds */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Payment Terms and Refund Policy</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Payment Processing</h3>
            <p className="text-gray-700 mb-3">
              All payments are processed securely through Razorpay. We accept:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Credit and debit cards (Visa, Mastercard, American Express, RuPay)</li>
              <li>Net banking</li>
              <li>UPI (Google Pay, PhonePe, Paytm, etc.)</li>
              <li>Digital wallets</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Pricing</h3>
            <p className="text-gray-700">
              All prices are listed in Indian Rupees (INR) unless otherwise specified. Prices include applicable taxes. We reserve the right to change prices at any time without prior notice.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Refund Policy</h3>
            <p className="text-gray-700 mb-3">
              We offer a 7-day money-back guarantee under the following conditions:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Refund request made within 7 days of purchase</li>
              <li>Less than 20% of course content has been accessed</li>
              <li>No certificates have been issued for the course</li>
              <li>Request submitted through our official support channels</li>
            </ul>
            <p className="text-gray-700 mt-4">
              Refunds are processed within 5-10 business days to the original payment method. Processing fees may apply. Refunds are not available for live sessions, mentorship programs, or discounted bundle purchases.
            </p>
          </section>

          {/* User Conduct */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">User Conduct and Prohibited Activities</h2>
            <p className="text-gray-700 mb-3">You agree NOT to:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Share your account credentials with others</li>
              <li>Download, copy, reproduce, or distribute course content without authorization</li>
              <li>Use automated systems (bots, scrapers) to access the Platform</li>
              <li>Circumvent any security or access control mechanisms</li>
              <li>Upload viruses, malware, or other malicious code</li>
              <li>Harass, abuse, or harm other users or instructors</li>
              <li>Post spam, advertising, or promotional content in discussion forums</li>
              <li>Impersonate any person or entity</li>
              <li>Engage in any fraudulent activity</li>
              <li>Use the Platform for any illegal purpose</li>
              <li>Reverse engineer, decompile, or disassemble any part of the Platform</li>
              <li>Record or redistribute live sessions without explicit permission</li>
            </ul>
            <p className="text-gray-700 mt-4">
              Violation of these terms may result in immediate account termination without refund and potential legal action.
            </p>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Intellectual Property Rights</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Our Content</h3>
            <p className="text-gray-700">
              All content on the Platform, including but not limited to text, graphics, logos, videos, audio, software, course materials, and trademarks, is the property of PremMCX Training Academy or its licensors and is protected by Indian and international copyright, trademark, and other intellectual property laws.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Limited License</h3>
            <p className="text-gray-700 mb-3">
              We grant you a limited, non-exclusive, non-transferable, revocable license to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Access and view course content for personal, non-commercial educational purposes</li>
              <li>Download materials explicitly marked as downloadable</li>
              <li>Print materials for personal study (where applicable)</li>
            </ul>
            <p className="text-gray-700 mt-4">
              You may NOT sell, redistribute, republish, or create derivative works from our content without explicit written permission.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">User-Generated Content</h3>
            <p className="text-gray-700">
              By posting content (comments, questions, assignments) on the Platform, you grant us a worldwide, perpetual, royalty-free license to use, modify, publicly display, and distribute such content for educational and promotional purposes.
            </p>
          </section>

          {/* Disclaimers */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Disclaimers and Warranties</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3">No Trading Guarantee</h3>
            <p className="text-gray-700">
              <strong className="text-gray-900">IMPORTANT:</strong> Our courses provide educational content about trading and investing. We do NOT guarantee profits, trading success, or specific financial outcomes. Trading in commodities and securities involves substantial risk of loss. Past performance is not indicative of future results.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">"As Is" Basis</h3>
            <p className="text-gray-700">
              The Platform and all content are provided "AS IS" and "AS AVAILABLE" without warranties of any kind, either express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">No Professional Advice</h3>
            <p className="text-gray-700">
              Content on our Platform is for educational purposes only and should not be construed as professional financial, investment, legal, or tax advice. Always consult with qualified professionals before making financial decisions.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Platform Availability</h3>
            <p className="text-gray-700">
              We do not guarantee that the Platform will be available 100% of the time. We may experience downtime for maintenance, updates, or technical issues. We are not liable for any loss or damage resulting from Platform unavailability.
            </p>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Limitation of Liability</h2>
            <p className="text-gray-700">
              To the fullest extent permitted by law, PremMCX Training Academy, its directors, employees, instructors, and affiliates shall NOT be liable for any:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mt-3">
              <li>Indirect, incidental, special, consequential, or punitive damages</li>
              <li>Loss of profits, revenue, data, or business opportunities</li>
              <li>Trading losses or investment decisions made based on course content</li>
              <li>Errors, mistakes, or inaccuracies in content</li>
              <li>Unauthorized access to your account or personal information</li>
              <li>Interruption or cessation of Platform services</li>
              <li>Third-party conduct or content</li>
            </ul>
            <p className="text-gray-700 mt-4">
              Our total liability shall not exceed the amount you paid for the specific course or service in question, or ₹10,000 INR, whichever is less.
            </p>
          </section>

          {/* Indemnification */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Indemnification</h2>
            <p className="text-gray-700">
              You agree to indemnify, defend, and hold harmless PremMCX Training Academy, its officers, directors, employees, instructors, and agents from any claims, damages, liabilities, costs, and expenses (including reasonable attorneys' fees) arising from:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mt-3">
              <li>Your violation of these Terms</li>
              <li>Your use or misuse of the Platform</li>
              <li>Your violation of any third-party rights</li>
              <li>Trading decisions or financial losses incurred</li>
              <li>Any content you post or submit</li>
            </ul>
          </section>

          {/* Dispute Resolution */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Dispute Resolution and Governing Law</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Governing Law</h3>
            <p className="text-gray-700">
              These Terms shall be governed by and construed in accordance with the laws of India, without regard to conflict of law principles.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Jurisdiction</h3>
            <p className="text-gray-700">
              You agree that any legal action or proceeding arising out of or relating to these Terms or the Platform shall be instituted exclusively in the courts located in Gaya, Bihar, India. You consent to the jurisdiction of such courts and waive any objection to venue.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Informal Resolution</h3>
            <p className="text-gray-700">
              Before filing any formal legal action, you agree to first contact us at contact@premmcxtraining.com to attempt to resolve the dispute informally. Most disputes can be resolved through communication.
            </p>
          </section>

          {/* Changes to Terms */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Modifications to Terms</h2>
            <p className="text-gray-700">
              We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting to the Platform. We will notify users of material changes via email or Platform notification. Your continued use of the Platform after changes are posted constitutes acceptance of the modified Terms.
            </p>
            <p className="text-gray-700 mt-4">
              We recommend reviewing these Terms periodically. The "Last Updated" date at the top indicates when these Terms were last revised.
            </p>
          </section>

          {/* Miscellaneous */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Miscellaneous Provisions</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Entire Agreement</h3>
            <p className="text-gray-700">
              These Terms, together with our Privacy Policy and any other legal notices published on the Platform, constitute the entire agreement between you and PremMCX Training Academy.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Severability</h3>
            <p className="text-gray-700">
              If any provision of these Terms is found to be unlawful, void, or unenforceable, that provision shall be deemed severable and shall not affect the validity and enforceability of the remaining provisions.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Waiver</h3>
            <p className="text-gray-700">
              Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Assignment</h3>
            <p className="text-gray-700">
              You may not assign or transfer these Terms or your account without our prior written consent. We may assign these Terms without restriction.
            </p>
          </section>

          {/* Contact */}
          <section className="border-t border-gray-200 pt-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Contact Information</h2>
            <p className="text-gray-700 mb-6">
              If you have questions about these Terms of Service, please contact us:
            </p>
            
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 space-y-3">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <div>
                  <p className="font-semibold text-gray-900">PremMCX Training Academy</p>
                  <p className="text-gray-700">70/20, 3rd Floor, Swarajpuri Road</p>
                  <p className="text-gray-700">Near K.L Gupta Showroom, Manpur</p>
                  <p className="text-gray-700">Gaya, Bihar - 823003, India</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a href="mailto:contact@premmcxtraining.com" className="text-indigo-600 hover:text-indigo-700 font-semibold">
                  contact@premmcxtraining.com
                </a>
              </div>
              
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <a href="tel:+917717756371" className="text-indigo-600 hover:text-indigo-700 font-semibold">
                  +91 7717756371
                </a>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
