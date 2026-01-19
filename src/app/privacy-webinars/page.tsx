import Navbar from "@/components/Navbar";
import Link from "next/link";

export default function PrivacyWebinarsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-orange-600 via-red-600 to-pink-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">Privacy Policy - Webinars</h1>
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
              At PremMCX Training Academy, we conduct live webinars and training sessions. This Privacy Policy explains how we collect and protect your information during webinar registrations and sessions.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Registration Information</h2>
            <p className="text-gray-700 mb-4">When you register for a webinar, we collect:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Full name</li>
              <li>Email address</li>
              <li>Phone number (optional)</li>
              <li>Experience level</li>
              <li>Areas of interest</li>
            </ul>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Webinar Session Data</h2>
            <p className="text-gray-700 mb-4">During live webinars, we may collect:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Video/audio recording of the session (if applicable)</li>
              <li>Attendance records</li>
              <li>Chat messages (if applicable)</li>
              <li>Q&A interactions</li>
              <li>Participant analytics</li>
            </ul>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Video Recording & Storage</h2>
            <p className="text-gray-700 mb-4">
              Webinars may be recorded for:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Providing replay access to registered participants</li>
              <li>Internal quality improvement</li>
              <li>Training and archival purposes</li>
            </ul>
            <p className="text-gray-700 mt-4">
              By attending webinars, you consent to being recorded. You can opt-out by disabling your camera/microphone.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Communication</h2>
            <p className="text-gray-700">
              We may use your email to send:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mt-4">
              <li>Webinar reminders and updates</li>
              <li>Replay links</li>
              <li>Related training materials</li>
              <li>Promotional offers (with opt-out option)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Data Retention</h2>
            <p className="text-gray-700">
              We retain:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mt-4">
              <li>Registration data for 1 year</li>
              <li>Video recordings for 2 years</li>
              <li>Attendance records for 1 year</li>
            </ul>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-gray-700 mb-4">Privacy concerns about our webinars?</p>
            <p className="text-gray-700"><strong>Email:</strong> webinars@premmcxtrainingacademy.com</p>
          </section>

          <div className="border-t pt-8 mt-8">
            <Link href="/terms-webinars" className="text-orange-600 hover:text-orange-700 font-semibold">Terms & Conditions →</Link>
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
