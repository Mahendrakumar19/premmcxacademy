import Navbar from "@/components/Navbar";
import Link from "next/link";

export default function TermsBlogPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">Terms & Conditions - Blog</h1>
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
              By accessing and using the PremMCX Trading Academy Blog, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">2. Use License</h2>
            <p className="text-gray-700 mb-4">
              Permission is granted to temporarily download one copy of the materials (information or software) on the Blog for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Modifying or copying the materials</li>
              <li>Using materials for commercial purpose without written permission</li>
              <li>Attempting to decompile or reverse engineer any software contained on the Blog</li>
              <li>Removing any copyright or other proprietary notations from the materials</li>
              <li>Transferring the materials to another person or "mirroring" the materials on another server</li>
            </ul>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">3. Disclaimer</h2>
            <p className="text-gray-700 mb-4">
              The materials on the Blog are provided on an 'as is' basis. PremMCX makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>
            <p className="text-gray-700">
              Trading and financial content on this blog is for educational purposes only. It is not financial advice. Always consult with a qualified financial advisor before making investment decisions.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">4. Limitations</h2>
            <p className="text-gray-700">
              In no event shall PremMCX or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on the Blog.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">5. Accuracy of Materials</h2>
            <p className="text-gray-700">
              The materials appearing on the Blog could include technical, typographical, or photographic errors. PremMCX does not warrant that any of the materials on the Blog are accurate, complete, or current. PremMCX may make changes to the materials contained on the Blog at any time without notice.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">6. Links</h2>
            <p className="text-gray-700">
              PremMCX has not reviewed all of the sites linked to its Blog and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by PremMCX of the site. Use of any such linked website is at the user's own risk.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">7. Modifications</h2>
            <p className="text-gray-700">
              PremMCX may revise these terms of service for the Blog at any time without notice. By using this Blog, you are agreeing to be bound by the then current version of these terms of service.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">8. Governing Law</h2>
            <p className="text-gray-700">
              These terms and conditions are governed by and construed in accordance with the laws of India and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">9. Trading Disclaimer</h2>
            <p className="text-gray-700 mb-4">
              <strong>Important:</strong> Trading in commodities and financial markets involves substantial risk of loss. Past performance is not indicative of future results. The information provided in this blog is for educational purposes only and should not be considered as investment advice.
            </p>
            <p className="text-gray-700">
              Before trading, please understand the risks involved and ensure you have adequate capital and experience. Always trade responsibly and within your risk tolerance.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">10. Contact Information</h2>
            <p className="text-gray-700">
              If you have any questions about these Terms and Conditions, please contact us at:
            </p>
            <p className="text-gray-700 mt-4"><strong>Email:</strong> legal@premmcxtrainingacademy.com</p>
          </section>

          <div className="border-t pt-8 mt-8">
            <Link href="/privacy-blog" className="text-indigo-600 hover:text-indigo-700 font-semibold">← Back to Privacy Policy</Link>
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
