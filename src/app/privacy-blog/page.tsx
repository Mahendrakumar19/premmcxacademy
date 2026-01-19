import Navbar from "@/components/Navbar";
import Link from "next/link";

export default function PrivacyBlogPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">Privacy Policy - Blog</h1>
            <p className="text-lg text-gray-100">Last Updated: January 2024</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 space-y-8">
          
          {/* Quick Links */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6 mb-8">
            <h3 className="font-bold text-indigo-900 mb-4">Quick Navigation</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <a href="#collection" className="text-indigo-600 hover:text-indigo-700">Information We Collect</a>
              <a href="#use" className="text-indigo-600 hover:text-indigo-700">How We Use Your Data</a>
              <a href="#cookies" className="text-indigo-600 hover:text-indigo-700">Cookies & Tracking</a>
              <a href="#security" className="text-indigo-600 hover:text-indigo-700">Data Security</a>
              <a href="#rights" className="text-indigo-600 hover:text-indigo-700">Your Rights</a>
              <a href="#contact" className="text-indigo-600 hover:text-indigo-700">Contact Us</a>
            </div>
          </div>

          {/* Introduction */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Introduction</h2>
            <p className="text-gray-700 leading-relaxed">
              Welcome to PremMCX Trading Academy Blog. We are committed to protecting your privacy and ensuring you have a positive experience on our website. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our blog.
            </p>
          </section>

          {/* Information We Collect */}
          <section id="collection">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Information We Collect</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Automatically Collected Information</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>IP Address</li>
              <li>Browser type and version</li>
              <li>Operating system</li>
              <li>Pages visited and time spent</li>
              <li>Device information</li>
              <li>Referring website URLs</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Information from Third Parties</h3>
            <p className="text-gray-700">We may receive information from:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Google Analytics - traffic and user behavior</li>
              <li>Google AdSense - ad performance data</li>
              <li>Meta Pixel - conversion tracking</li>
              <li>Social Media Platforms - if you click from social links</li>
            </ul>
          </section>

          {/* Cookies & Tracking */}
          <section id="cookies">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Cookies and Tracking Technologies</h2>
            <p className="text-gray-700 mb-4">
              Our blog uses cookies and similar tracking technologies including:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li><strong>Essential Cookies:</strong> Required for site functionality</li>
              <li><strong>Analytics Cookies:</strong> Google Analytics for understanding user behavior</li>
              <li><strong>Advertising Cookies:</strong> Google AdSense for personalized ads</li>
              <li><strong>Conversion Pixels:</strong> Meta Pixel for tracking conversions</li>
            </ul>
            <p className="text-gray-700 mt-4">
              You can disable cookies through your browser settings, but this may affect site functionality.
            </p>
          </section>

          {/* How We Use Data */}
          <section id="use">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How We Use Your Information</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>To improve blog content and user experience</li>
              <li>To understand how users interact with our blog</li>
              <li>To display relevant advertisements</li>
              <li>To track marketing campaign effectiveness</li>
              <li>To analyze site traffic and performance</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          {/* Data Security */}
          <section id="security">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Data Security</h2>
            <p className="text-gray-700">
              We implement industry-standard security measures to protect your information:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mt-4">
              <li>HTTPS encryption for data transmission</li>
              <li>Regular security audits</li>
              <li>Limited access to personal information</li>
              <li>Secure servers and databases</li>
            </ul>
            <p className="text-gray-700 mt-4">
              However, no transmission over the internet is 100% secure. We cannot guarantee absolute security.
            </p>
          </section>

          {/* Third-Party Services */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Third-Party Services</h2>
            <p className="text-gray-700 mb-4">
              Our blog uses the following third-party services which may collect data:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li><strong>Google Analytics:</strong> Analyzes website traffic and user behavior</li>
              <li><strong>Google AdSense:</strong> Displays targeted advertisements</li>
              <li><strong>Meta Pixel:</strong> Tracks conversions from Meta ads</li>
              <li><strong>WordPress/Hosting:</strong> Infrastructure providers</li>
            </ul>
            <p className="text-gray-700 mt-4">
              These services have their own privacy policies. We recommend reviewing them.
            </p>
          </section>

          {/* Your Rights */}
          <section id="rights">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Privacy Rights</h2>
            <p className="text-gray-700 mb-4">Depending on your location, you may have rights including:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Right to access your personal information</li>
              <li>Right to request deletion of your data</li>
              <li>Right to opt-out of tracking cookies</li>
              <li>Right to data portability</li>
              <li>Right to withdraw consent</li>
            </ul>
          </section>

          {/* Contact */}
          <section id="contact">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-gray-700 mb-4">
              If you have questions about this Privacy Policy or your data, please contact us:
            </p>
            <div className="bg-gray-50 p-6 rounded-lg mt-4">
              <p className="text-gray-700"><strong>Email:</strong> privacy@premmcxtrainingacademy.com</p>
              <p className="text-gray-700"><strong>Address:</strong> PremMCX Training Academy, India</p>
              <p className="text-gray-700"><strong>Phone:</strong> +91-XXXXXXXXXX</p>
            </div>
          </section>

          {/* Policy Updates */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Policy Updates</h2>
            <p className="text-gray-700">
              We may update this Privacy Policy periodically. Changes become effective immediately upon posting. Your continued use of our blog after changes indicates acceptance of the updated policy.
            </p>
          </section>

          {/* Footer Links */}
          <div className="border-t pt-8 mt-8">
            <div className="flex gap-4">
              <Link href="/terms-blog" className="text-indigo-600 hover:text-indigo-700 font-semibold">Terms & Conditions</Link>
              <Link href="/blog" className="text-indigo-600 hover:text-indigo-700 font-semibold">Back to Blog</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center text-sm">
            <p>&copy; 2024 PremMCX Training Academy. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
