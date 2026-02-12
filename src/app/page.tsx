import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import HeroMockup from "@/components/home/HeroMockup";
import ScorePreview from "@/components/home/ScorePreview";
import DashboardPreview from "@/components/home/DashboardPreview";
import BeforeAfter from "@/components/home/BeforeAfter";

export default function HomePage() {
  return (
    <>
      <Nav transparent />
      <main className="bg-[#0A0F1C]">
        {/* ─── Hero ─── */}
        <section className="relative min-h-[calc(100vh-56px)] flex items-center overflow-hidden -mt-14 pt-14">
          <div className="absolute inset-0 dot-grid opacity-30" />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full bg-indigo-500/[0.06] blur-[120px]" />

          <div className="relative z-10 max-w-5xl mx-auto px-5 sm:px-6 lg:px-8 py-20 md:py-28 w-full">
            <div className="max-w-2xl mb-12">
              <p className="text-[13px] font-mono text-indigo-400/80 mb-4 animate-fade-in-up">
                // assess what matters
              </p>
              <h1 className="text-4xl sm:text-5xl md:text-[3.5rem] font-bold text-white tracking-tight leading-[1.08] mb-5 animate-fade-in-up-delay-1">
                Measure AI prompting skills.{" "}
                <span className="text-gray-500">Not résumé claims.</span>
              </h1>
              <p className="text-base text-gray-500 leading-relaxed mb-8 max-w-lg animate-fade-in-up-delay-2">
                Put candidates in a real AI sandbox. Create a test in minutes,
                get an objective PromptScore from 0–100.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 animate-fade-in-up-delay-3">
                <Link href="/signup" className="inline-flex items-center justify-center text-white bg-indigo-600 hover:bg-indigo-500 px-6 py-2.5 rounded-md text-sm font-medium transition-colors">
                  Start Free
                </Link>
                <Link href="/test/demo" className="inline-flex items-center justify-center text-gray-400 hover:text-gray-200 px-6 py-2.5 rounded-md text-sm transition-colors border border-white/[0.06] hover:border-white/[0.12]">
                  Try the Demo
                </Link>
              </div>
            </div>

            {/* Hero product mockup */}
            <div className="animate-fade-in-up-delay-3">
              <HeroMockup />
            </div>
          </div>
        </section>

        {/* ─── Social Proof ─── */}
        <section className="border-y border-white/[0.04]">
          <div className="max-w-5xl mx-auto px-5 sm:px-6 lg:px-8 py-10">
            <p className="text-center text-[11px] font-medium text-gray-600 uppercase tracking-widest mb-6">
              Trusted by forward-thinking teams
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
              {["Acme Corp", "Globex", "Initech", "Hooli", "Pied Piper", "Aviato"].map((name) => (
                <span key={name} className="text-sm font-medium text-gray-700 tracking-wide">{name}</span>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Scoring Preview ─── */}
        <section className="relative">
          <div className="relative max-w-5xl mx-auto px-5 sm:px-6 lg:px-8 py-20 md:py-28">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <p className="text-[11px] font-mono text-indigo-400/70 uppercase tracking-wider mb-3">Scoring</p>
                <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-4">
                  A score that means something
                </h2>
                <p className="text-sm text-gray-500 leading-relaxed mb-4">
                  PromptScore evaluates efficiency, output quality, iteration strategy,
                  and token economy. One number, fully comparable across candidates.
                </p>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Detailed breakdowns show exactly where a candidate excels—or
                  falls short. No more guessing.
                </p>
              </div>
              <ScorePreview />
            </div>
          </div>
        </section>

        {/* ─── Dashboard Preview ─── */}
        <section className="border-y border-white/[0.04]">
          <div className="max-w-5xl mx-auto px-5 sm:px-6 lg:px-8 py-20 md:py-28">
            <div className="text-center mb-12">
              <p className="text-[11px] font-mono text-indigo-400/70 uppercase tracking-wider mb-3">Dashboard</p>
              <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-3">
                Compare candidates at a glance
              </h2>
              <p className="text-sm text-gray-500 max-w-md mx-auto">
                Your employer dashboard shows every test result, ranked and filterable.
              </p>
            </div>
            <DashboardPreview />
          </div>
        </section>

        {/* ─── How It Works ─── */}
        <section className="relative">
          <div className="relative max-w-5xl mx-auto px-5 sm:px-6 lg:px-8 py-20 md:py-28">
            <div className="text-center mb-14">
              <p className="text-[11px] font-mono text-indigo-400/70 uppercase tracking-wider mb-3">Process</p>
              <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                Three steps. Five minutes.
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-px bg-white/[0.04] rounded-xl overflow-hidden">
              {[
                { step: "01", title: "Create", desc: "Define a task, pick an AI model, set token and time limits." },
                { step: "02", title: "Assess", desc: "Candidates enter a sandboxed environment and solve the task with a real LLM." },
                { step: "03", title: "Hire", desc: "Get a PromptScore 0–100 with detailed analytics. Compare and decide." },
              ].map((item) => (
                <div key={item.step} className="bg-[#0C1120] p-7">
                  <span className="text-[11px] font-mono text-gray-600 block mb-4">{item.step}</span>
                  <h3 className="text-base font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Before / After ─── */}
        <section className="border-y border-white/[0.04]">
          <div className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-8 py-20 md:py-28">
            <div className="text-center mb-12">
              <p className="text-[11px] font-mono text-indigo-400/70 uppercase tracking-wider mb-3">Why InpromptiFy</p>
              <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                The old way vs. the better way
              </h2>
            </div>
            <BeforeAfter />
          </div>
        </section>

        {/* ─── Features ─── */}
        <section className="relative">
          <div className="relative max-w-5xl mx-auto px-5 sm:px-6 lg:px-8 py-20 md:py-28">
            <div className="text-center mb-14">
              <p className="text-[11px] font-mono text-violet-400/70 uppercase tracking-wider mb-3">Features</p>
              <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                Everything you need to assess AI skills
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/[0.04] rounded-xl overflow-hidden">
              {[
                { title: "Real LLM Sandbox", desc: "Candidates use actual AI models in a controlled, monitored environment." },
                { title: "Prompt Scoring", desc: "Automated 0–100 scoring based on efficiency, quality, and iteration count." },
                { title: "Custom Tasks", desc: "Create assessments tailored to your role — marketing, engineering, data." },
                { title: "Token Budgets", desc: "Set token limits to measure how efficiently candidates work with AI." },
                { title: "Time Controls", desc: "Configurable time limits keep assessments standardized and fair." },
                { title: "Analytics Dashboard", desc: "Compare candidates side-by-side with detailed performance breakdowns." },
              ].map((f) => (
                <div key={f.title} className="bg-[#0C1120] p-6 hover:bg-[#0E1326] transition-colors">
                  <h3 className="text-sm font-semibold text-white mb-1.5">{f.title}</h3>
                  <p className="text-[13px] text-gray-500 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Pricing Teaser ─── */}
        <section className="border-y border-white/[0.04]">
          <div className="max-w-5xl mx-auto px-5 sm:px-6 lg:px-8 py-20 md:py-28">
            <div className="text-center mb-10">
              <p className="text-[11px] font-mono text-indigo-400/70 uppercase tracking-wider mb-3">Pricing</p>
              <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-3">
                Simple, transparent pricing
              </h2>
              <p className="text-sm text-gray-500 max-w-md mx-auto">
                Start free. Scale when you&apos;re ready.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/[0.04] rounded-xl overflow-hidden max-w-4xl mx-auto">
              {[
                { plan: "Free", price: "$0", period: "/mo", desc: "3 tests/month. Perfect for trying it out.", cta: "Get Started", highlight: false },
                { plan: "Plus", price: "$14.99", period: "/mo", desc: "15 tests/month. Ideal for freelancers.", cta: "Get Started", highlight: false },
                { plan: "Pro", price: "$79", period: "/mo", desc: "100 tests/month. Full analytics. Teams.", cta: "Start Free Trial", highlight: true },
                { plan: "Business", price: "$249", period: "/mo", desc: "500 tests/month. ATS integrations. API.", cta: "Start Free Trial", highlight: false },
              ].map((p) => (
                <div key={p.plan} className={`p-6 ${p.highlight ? "bg-indigo-600/[0.06] border-y border-indigo-500/20 sm:border-y-0 sm:border-x" : "bg-[#0C1120]"}`}>
                  <h3 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">{p.plan}</h3>
                  <div className="flex items-baseline gap-0.5 mb-3">
                    <span className="text-2xl font-bold text-white">{p.price}</span>
                    {p.period && <span className="text-sm text-gray-600">{p.period}</span>}
                  </div>
                  <p className="text-[13px] text-gray-500 mb-5">{p.desc}</p>
                  <Link href="/pricing" className={`block text-center text-[13px] font-medium py-2 rounded-md transition-colors ${p.highlight ? "bg-indigo-600 hover:bg-indigo-500 text-white" : "bg-white/[0.04] hover:bg-white/[0.08] text-gray-400 border border-white/[0.06]"}`}>
                    {p.cta}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Job Board Teaser ─── */}
        <section className="relative">
          <div className="relative max-w-5xl mx-auto px-5 sm:px-6 lg:px-8 py-20 md:py-28">
            <div className="text-center mb-12">
              <p className="text-[11px] font-mono text-indigo-400/70 uppercase tracking-wider mb-3">Jobs</p>
              <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-3">
                Open Roles — Apply by completing a test
              </h2>
              <p className="text-sm text-gray-500 max-w-md mx-auto">
                Companies are hiring based on real AI skills. Take a test, get a PromptScore, land the role.
              </p>
            </div>
            <div className="text-center">
              <Link href="/jobs" className="inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-md text-sm font-medium transition-colors">
                Browse Open Roles →
              </Link>
            </div>
          </div>
        </section>

        {/* ─── Final CTA ─── */}
        <section className="relative">
          <div className="absolute inset-0 dot-grid opacity-15" />
          <div className="relative max-w-3xl mx-auto px-5 sm:px-6 lg:px-8 py-20 md:py-28 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 tracking-tight">
              Stop guessing. Start measuring.
            </h2>
            <p className="text-sm text-gray-500 mb-8 max-w-md mx-auto">
              Set up your first assessment in under five minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/signup" className="inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-md text-sm font-medium transition-colors">
                Create your first test
              </Link>
              <Link href="/how-it-works" className="inline-flex items-center justify-center text-gray-400 hover:text-gray-200 px-6 py-2.5 rounded-md text-sm transition-colors border border-white/[0.06] hover:border-white/[0.12]">
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
