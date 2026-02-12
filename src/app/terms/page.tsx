import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Terms of Service — InpromptiFy",
};

export default function TermsPage() {
  return (
    <>
      <Nav />
      <main className="bg-white min-h-screen">
        <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8 py-16 md:py-24">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
          <p className="text-sm text-gray-400 mb-10">Last updated: February 2026</p>

          <div className="prose prose-gray prose-sm max-w-none space-y-8 text-gray-700 leading-relaxed">
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mt-0">1. Acceptance of Terms</h2>
              <p>
                By accessing or using InpromptiFy (&ldquo;the Service&rdquo;), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900">2. Accounts</h2>
              <p>
                You must provide accurate information when creating an account. You are responsible for maintaining the security of your credentials and for all activity under your account.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900">3. Subscriptions &amp; Billing</h2>
              <p>
                Paid plans are billed in advance on a monthly or annual basis. You may cancel at any time; access continues until the end of your billing period. Refunds are provided at our discretion. We reserve the right to change pricing with 30&nbsp;days&rsquo; notice.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900">4. Intellectual Property</h2>
              <p>
                The Service, its design, code, scoring models, and content are owned by InpromptiFy and protected by intellectual property laws. You may not copy, modify, or reverse-engineer any part of the platform.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900">5. User Content</h2>
              <p>
                You retain ownership of prompts and content you create during assessments. By using the Service, you grant us a limited licence to process, store, and analyse your content for the purpose of delivering scores and improving the platform. We may use anonymised, aggregated data for research.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900">6. Prohibited Use</h2>
              <p>You agree not to:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Use the Service for any unlawful purpose</li>
                <li>Attempt to cheat, manipulate, or game assessment results</li>
                <li>Share account credentials or allow unauthorised access</li>
                <li>Interfere with or disrupt the Service or its infrastructure</li>
                <li>Scrape, harvest, or extract data without permission</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900">7. Disclaimers</h2>
              <p>
                The Service is provided &ldquo;as is&rdquo; and &ldquo;as available.&rdquo; We make no warranties, express or implied, regarding reliability, accuracy of scores, or fitness for a particular purpose. AI-generated outputs during assessments are produced by third-party models and do not represent our views.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900">8. Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by law, InpromptiFy shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenue, whether incurred directly or indirectly. Our total liability shall not exceed the amount you paid us in the twelve months preceding the claim.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900">9. Termination</h2>
              <p>
                We may suspend or terminate your access at any time for violation of these Terms or for any reason with reasonable notice. Upon termination, your right to use the Service ceases immediately. Provisions that by their nature should survive will survive termination.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900">10. Governing Law</h2>
              <p>
                These Terms are governed by and construed in accordance with the laws of Australia. Any disputes shall be subject to the exclusive jurisdiction of the courts of New South Wales, Australia.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900">11. Changes</h2>
              <p>
                We may revise these Terms at any time. Material changes will be communicated via email or platform notice at least 14&nbsp;days in advance. Continued use constitutes acceptance.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900">12. Contact</h2>
              <p>
                Questions? Reach us at{" "}
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
