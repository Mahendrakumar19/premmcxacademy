export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">Privacy Policy</h1>
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
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Introduction</h2>
            <p className="text-gray-700 leading-relaxed">
              Welcome to PremMCX Training Academy. We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our learning management system, website, and mobile applications (collectively, the "Platform").
            </p>
            <p className="text-gray-700 leading-relaxed mt-4">
              By accessing or using our Platform, you agree to the terms outlined in this Privacy Policy. If you do not agree with our policies and practices, please do not use our Platform.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Information We Collect</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Personal Information</h3>
            <p className="text-gray-700 mb-3">We collect personal information that you voluntarily provide when you:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Register for an account</li>
              <li>Enroll in courses</li>
              <li>Make purchases</li>
              <li>Contact customer support</li>
              <li>Subscribe to newsletters or marketing communications</li>
              <li>Participate in surveys or promotions</li>
            </ul>
            <p className="text-gray-700 mt-4">This information may include:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Full name</li>
              <li>Email address</li>
              <li>Phone number</li>
              <li>Mailing address</li>
              <li>Payment information (processed securely through Razorpay)</li>
              <li>Educational background and interests</li>
              <li>Profile photo (optional)</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Usage and Learning Data</h3>
            <p className="text-gray-700 mb-3">We automatically collect certain information when you use our Platform:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Course enrollment and completion data</li>
              <li>Video viewing progress and timestamps</li>
              <li>Quiz and assignment scores</li>
              <li>Discussion forum posts and comments</li>
              <li>Learning paths and preferences</li>
              <li>Time spent on different sections of the Platform</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Technical Information</h3>
            <p className="text-gray-700 mb-3">We collect technical data about your device and browsing activity:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>IP address and geolocation data</li>
              <li>Browser type and version</li>
              <li>Device type, operating system, and screen resolution</li>
              <li>Cookies and similar tracking technologies</li>
              <li>Referral URLs and clickstream data</li>
              <li>Log files and error reports</li>
            </ul>
          </section>

          {/* How We Use Your Information */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How We Use Your Information</h2>
            <p className="text-gray-700 mb-4">We use the collected information for the following purposes:</p>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Service Delivery and Improvement</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Provide access to courses and learning materials</li>
              <li>Process enrollments and payments</li>
              <li>Track your learning progress and issue certificates</li>
              <li>Personalize your learning experience</li>
              <li>Improve our Platform functionality and user experience</li>
              <li>Develop new features and services</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Communication</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Send course updates and announcements</li>
              <li>Respond to your inquiries and support requests</li>
              <li>Send administrative notifications (e.g., password resets, purchase confirmations)</li>
              <li>Deliver promotional content and special offers (with your consent)</li>
              <li>Gather feedback through surveys and polls</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Security and Legal Compliance</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Detect and prevent fraud, unauthorized access, and other illegal activities</li>
              <li>Enforce our Terms of Service and other policies</li>
              <li>Comply with legal obligations and regulatory requirements</li>
              <li>Protect the rights, property, and safety of our users and the public</li>
            </ul>
          </section>

          {/* Information Sharing */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Information Sharing and Disclosure</h2>
            <p className="text-gray-700 mb-4">We do not sell your personal information. We may share your information in the following circumstances:</p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">Service Providers</h3>
            <p className="text-gray-700 mb-3">
              We engage trusted third-party service providers to perform functions on our behalf, such as:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Payment processing (Razorpay)</li>
              <li>Email delivery and marketing automation</li>
              <li>Cloud hosting and data storage</li>
              <li>Analytics and performance monitoring</li>
              <li>Customer support systems</li>
            </ul>
            <p className="text-gray-700 mt-3">
              These providers have access to your information only to perform specific tasks and are obligated to protect your data.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Instructors and Content Creators</h3>
            <p className="text-gray-700">
              Course instructors may have access to limited student data (e.g., names, progress, quiz scores) to facilitate teaching and provide personalized feedback.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Legal Requirements</h3>
            <p className="text-gray-700">
              We may disclose your information when required by law, legal process, litigation, or governmental request, or to protect our rights, privacy, safety, or property.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Business Transfers</h3>
            <p className="text-gray-700">
              In the event of a merger, acquisition, bankruptcy, or sale of assets, your information may be transferred to the acquiring entity. We will notify you of any such change in ownership or control.
            </p>
          </section>

          {/* Data Security */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Data Security</h2>
            <p className="text-gray-700 mb-4">
              We implement industry-standard security measures to protect your personal information from unauthorized access, disclosure, alteration, and destruction:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>SSL/TLS encryption for data transmission</li>
              <li>Encrypted storage of sensitive information</li>
              <li>Regular security audits and vulnerability assessments</li>
              <li>Access controls and authentication mechanisms</li>
              <li>Employee training on data protection best practices</li>
              <li>Secure payment processing through PCI-DSS compliant providers</li>
            </ul>
            <p className="text-gray-700 mt-4">
              While we strive to protect your information, no security system is impenetrable. We cannot guarantee absolute security of your data transmitted through the internet.
            </p>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Privacy Rights</h2>
            <p className="text-gray-700 mb-4">You have the following rights regarding your personal information:</p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">Access and Portability</h3>
            <p className="text-gray-700">
              You can access, review, and download your personal information from your account settings at any time.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Correction and Update</h3>
            <p className="text-gray-700">
              You can update or correct your personal information through your account settings or by contacting us.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Deletion</h3>
            <p className="text-gray-700">
              You may request deletion of your account and associated data. Note that we may retain certain information as required by law or for legitimate business purposes.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Marketing Opt-Out</h3>
            <p className="text-gray-700">
              You can unsubscribe from promotional emails by clicking the unsubscribe link in any marketing email or adjusting your communication preferences in your account settings.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Cookie Management</h3>
            <p className="text-gray-700">
              You can control cookies through your browser settings. Disabling cookies may affect Platform functionality.
            </p>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Cookies and Tracking Technologies</h2>
            <p className="text-gray-700 mb-4">
              We use cookies and similar technologies to enhance your experience, analyze usage patterns, and deliver personalized content. Types of cookies we use:
            </p>
            
            <ul className="list-disc list-inside text-gray-700 space-y-3 ml-4">
              <li>
                <strong>Essential Cookies:</strong> Required for Platform functionality (e.g., authentication, security)
              </li>
              <li>
                <strong>Performance Cookies:</strong> Collect anonymous data about how you use our Platform to improve performance
              </li>
              <li>
                <strong>Functional Cookies:</strong> Remember your preferences and settings
              </li>
              <li>
                <strong>Marketing Cookies:</strong> Track your activity to deliver relevant advertisements (with your consent)
              </li>
            </ul>

            <p className="text-gray-700 mt-4">
              You can manage cookie preferences through your browser settings. Most browsers allow you to block or delete cookies, but this may affect Platform functionality.
            </p>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Children's Privacy</h2>
            <p className="text-gray-700">
              Our Platform is not intended for children under the age of 13 (or 16 in certain jurisdictions). We do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us immediately, and we will take steps to delete such information.
            </p>
          </section>

          {/* International Users */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">International Data Transfers</h2>
            <p className="text-gray-700">
              Your information may be transferred to and processed in countries other than your country of residence. These countries may have different data protection laws. By using our Platform, you consent to such transfers. We ensure appropriate safeguards are in place to protect your information in accordance with this Privacy Policy.
            </p>
          </section>

          {/* Data Retention */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Data Retention</h2>
            <p className="text-gray-700">
              We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. When your information is no longer needed, we will securely delete or anonymize it.
            </p>
            <p className="text-gray-700 mt-4">
              Learning progress data and certificates may be retained indefinitely to maintain your educational records and verify course completion.
            </p>
          </section>

          {/* Third-Party Links */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Third-Party Websites and Services</h2>
            <p className="text-gray-700">
              Our Platform may contain links to third-party websites, applications, or services. We are not responsible for the privacy practices of these third parties. We encourage you to review their privacy policies before providing any personal information.
            </p>
          </section>

          {/* Changes to Policy */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Changes to This Privacy Policy</h2>
            <p className="text-gray-700">
              We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors. We will notify you of material changes by posting the updated policy on our Platform and updating the "Last Updated" date. Your continued use of the Platform after such changes constitutes acceptance of the updated policy.
            </p>
          </section>

          {/* Contact */}
          <section className="border-t border-gray-200 pt-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-gray-700 mb-6">
              If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
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
