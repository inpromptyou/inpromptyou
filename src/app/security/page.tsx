import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Security — InpromptiFy",
};

export default function SecurityPage() {
  return (
    <>
      <Nav />
      <main className="bg-white min-h-screen">
        <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8 py-16 md:py-24">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Security</h1>
          <p className="text-sm text-gray-400 mb-10">How we protect your data</p>

          <div className="prose prose-gray prose-sm max-w-none space-y-8 text-gray-700 leading-relaxed">
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mt-0">Encryption</h2>
              <p>
                All data transmitted between your browser and our servers is encrypted using TLS&nbsp;1.2+. Data at rest is encrypted using AES-256. Database backups are encrypted and stored in geographically redundant locations.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900">Infrastructure</h2>
              <p>
                InpromptiFy is hosted on industry-leading cloud providers with SOC&nbsp;2 and ISO&nbsp;27001 certifications. We use isolated environments, network segmentation, and least-privilege access controls across our infrastructure.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900">Data Handling</h2>
              <p>
                Assessment prompts are sent to AI model providers strictly for generating responses during active test sessions. We do not train models on your data. Prompts and results are stored securely and retained according to our <a href="/privacy" className="text-[#1B5B7D] underline">Privacy Policy</a>.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900">Authentication</h2>
              <p>
                Passwords are hashed using bcrypt with per-user salts. We support multi-factor authentication and enforce secure session management with automatic expiry.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900">Reporting Vulnerabilities</h2>
              <p>
                If you discover a security vulnerability, please disclose it responsibly. Contact us at{" "}
                <a href="mailto:security@InpromptiFy.ai" className="text-[#1B5B7D] underline">security@InpromptiFy.ai</a>.
                We take all reports seriously and aim to respond within 48&nbsp;hours.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900">Questions</h2>
              <p>
                For general security questions, reach us at{" "}
                <a href="mailto:security@InpromptiFy.ai" className="text-[#1B5B7D] underline">security@InpromptiFy.ai</a>.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
