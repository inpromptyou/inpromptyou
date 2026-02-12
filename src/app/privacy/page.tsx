import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Privacy Policy — InpromptiFy",
};

export default function PrivacyPage() {
  return (
    <>
      <Nav />
      <main className="bg-white min-h-screen">
        <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8 py-16 md:py-24">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
          <p className="text-sm text-gray-400 mb-10">Last updated: February 2026</p>

          <div className="prose prose-gray prose-sm max-w-none space-y-8 text-gray-700 leading-relaxed">
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mt-0">1. Introduction</h2>
              <p>
                InpromptiFy (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) operates the InpromptiFy.com platform. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900">2. Information We Collect</h2>
              <p><strong>Account Information:</strong> Name, email address, and password when you create an account.</p>
              <p><strong>Test &amp; Assessment Data:</strong> Prompts you write, AI responses generated, scores, and performance metrics during assessments.</p>
              <p><strong>Usage Analytics:</strong> Pages visited, features used, session duration, device type, browser, and IP address.</p>
              <p><strong>Payment Information:</strong> Billing details are processed by our third-party payment provider and are not stored on our servers.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900">3. How We Use Your Information</h2>
              <p>We use collected information to:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Provide, maintain, and improve the platform</li>
                <li>Generate assessment scores and analytics</li>
                <li>Send transactional emails (account confirmations, test results)</li>
                <li>Detect fraud and enforce our Terms of Service</li>
                <li>Conduct aggregated, anonymised research to improve our scoring models</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900">4. Cookies &amp; Tracking</h2>
              <p>
                We use essential cookies to keep you logged in and functional cookies for preferences. We may use analytics cookies (e.g., Google Analytics) to understand usage patterns. You can disable non-essential cookies in your browser settings.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900">5. Third-Party Services</h2>
              <p>
                We share data with third parties only as necessary to operate the service: cloud hosting providers, AI model providers (to process prompts during tests), payment processors, and analytics tools. We do not sell your personal data.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900">6. Data Retention</h2>
              <p>
                We retain your account data for as long as your account is active. Test results are retained for up to 24&nbsp;months after completion. You may request deletion of your data at any time.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900">7. Your Rights</h2>
              <p>Depending on your jurisdiction, you may have the right to:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Access the personal data we hold about you</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Export your data in a portable format</li>
                <li>Withdraw consent for non-essential processing</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900">8. Security</h2>
              <p>
                We implement industry-standard security measures including encryption in transit (TLS) and at rest. For more details, see our <a href="/security" className="text-[#1B5B7D] underline">Security page</a>.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900">9. Changes to This Policy</h2>
              <p>
                We may update this policy from time to time. Material changes will be communicated via email or a notice on our platform. Continued use after changes constitutes acceptance.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900">10. Contact</h2>
              <p>
                Questions about this policy? Contact us at{" "}
                <a href="mailto:gatelayerplus@gmail.com" className="text-[#1B5B7D] underline">gatelayerplus@gmail.com</a>.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
