import Navbar from "@/components/Navbar";
import Link from "next/link";

export default function PrivacyToolsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-green-600 via-emerald-600 to-teal-500 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">Privacy Policy - Tools</h1>
            <p className="text-lg text-gray-100">Last Updated: January 2024</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 space-y-8">
          
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Introduction</h2>
            <p className="text-gray-700 leading-relaxed">
              PremMCX Trading Tools are free resources designed to help traders with calculations and analysis. This Privacy Policy explains how we handle data from users of our tools.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Data Collection</h2>
            <p className="text-gray-700 mb-4">When using our tools, we collect:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Tool inputs and calculations (stored locally in your browser)</li>
              <li>Usage patterns and tool preferences</li>
              <li>Device information</li>
              <li>Browser type and version</li>
            </ul>
            <p className="text-gray-700 mt-4 font-semibold text-green-600">
              ✓ Important: Calculations are performed locally on your device. We do not send your trading data to our servers.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Local Storage Usage</h2>
            <p className="text-gray-700 mb-4">
              Our tools use browser local storage to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Save your tool preferences</li>
              <li>Remember your last calculations</li>
              <li>Store user settings</li>
            </ul>
            <p className="text-gray-700 mt-4">
              This data remains on your device and is never transmitted to our servers without your explicit action.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Data Security</h2>
            <p className="text-gray-700">
              Since calculations happen on your device:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mt-4">
              <li>Your trading data is never exposed to external networks</li>
              <li>No third-party access to your calculations</li>
              <li>Complete control over your data</li>
              <li>You can clear local storage anytime</li>
            </ul>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Analytics & Ads</h2>
            <p className="text-gray-700">
              Like our other pages, this page uses Google AdSense and Meta Pixel for analytics. See our main privacy policy for details.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-gray-700 mb-4">Questions about privacy on our tools?</p>
            <p className="text-gray-700"><strong>Email:</strong> tools@premmcxtrainingacademy.com</p>
          </section>

          <div className="border-t pt-8 mt-8">
            <Link href="/terms-tools" className="text-green-600 hover:text-green-700 font-semibold">Terms & Conditions →</Link>
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
