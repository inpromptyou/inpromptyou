import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <>
      <Nav transparent />
      <main>
        {/* Hero — full viewport height with underwater GIF background */}
        <section className="relative min-h-[calc(100vh-64px)] flex items-center overflow-hidden -mt-16 pt-16">
          {/* GIF background */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/hero-bg.gif')" }}
          />
          {/* Dark overlay for readability */}
          <div className="absolute inset-0 bg-[#0C2A3A]/50" />

          <div className="relative z-10 max-w-3xl mx-auto px-5 sm:px-6 lg:px-8 py-20">
            <p className="text-sm font-medium text-[#5BB8D8] mb-5 tracking-wide uppercase">Now in beta</p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight leading-[1.15] mb-6 max-w-2xl">
              Your $200/month AI bill just told you nothing about who&apos;s wasting it.
            </h1>
            <p className="text-lg text-gray-300 leading-relaxed mb-10 max-w-xl">
              Inpromptyou is a hands-on assessment platform for AI prompting skills.
              Create a test. Watch candidates actually use an LLM. Get a score
              that means something. Takes five minutes to set up.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/signup" className="inline-flex items-center justify-center bg-[#1B5B7D] hover:bg-[#14455E] text-white px-6 py-3 rounded-md font-medium text-sm transition-colors border border-white/20">
                Start for free
              </Link>
              <Link href="/test/demo" className="inline-flex items-center justify-center bg-white/10 text-white border border-white/30 hover:bg-white/20 px-6 py-3 rounded-md font-medium text-sm transition-colors backdrop-blur-sm">
                Try a sample test
              </Link>
            </div>
          </div>
        </section>

        {/* Product mockup / the pitch — show what this looks like */}
        <section className="bg-white border-b border-gray-200/60">
          <div className="max-w-5xl mx-auto px-5 sm:px-6 lg:px-8 py-20 md:py-28">
            {/* Asymmetric two-column: mockup left, copy right */}
            <div className="grid md:grid-cols-5 gap-12 md:gap-16 items-center">
              {/* Mockup — takes more space */}
              <div className="md:col-span-3">
                <div className="bg-gray-950 rounded-lg overflow-hidden shadow-2xl border border-gray-800">
                  {/* Fake browser chrome */}
                  <div className="flex items-center gap-2 px-4 py-3 bg-gray-900 border-b border-gray-800">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-gray-700" />
                      <div className="w-2.5 h-2.5 rounded-full bg-gray-700" />
                      <div className="w-2.5 h-2.5 rounded-full bg-gray-700" />
                    </div>
                    <div className="flex-1 mx-4">
                      <div className="bg-gray-800 rounded px-3 py-1 text-xs text-gray-500 max-w-xs">
                        inpromptyou.com/test/sandbox
                      </div>
                    </div>
                  </div>
                  {/* Sandbox preview */}
                  <div className="p-5 space-y-4">
                    <div className="flex items-center justify-between text-xs text-gray-500 pb-3 border-b border-gray-800">
                      <span className="text-gray-400">Write a Marketing Email</span>
                      <div className="flex gap-4">
                        <span>Attempts: <span className="text-white font-medium">2/5</span></span>
                        <span>Tokens: <span className="text-white font-medium">847/2,000</span></span>
                        <span>Time: <span className="text-amber-400 font-medium">6:12</span></span>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <div className="bg-[#1B5B7D] text-white rounded-lg px-4 py-2.5 text-xs max-w-[70%] leading-relaxed">
                        Write a compelling product launch email for CloudSync Pro targeting enterprise CTOs. Focus on data synchronization pain points and include a clear CTA for demo bookings.
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div className="bg-gray-800 text-gray-300 rounded-lg px-4 py-2.5 text-xs max-w-[75%] leading-relaxed">
                        <span className="text-gray-500 text-[10px] block mb-1.5">GPT-4o</span>
                        Subject: Your data sync takes 23 hours/week. Let&apos;s fix that.<br /><br />
                        Dear [Name],<br /><br />
                        Enterprise teams lose an average of 23 hours weekly to fragmented data systems. CloudSync Pro delivers real-time bi-directional sync across your entire stack...
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <div className="flex-1 bg-gray-800 rounded px-3 py-2 text-xs text-gray-500">
                        Type your next prompt...
                      </div>
                      <div className="bg-[#1B5B7D] text-white px-3 py-2 rounded text-xs font-medium">Send</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Copy — 2 columns */}
              <div className="md:col-span-2">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 leading-tight">
                  A sandbox, not a survey
                </h2>
                <p className="text-gray-600 text-sm leading-relaxed mb-6">
                  Candidates interact with a real LLM inside a controlled environment.
                  You set the model, the task, the token budget, and the time limit.
                  We measure everything: how many prompts they need, how efficient
                  they are, and how good the output actually is.
                </p>
                <p className="text-gray-600 text-sm leading-relaxed">
                  The result is a Prompt Score from 0 to 100 you can actually compare
                  across candidates. No more &ldquo;tell me about a time you used ChatGPT.&rdquo;
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Who it's for — NOT a symmetric 3-column grid. Stacked, editorial layout */}
        <section className="noise-bg bg-gray-50 border-b border-gray-200/60">
          <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8 py-20 md:py-28">
            <h2 className="text-2xl font-bold text-gray-900 mb-12">
              Built for people who are tired of guessing
            </h2>

            <div className="space-y-10">
              <div className="flex gap-6 items-start">
                <div className="w-10 h-10 rounded-md bg-[#1B5B7D] flex items-center justify-center shrink-0 mt-0.5">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-1">Hiring managers</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    You have 40 applicants who all say they&apos;re &ldquo;proficient in AI tools.&rdquo;
                    Create a 15-minute test and find the three who actually are.
                    Compare candidates with a standardized score, not vibes.
                  </p>
                </div>
              </div>

              <div className="flex gap-6 items-start">
                <div className="w-10 h-10 rounded-md bg-[#1B5B7D] flex items-center justify-center shrink-0 mt-0.5">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-1">Educators</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Assign real exercises, track student progress, and identify who
                    needs help. Better than grading screenshots of ChatGPT conversations.
                  </p>
                </div>
              </div>

              <div className="flex gap-6 items-start">
                <div className="w-10 h-10 rounded-md bg-[#1B5B7D] flex items-center justify-center shrink-0 mt-0.5">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-1">Individual practitioners</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Build a verified Prompt Score. Put it on your LinkedIn. Show
                    potential employers that you don&apos;t just use AI, you&apos;re good at it.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing teaser — simple, not the full grid */}
        <section className="bg-white border-b border-gray-200/60">
          <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8 py-20 md:py-24">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Simple pricing</h2>
                <p className="text-sm text-gray-600 max-w-md">
                  Free to start. $79/month for teams. No per-candidate fees, no surprises.
                  Education discounts available.
                </p>
              </div>
              <Link href="/pricing" className="inline-flex items-center gap-2 text-[#1B5B7D] hover:text-[#14455E] font-medium text-sm transition-colors shrink-0">
                View pricing
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
              </Link>
            </div>
          </div>
        </section>

        {/* CTA — tight, not bloated */}
        <section className="bg-[#0C2A3A] noise-bg">
          <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8 py-20 md:py-24">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 max-w-lg">
              Stop asking candidates to describe their AI skills. Watch them.
            </h2>
            <p className="text-gray-400 mb-8 max-w-md">
              Set up your first assessment in under five minutes. Free plan includes three tests per month.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/signup" className="inline-flex items-center justify-center bg-[#1B5B7D] hover:bg-[#14455E] text-white px-6 py-3 rounded-md font-medium text-sm transition-colors">
                Create your first test
              </Link>
              <Link href="/how-it-works" className="inline-flex items-center justify-center border border-gray-700 text-gray-300 hover:text-white hover:border-gray-500 px-6 py-3 rounded-md font-medium text-sm transition-colors">
                See how it works
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
