import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Shipping Policy | PremMCX Trading Academy',
  description: 'Information about course access and delivery at PremMCX Trading Academy.',
};

export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Course Access & Delivery</h1>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Overview</h2>
            <p className="text-gray-700 mb-4">
              PremMCX Trading Academy is an online learning platform. All courses are delivered digitally, and no physical materials are shipped. This policy explains how you can access your courses and the technical requirements.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Instant Course Access</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Immediate Access</h3>
                <p className="text-gray-700">
                  Upon successful payment or free enrollment, you will receive instant access to all course materials. You can start learning immediately without any waiting period.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Access Duration</h3>
                <p className="text-gray-700">
                  Course access is available for the duration specified during enrollment. You will have continuous access to all course materials throughout the subscription period.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Technical Requirements</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">To access our courses, you need:</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>Internet Connection:</strong> Stable broadband or high-speed internet</li>
                <li><strong>Device:</strong> Computer (Windows/Mac), Tablet, or Smartphone</li>
                <li><strong>Browser:</strong> Modern web browser (Chrome, Firefox, Safari, Edge)</li>
                <li><strong>JavaScript:</strong> Enabled in your browser</li>
                <li><strong>Account:</strong> Registered account with valid email</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Accessing Your Courses</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Steps to Access Your Course</h3>
                <ol className="list-decimal list-inside text-gray-700 space-y-2">
                  <li>Log in to your account on our platform</li>
                  <li>Navigate to "My Courses" section</li>
                  <li>Click on the course you want to access</li>
                  <li>Browse course materials, videos, and resources</li>
                  <li>Track your progress and complete assessments</li>
                </ol>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Mobile Access</h3>
                <p className="text-gray-700">
                  Our platform is fully responsive and optimized for mobile devices. You can access your courses on smartphones and tablets for convenient learning on the go.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Course Materials</h2>
            <div className="space-y-4">
              <p className="text-gray-700">
                Depending on the course, you may have access to:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Video lectures and tutorials</li>
                <li>Downloadable resources and study materials</li>
                <li>Interactive quizzes and assessments</li>
                <li>Live trading sessions (where applicable)</li>
                <li>Discussion forums and community access</li>
                <li>Certificates of completion</li>
                <li>Support from instructors and mentors</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Course Duration & Expiry</h2>
            <div className="space-y-4">
              <p className="text-gray-700">
                The access period for each course is specified at the time of enrollment. After the access period expires:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>You will no longer have access to course materials</li>
                <li>Your progress will be retained but not displayed</li>
                <li>You can re-enroll by purchasing the course again</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Troubleshooting</h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Having trouble accessing your course?</h3>
              <p className="text-gray-700 mb-4">
                If you experience any technical issues:
              </p>
              <ol className="list-decimal list-inside text-gray-700 space-y-2">
                <li>Clear your browser cache and cookies</li>
                <li>Try a different browser or device</li>
                <li>Check your internet connection</li>
                <li>Ensure JavaScript is enabled</li>
                <li>Contact our support team if the issue persists</li>
              </ol>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Support & Assistance</h2>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <p className="text-gray-700 mb-4">
                Need help accessing your courses? Our support team is here to assist you:
              </p>
              <ul className="space-y-2 text-gray-700">
                <li><strong>Email:</strong> <a href="mailto:premmcxtrainingacademy@gmail.com" className="text-indigo-600 hover:underline">premmcxtrainingacademy@gmail.com</a></li>
                <li><strong>Phone:</strong> <a href="tel:+917717756371" className="text-indigo-600 hover:underline">+91 7717756371</a></li>
                <li><strong>Hours:</strong> Monday to Saturday, 9 AM - 7 PM IST</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Terms</h2>
            <p className="text-gray-700">
              All course materials are provided as-is. We reserve the right to update course content, access duration, and delivery methods at any time. Continued use of our platform indicates your acceptance of any changes to this policy.
            </p>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
}
