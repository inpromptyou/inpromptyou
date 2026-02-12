import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Link from "next/link";

export default function HowItWorksPage() {
  return (
    <>
      <Nav />
      <main>
        {/* Header */}
        <section className="noise-bg bg-gray-50 border-b border-gray-200/60">
          <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8 py-16 md:py-20">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How InpromptiFy works</h1>
            <p className="text-gray-600 text-base max-w-xl">
              Two sides of the same coin: you create an assessment, candidates take it in a
              sandboxed AI environment, and both of you get useful data out the other end.
            </p>
          </div>
        </section>

        {/* For Test Creators */}
        <section className="bg-white border-b border-gray-200/60">
          <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8 py-16 md:py-20">
            <p className="text-sm font-medium text-[#1B5B7D] mb-3 uppercase tracking-wide">For test creators</p>
            <h2 className="text-2xl font-bold text-gray-900 mb-10">Set up an assessment in under five minutes</h2>

            <div className="space-y-12">
              {[
                {
                  step: "1",
                  title: "Define the task",
                  description: "Write what candidates should accomplish. This could be drafting marketing copy, debugging code, summarizing a legal document, or anything else you'd use an LLM for at work.",
                  details: ["Choose from GPT-4o, Claude, or Gemini", "Write a clear brief with specific deliverables", "Define what a good output looks like"],
                },
                {
                  step: "2",
                  title: "Set the constraints",
                  description: "Token budget, time limit, max prompt attempts. These constraints are what make the assessment meaningful -- they separate people who can prompt efficiently from people who brute-force their way through.",
                  details: ["Token budget caps total usage across all prompts", "Time limits keep things practical", "Fewer attempts needed = higher score"],
                },
                {
                  step: "3",
                  title: "Share the link, watch results come in",
                  description: "Each test gets a unique URL. Send it to candidates, embed it in your ATS, or post it on a job listing. Results arrive in real time on your dashboard.",
                  details: ["Candidates get their score immediately", "You get detailed analytics on each approach", "Compare candidates side by side"],
                },
              ].map((item) => (
                <div key={item.step} className="flex gap-6 items-start">
                  <div className="w-8 h-8 bg-gray-900 text-white rounded-md flex items-center justify-center font-bold text-sm shrink-0">{item.step}</div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-600 mb-4 leading-relaxed">{item.description}</p>
                    <ul className="space-y-1.5">
                      {item.details.map((d) => (
                        <li key={d} className="flex items-start gap-2 text-sm text-gray-500">
                          <span className="text-gray-300 mt-1.5 shrink-0">&mdash;</span>
                          {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* For Test Takers */}
        <section className="noise-bg bg-gray-50 border-b border-gray-200/60">
          <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8 py-16 md:py-20">
            <p className="text-sm font-medium text-[#10B981] mb-3 uppercase tracking-wide">For test takers</p>
            <h2 className="text-2xl font-bold text-gray-900 mb-10">Prove your skills, not describe them</h2>

            <div className="space-y-12">
              {[
                {
                  step: "1",
                  title: "Review the brief",
                  description: "You'll see the task description, which AI model you'll be using, and the constraints: how much time, how many tokens, how many attempts. Plan before you type.",
                },
                {
                  step: "2",
                  title: "Work with the AI",
                  description: "The sandbox gives you a real chat interface with the specified model. Write prompts, review outputs, iterate. The platform tracks everything: token usage, attempt count, time spent. Efficiency matters as much as getting the right answer.",
                },
                {
                  step: "3",
                  title: "Get your Prompt Score",
                  description: "Submit when you're satisfied. You'll immediately see your score (0-100) with a breakdown across efficiency, speed, accuracy, and attempts. See where you rank. Put it on your LinkedIn if you're proud of it.",
                },
              ].map((item) => (
                <div key={item.step} className="flex gap-6 items-start">
                  <div className="w-8 h-8 bg-[#10B981] text-white rounded-md flex items-center justify-center font-bold text-sm shrink-0">{item.step}</div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* The Prompt Score */}
        <section className="bg-white border-b border-gray-200/60">
          <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8 py-16 md:py-20">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">The Prompt Score</h2>
            <p className="text-sm text-gray-600 mb-10 max-w-xl">
              A composite metric from 0 to 100 that measures how effectively someone uses AI to accomplish a task.
              Four weighted components:
            </p>

            <div className="space-y-6">
              {[
                { name: "Accuracy", weight: "35%", desc: "Does the output match what was asked for? Evaluated against the success criteria defined by the test creator." },
                { name: "Efficiency", weight: "30%", desc: "How many tokens did they burn relative to the budget? Getting the same result with fewer tokens scores higher." },
                { name: "Speed", weight: "20%", desc: "How fast did they finish? Faster is better, as long as quality holds." },
                { name: "Attempts", weight: "15%", desc: "How many prompts did they need? Fewer, more precise prompts indicate stronger prompting ability." },
              ].map((metric) => (
                <div key={metric.name} className="flex gap-4 items-start">
                  <span className="text-xs font-mono font-bold text-gray-400 w-10 shrink-0 mt-0.5 text-right">{metric.weight}</span>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-0.5">{metric.name}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{metric.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gray-950 noise-bg">
          <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8 py-16 md:py-20">
            <h2 className="text-2xl font-bold text-white mb-4">Ready to try it?</h2>
            <p className="text-gray-400 mb-8">Create your first assessment in under five minutes, or take a sample test to see the candidate experience.</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/signup" className="inline-flex items-center justify-center bg-[#1B5B7D] hover:bg-[#14455E] text-white px-6 py-3 rounded-md font-medium text-sm transition-colors">
                Sign up free
              </Link>
              <Link href="/test/test-001" className="inline-flex items-center justify-center border border-gray-700 text-gray-300 hover:text-white hover:border-gray-500 px-6 py-3 rounded-md font-medium text-sm transition-colors">
                Try a sample test
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
