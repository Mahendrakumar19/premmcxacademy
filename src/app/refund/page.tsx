import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Refund & Cancellation Policy | PremMCX Trading Academy',
  description: 'Learn about our refund and cancellation policies for courses.',
};

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Refund & Cancellation Policy</h1>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Overview</h2>
            <p className="text-gray-700 mb-4">
              At PremMCX Training Academy, we are committed to ensuring your satisfaction with our courses. This policy outlines our refund and cancellation procedures.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Refund Eligibility</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">7-Day Money Back Guarantee</h3>
                <p className="text-gray-700">
                  You can request a full refund within 7 days of enrollment if you are not satisfied with the course content. This applies to all paid courses.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Refund Conditions</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Refund requests must be made within 7 days of the course enrollment date</li>
                  <li>You must provide a valid reason for the refund</li>
                  <li>The course must not have been heavily utilized (more than 30% of content completed)</li>
                  <li>Refund requests with proof of completion of more than 30% of course content will be rejected</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Refund Process</h2>
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">How to Request a Refund</h3>
                <ol className="list-decimal list-inside text-gray-700 space-y-2">
                  <li>Contact our support team via email: <a href="mailto:premmcxtrainingacademy@gmail.com" className="text-indigo-600 hover:underline">premmcxtrainingacademy@gmail.com</a></li>
                  <li>Provide your order ID and reason for refund</li>
                  <li>Our team will review your request within 3-5 business days</li>
                  <li>Upon approval, the refund will be processed to your original payment method</li>
                  <li>Refund will be credited within 7-10 business days</li>
                </ol>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Course Cancellation</h2>
            <div className="space-y-4">
              <p className="text-gray-700">
                If you need to cancel your enrollment, please note the following:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Cancellation within 7 days: Full refund</li>
                <li>Cancellation after 7 days: No refund (access to course content continues until course expiry)</li>
                <li>To cancel, contact us at: <a href="mailto:premmcxtrainingacademy@gmail.com" className="text-indigo-600 hover:underline">premmcxtrainingacademy@gmail.com</a></li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Exceptions</h2>
            <p className="text-gray-700 mb-4">
              The following situations are NOT eligible for refund:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Free courses</li>
              <li>Duplicate purchases (accidental multiple enrollments)</li>
              <li>Courses accessed more than 30% before refund request</li>
              <li>Technical issues resolved by our support team</li>
              <li>Requests made more than 7 days after enrollment</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <p className="text-gray-700 mb-4">
                For refund or cancellation requests, please contact our support team:
              </p>
              <ul className="space-y-2 text-gray-700">
                <li><strong>Email:</strong> <a href="mailto:premmcxtrainingacademy@gmail.com" className="text-indigo-600 hover:underline">premmcxtrainingacademy@gmail.com</a></li>
                <li><strong>Phone:</strong> <a href="tel:+917717756371" className="text-indigo-600 hover:underline">+91 7717756371</a></li>
                <li><strong>Hours:</strong> Monday to Saturday, 9 AM - 7 PM IST</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Policy Updates</h2>
            <p className="text-gray-700">
              We reserve the right to update this policy at any time. Changes will be effective immediately upon posting to the website.
            </p>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
}
