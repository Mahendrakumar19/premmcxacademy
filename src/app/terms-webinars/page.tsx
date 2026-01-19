import Navbar from "@/components/Navbar";
import Link from "next/link";

export default function TermsWebinarsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-orange-600 via-red-600 to-pink-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">Terms & Conditions - Webinars</h1>
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
              By registering for and attending PremMCX Training Academy webinars, you accept and agree to be bound by these terms and conditions.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">2. Registration & Attendance</h2>
            <p className="text-gray-700 mb-4">
              By registering for webinars, you provide accurate information and agree that:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Your contact information is current and valid</li>
              <li>You are of legal age to participate</li>
              <li>You have the authority to enter into this agreement</li>
              <li>We may send you webinar-related communications</li>
            </ul>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">3. Recording & Intellectual Property</h2>
            <p className="text-gray-700 mb-4">
              Webinars may be recorded. By attending:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>You consent to being recorded</li>
              <li>Recordings remain PremMCX property</li>
              <li>Recordings may be used for training and promotional purposes</li>
              <li>You grant PremMCX rights to use your likeness in recordings</li>
            </ul>
            <p className="text-gray-700 mt-4">
              To opt-out of recording, disable your camera and microphone.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">4. Conduct & Behavior</h2>
            <p className="text-gray-700 mb-4">
              During webinars, you agree to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Be respectful and professional</li>
              <li>Not engage in harassment or discrimination</li>
              <li>Not share offensive content</li>
              <li>Follow trainer instructions</li>
              <li>Not disrupt the session</li>
            </ul>
            <p className="text-gray-700 mt-4">
              Violators may be removed from the webinar and future sessions.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">5. No Financial Advice</h2>
            <p className="text-gray-700">
              Webinar content is for educational purposes only. It does not constitute financial or investment advice. Always consult a qualified financial advisor before making trading or investment decisions.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">6. Trading Risk Acknowledgment</h2>
            <p className="text-gray-700 mb-4">
              <strong>Important:</strong> Trading carries substantial risk of loss. You acknowledge that:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Trading may result in significant financial losses</li>
              <li>Past performance does not guarantee future results</li>
              <li>You have adequate capital to sustain losses</li>
              <li>You trade at your own risk and expense</li>
            </ul>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">7. Liability Disclaimer</h2>
            <p className="text-gray-700">
              PremMCX is not responsible for losses, damages, or profits (or loss thereof) resulting from webinar attendance or acting on webinar content. Use of webinar information is at your own risk.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">8. Webinar Schedule & Changes</h2>
            <p className="text-gray-700">
              We reserve the right to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mt-4">
              <li>Reschedule webinars</li>
              <li>Cancel webinars</li>
              <li>Change webinar content</li>
              <li>Modify webinar time or format</li>
            </ul>
            <p className="text-gray-700 mt-4">
              Participants will be notified of changes via email.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">9. Privacy of Other Participants</h2>
            <p className="text-gray-700">
              You agree not to share, record, or distribute information about other participants without their consent. Respect others' privacy.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">10. Governing Law</h2>
            <p className="text-gray-700">
              These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in India.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">11. Contact Information</h2>
            <p className="text-gray-700 mb-4">
              For questions about these Terms and Conditions:
            </p>
            <p className="text-gray-700"><strong>Email:</strong> legal@premmcxtrainingacademy.com</p>
          </section>

          <div className="border-t pt-8 mt-8">
            <Link href="/privacy-webinars" className="text-orange-600 hover:text-orange-700 font-semibold">← Back to Privacy Policy</Link>
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
