import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <>
      <Nav transparent />
      <main className="bg-[#0A0F1C]">
        {/* ─── Hero ─── */}
        <section className="relative min-h-[calc(100vh-64px)] flex items-center overflow-hidden -mt-16 pt-16">
          {/* Background effects */}
          <div className="absolute inset-0 dot-grid opacity-40" />
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full bg-indigo-500/[0.07] blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-violet-500/[0.05] blur-[100px]" />

          <div className="relative z-10 max-w-4xl mx-auto px-5 sm:px-6 lg:px-8 py-24 md:py-32">
            <div className="animate-fade-in-up">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse-glow" />
                Now in beta
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight leading-[1.1] mb-6 max-w-3xl animate-fade-in-up-delay-1">
              Measure AI prompting skills.{" "}
              <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                Not résumé claims.
              </span>
            </h1>
            <p className="text-lg text-gray-400 leading-relaxed mb-10 max-w-xl animate-fade-in-up-delay-2">
              InpromptiFy is the assessment platform that puts candidates in a real AI sandbox.
              Create a test, watch them prompt, get a score that actually means something.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 animate-fade-in-up-delay-3">
              <Link href="/signup" className="inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 text-white px-7 py-3 rounded-lg font-medium text-sm transition-all shadow-lg shadow-indigo-600/20">
                Start Free
              </Link>
              <Link href="/test/demo" className="inline-flex items-center justify-center bg-white/[0.05] text-gray-300 border border-white/10 hover:bg-white/[0.08] hover:border-white/20 px-7 py-3 rounded-lg font-medium text-sm transition-all backdrop-blur-sm">
                See Demo
              </Link>
            </div>
          </div>
        </section>

        {/* ─── Social Proof ─── */}
        <section className="border-y border-white/[0.06]">
          <div className="max-w-5xl mx-auto px-5 sm:px-6 lg:px-8 py-12">
            <p className="text-center text-xs font-medium text-gray-500 uppercase tracking-widest mb-8">
              Trusted by forward-thinking teams
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
              {["Acme Corp", "Globex", "Initech", "Hooli", "Pied Piper", "Aviato"].map((name) => (
                <span key={name} className="text-sm font-semibold text-gray-600 tracking-wide">
                  {name}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ─── How It Works ─── */}
        <section className="relative">
          <div className="absolute inset-0 dot-grid opacity-20" />
          <div className="relative max-w-5xl mx-auto px-5 sm:px-6 lg:px-8 py-24 md:py-32">
            <div className="text-center mb-16">
              <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-4">
                How it works
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                Three steps to better hiring
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  step: "01",
                  title: "Create",
                  desc: "Define a real-world task, set the AI model, token budget, and time limit. Takes under five minutes.",
                  icon: (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  ),
                },
                {
                  step: "02",
                  title: "Assess",
                  desc: "Candidates enter a sandboxed environment and solve the task with a real LLM. Every interaction is tracked.",
                  icon: (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400">
                      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                    </svg>
                  ),
                },
                {
                  step: "03",
                  title: "Hire",
                  desc: "Get a Prompt Score from 0–100 with detailed analytics. Compare candidates objectively and hire with confidence.",
                  icon: (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ),
                },
              ].map((item) => (
                <div key={item.step} className="glass-card rounded-xl p-6 transition-all duration-300">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                      {item.icon}
                    </div>
                    <span className="text-xs font-mono text-gray-600">{item.step}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Product Mockup ─── */}
        <section className="border-y border-white/[0.06]">
          <div className="max-w-5xl mx-auto px-5 sm:px-6 lg:px-8 py-24 md:py-32">
            <div className="grid md:grid-cols-5 gap-12 md:gap-16 items-center">
              <div className="md:col-span-3">
                <div className="bg-[#0A0F1C] rounded-xl overflow-hidden border border-white/[0.08] shadow-2xl shadow-indigo-500/5">
                  <div className="flex items-center gap-2 px-4 py-3 bg-[#0F1629] border-b border-white/[0.06]">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                      <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                      <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                    </div>
                    <div className="flex-1 mx-4">
                      <div className="bg-white/[0.05] rounded px-3 py-1 text-xs text-gray-500 max-w-xs">
                        InpromptiFy.com/test/sandbox
                      </div>
                    </div>
                  </div>
                  <div className="p-5 space-y-4">
                    <div className="flex items-center justify-between text-xs text-gray-500 pb-3 border-b border-white/[0.06]">
                      <span className="text-gray-400">Write a Marketing Email</span>
                      <div className="flex gap-4">
                        <span>Attempts: <span className="text-white font-medium">2/5</span></span>
                        <span>Tokens: <span className="text-white font-medium">847/2,000</span></span>
                        <span>Time: <span className="text-amber-400 font-medium">6:12</span></span>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <div className="bg-indigo-600 text-white rounded-lg px-4 py-2.5 text-xs max-w-[70%] leading-relaxed">
                        Write a compelling product launch email for CloudSync Pro targeting enterprise CTOs. Focus on data synchronization pain points and include a clear CTA for demo bookings.
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div className="bg-white/[0.05] text-gray-300 rounded-lg px-4 py-2.5 text-xs max-w-[75%] leading-relaxed border border-white/[0.06]">
                        <span className="text-gray-500 text-[10px] block mb-1.5">GPT-4o</span>
                        Subject: Your data sync takes 23 hours/week. Let&apos;s fix that.<br /><br />
                        Dear [Name],<br /><br />
                        Enterprise teams lose an average of 23 hours weekly to fragmented data systems. CloudSync Pro delivers real-time bi-directional sync across your entire stack...
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <div className="flex-1 bg-white/[0.05] rounded-lg px-3 py-2 text-xs text-gray-500 border border-white/[0.06]">
                        Type your next prompt...
                      </div>
                      <div className="bg-indigo-600 text-white px-3 py-2 rounded-lg text-xs font-medium">Send</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2">
                <h2 className="text-2xl font-bold text-white mb-4 leading-tight">
                  A sandbox, not a survey
                </h2>
                <p className="text-gray-400 text-sm leading-relaxed mb-6">
                  Candidates interact with a real LLM inside a controlled environment.
                  You set the model, the task, the token budget, and the time limit.
                  We measure everything: how many prompts they need, how efficient
                  they are, and how good the output actually is.
                </p>
                <p className="text-gray-400 text-sm leading-relaxed">
                  The result is a Prompt Score from 0 to 100 you can actually compare
                  across candidates. No more &ldquo;tell me about a time you used ChatGPT.&rdquo;
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Features Grid ─── */}
        <section className="relative">
          <div className="absolute top-1/2 right-0 w-[500px] h-[500px] -translate-y-1/2 rounded-full bg-violet-500/[0.04] blur-[120px]" />
          <div className="relative max-w-5xl mx-auto px-5 sm:px-6 lg:px-8 py-24 md:py-32">
            <div className="text-center mb-16">
              <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-violet-500/10 text-violet-400 border border-violet-500/20 mb-4">
                Features
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                Everything you need to assess AI skills
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                { title: "Real LLM Sandbox", desc: "Candidates use actual AI models in a controlled, monitored environment." },
                { title: "Prompt Scoring", desc: "Automated 0–100 scoring based on efficiency, quality, and iteration count." },
                { title: "Custom Tasks", desc: "Create assessments tailored to your role — marketing, engineering, data, and more." },
                { title: "Token Budgets", desc: "Set token limits to measure how efficiently candidates work with AI." },
                { title: "Time Controls", desc: "Configurable time limits keep assessments standardized and fair." },
                { title: "Analytics Dashboard", desc: "Compare candidates side-by-side with detailed performance breakdowns." },
              ].map((f) => (
                <div key={f.title} className="glass-card rounded-xl p-6 transition-all duration-300">
                  <h3 className="text-sm font-semibold text-white mb-2">{f.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Problem / Solution ─── */}
        <section className="border-y border-white/[0.06]">
          <div className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-8 py-24 md:py-32">
            <div className="grid md:grid-cols-2 gap-12 md:gap-16">
              <div>
                <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 mb-4">
                  The problem
                </span>
                <h3 className="text-xl font-bold text-white mb-4">Traditional interviews can&apos;t measure this</h3>
                <ul className="space-y-3 text-sm text-gray-400">
                  <li className="flex gap-3 items-start">
                    <span className="text-red-400 mt-0.5">✕</span>
                    &ldquo;Tell me about a time you used AI&rdquo; tells you nothing
                  </li>
                  <li className="flex gap-3 items-start">
                    <span className="text-red-400 mt-0.5">✕</span>
                    Everyone claims AI proficiency on their résumé
                  </li>
                  <li className="flex gap-3 items-start">
                    <span className="text-red-400 mt-0.5">✕</span>
                    No way to compare candidates objectively
                  </li>
                  <li className="flex gap-3 items-start">
                    <span className="text-red-400 mt-0.5">✕</span>
                    Your $200/month AI spend with zero ROI visibility
                  </li>
                </ul>
              </div>
              <div>
                <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-4">
                  The solution
                </span>
                <h3 className="text-xl font-bold text-white mb-4">InpromptiFy makes it measurable</h3>
                <ul className="space-y-3 text-sm text-gray-400">
                  <li className="flex gap-3 items-start">
                    <span className="text-emerald-400 mt-0.5">✓</span>
                    Hands-on assessments with real AI models
                  </li>
                  <li className="flex gap-3 items-start">
                    <span className="text-emerald-400 mt-0.5">✓</span>
                    Standardized scoring across all candidates
                  </li>
                  <li className="flex gap-3 items-start">
                    <span className="text-emerald-400 mt-0.5">✓</span>
                    Detailed analytics on prompting technique
                  </li>
                  <li className="flex gap-3 items-start">
                    <span className="text-emerald-400 mt-0.5">✓</span>
                    Set up in 5 minutes, results in 15
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Pricing Teaser ─── */}
        <section>
          <div className="max-w-5xl mx-auto px-5 sm:px-6 lg:px-8 py-24 md:py-32">
            <div className="text-center mb-12">
              <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-4">
                Pricing
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">
                Simple, transparent pricing
              </h2>
              <p className="text-gray-400 max-w-md mx-auto">
                Start free. Scale when you&apos;re ready. No per-candidate fees.
              </p>
            </div>
            <div className="grid sm:grid-cols-3 gap-5 max-w-3xl mx-auto">
              {[
                { plan: "Free", price: "$0", period: "/month", desc: "3 tests/month. Perfect for trying it out.", cta: "Get Started", highlight: false },
                { plan: "Pro", price: "$79", period: "/month", desc: "Unlimited tests. Full analytics. Team features.", cta: "Start Free Trial", highlight: true },
                { plan: "Enterprise", price: "Custom", period: "", desc: "SSO, custom models, dedicated support.", cta: "Contact Sales", highlight: false },
              ].map((p) => (
                <div key={p.plan} className={`rounded-xl p-6 transition-all duration-300 ${p.highlight ? "bg-indigo-600/10 border-2 border-indigo-500/30" : "glass-card"}`}>
                  <h3 className="text-sm font-semibold text-gray-400 mb-1">{p.plan}</h3>
                  <div className="flex items-baseline gap-1 mb-3">
                    <span className="text-3xl font-bold text-white">{p.price}</span>
                    {p.period && <span className="text-sm text-gray-500">{p.period}</span>}
                  </div>
                  <p className="text-sm text-gray-400 mb-6">{p.desc}</p>
                  <Link href="/pricing" className={`block text-center text-sm font-medium py-2.5 rounded-lg transition-all ${p.highlight ? "bg-indigo-600 hover:bg-indigo-500 text-white" : "bg-white/[0.05] hover:bg-white/[0.08] text-gray-300 border border-white/10"}`}>
                    {p.cta}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Final CTA ─── */}
        <section className="relative border-t border-white/[0.06]">
          <div className="absolute inset-0 dot-grid opacity-20" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-indigo-500/[0.06] blur-[120px]" />
          <div className="relative max-w-3xl mx-auto px-5 sm:px-6 lg:px-8 py-24 md:py-32 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
              Stop guessing. Start measuring.
            </h2>
            <p className="text-gray-400 mb-10 max-w-md mx-auto">
              Set up your first assessment in under five minutes. Free plan included.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/signup" className="inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 text-white px-7 py-3 rounded-lg font-medium text-sm transition-all shadow-lg shadow-indigo-600/20">
                Create your first test
              </Link>
              <Link href="/how-it-works" className="inline-flex items-center justify-center bg-white/[0.05] text-gray-300 border border-white/10 hover:bg-white/[0.08] hover:border-white/20 px-7 py-3 rounded-lg font-medium text-sm transition-all">
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
