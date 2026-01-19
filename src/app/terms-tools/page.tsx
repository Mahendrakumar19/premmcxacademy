import Navbar from "@/components/Navbar";
import Link from "next/link";

export default function TermsToolsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-green-600 via-emerald-600 to-teal-500 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">Terms & Conditions - Tools</h1>
            <p className="text-lg text-gray-100">Effective: January 2024</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 space-y-8">
          
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700">
              By using the PremMCX Trading Tools, you accept and agree to be bound by these terms and conditions. If you do not agree, please do not use these tools.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">2. Tool Usage Rights</h2>
            <p className="text-gray-700 mb-4">
              We grant you a non-exclusive, non-transferable right to use our trading tools for personal trading purposes. You may not:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Commercialize or resell the tools</li>
              <li>Create derivative tools based on our designs</li>
              <li>Use the tools for illegal or unauthorized purposes</li>
              <li>Attempt to reverse engineer the tools</li>
              <li>Share tool access with third parties for commercial gain</li>
            </ul>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">3. Accuracy of Calculations</h2>
            <p className="text-gray-700 mb-4">
              While we strive to ensure accuracy, we make no guarantees about:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Mathematical accuracy of all calculations</li>
              <li>Real-time market data accuracy</li>
              <li>Continuous availability of tools</li>
            </ul>
            <p className="text-gray-700 mt-4">
              Always verify calculations independently before making trading decisions.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">4. No Financial Advice</h2>
            <p className="text-gray-700">
              These tools are for educational purposes only. They do not constitute financial, investment, or trading advice. Consult a qualified financial advisor before making any investment decisions.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">5. Liability Disclaimer</h2>
            <p className="text-gray-700">
              PremMCX is not responsible for losses, damages, or profits (or loss thereof) arising from the use of these tools. Your use of the tools is at your own risk.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">6. Tool Availability</h2>
            <p className="text-gray-700">
              We may modify, suspend, or discontinue tools at any time without notice. We are not liable for any interruption or discontinuance of tool services.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">7. Local Storage Data</h2>
            <p className="text-gray-700">
              Data stored in your browser's local storage is your responsibility. We recommend backing up important data. Clearing your browser cache will delete this data.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">8. Trading Risk Acknowledgment</h2>
            <p className="text-gray-700 mb-4">
              <strong>Important:</strong> Trading in commodities and financial markets carries substantial risk of loss. You acknowledge that:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>You have adequate capital to sustain losses</li>
              <li>You understand the risks involved in trading</li>
              <li>You will trade responsibly within your risk tolerance</li>
              <li>Past performance does not guarantee future results</li>
            </ul>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">9. Intellectual Property</h2>
            <p className="text-gray-700">
              All tools, designs, and content are the property of PremMCX or its licensors. Unauthorized reproduction is prohibited.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">10. Governing Law</h2>
            <p className="text-gray-700">
              These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in India.
            </p>
          </section>

          <div className="border-t pt-8 mt-8">
            <Link href="/privacy-tools" className="text-green-600 hover:text-green-700 font-semibold">← Back to Privacy Policy</Link>
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
