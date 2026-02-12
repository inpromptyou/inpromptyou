"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const DEMO_TASK = {
  name: "Write a Marketing Email",
  model: "GPT-4o",
  description: "Craft a compelling product launch email for a B2B SaaS tool targeting enterprise CTOs. The email should drive demo bookings while maintaining a professional tone.",
  taskDescription: "Write a product launch announcement email for 'CloudSync Pro', a new enterprise data synchronization platform. Target audience: CTOs at companies with 500+ employees. Goal: Drive demo bookings. Include subject line, preview text, and full email body.",
  maxAttempts: 3,
  timeLimitMinutes: 5,
  tokenBudget: 1500,
};

const MOCK_RESPONSES = [
  `Subject: Your data sync takes 23 hours/week. Let's fix that.

Preview: CloudSync Pro — real-time bi-directional sync across your entire stack.

Dear [Name],

Enterprise teams lose an average of 23 hours weekly to fragmented data systems. CloudSync Pro delivers real-time bi-directional sync across your entire stack — from Salesforce to Snowflake, SAP to PostgreSQL.

**Why CTOs are switching:**
- 99.9% uptime SLA with zero-downtime migrations
- SOC 2 Type II certified, end-to-end encryption
- 3x faster than legacy ETL pipelines

"We cut our data reconciliation time from 6 hours to 12 minutes." — VP Engineering, Fortis Health

**Book a 15-minute demo** and see CloudSync Pro handle your exact data topology.

[Book Your Demo →]

Best,
The CloudSync Team`,
  `Great refinement! Here's the updated version with your feedback incorporated:

Subject: Stop losing $47K/month to broken data sync

Preview: CloudSync Pro — enterprise data sync that actually works.

Hi [First Name],

Every manual data reconciliation is a silent tax on your engineering team. At scale, it adds up: the average enterprise spends $47K/month on data sync workarounds.

CloudSync Pro eliminates that entirely:

✅ Real-time bi-directional sync across 200+ connectors
✅ Self-healing pipelines with automatic conflict resolution  
✅ Deploy in hours, not months — no code changes required

Fortune 500 companies like Meridian Health and Atlas Financial already made the switch.

I'd love to show you a live demo with your actual data sources. Pick a time that works:

[Schedule 15-Min Demo →]

— Sarah Chen, Solutions Engineer`,
  `Here's the final polished version:

Subject: [First Name], your competitors already fixed their data problem

Preview: See why 200+ enterprises chose CloudSync Pro this quarter.

Hi [First Name],

I'll keep this brief — I know your inbox is full.

Your competitors are already using real-time data sync. While your team spends hours on manual reconciliation, they're shipping features.

**CloudSync Pro in 30 seconds:**
- Connects everything: 200+ native integrations
- Self-healing: automatic conflict resolution, zero manual intervention  
- Enterprise-grade: SOC 2, HIPAA, GDPR compliant
- Fast: average deployment in 4 hours

**The proof:** Fortis Health reduced data lag from 6 hours to real-time. Atlas Financial saved $560K/year.

One 15-minute demo. That's all I'm asking.

[Book Demo →] | [See Case Studies →]

Sarah Chen
Solutions Engineering, CloudSync
sarah@cloudsync.pro`,
];

export default function DemoTestPage() {
  const [phase, setPhase] = useState<"intro" | "sandbox" | "results">("intro");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(DEMO_TASK.timeLimitMinutes * 60);
  const [tokensUsed, setTokensUsed] = useState(0);
  const chatRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const attemptsUsed = messages.filter((m) => m.role === "user").length;
  const attemptsLeft = DEMO_TASK.maxAttempts - attemptsUsed;

  useEffect(() => {
    if (phase === "sandbox" && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(timerRef.current);
            setPhase("results");
            return 0;
          }
          return t - 1;
        });
      }, 1000);
      return () => clearInterval(timerRef.current);
    }
  }, [phase, timeLeft]);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  const handleSend = async () => {
    if (!input.trim() || sending || attemptsLeft <= 0) return;
    const prompt = input.trim();
    setInput("");
    setSending(true);

    const newMessages: Message[] = [...messages, { role: "user", content: prompt }];
    setMessages(newMessages);

    // Simulate API delay
    await new Promise((r) => setTimeout(r, 1500 + Math.random() * 1000));

    const responseIdx = Math.min(attemptsUsed, MOCK_RESPONSES.length - 1);
    const response = MOCK_RESPONSES[responseIdx];
    const newTokens = 180 + Math.floor(Math.random() * 120);
    setTokensUsed((t) => t + newTokens);
    setMessages([...newMessages, { role: "assistant", content: response }]);
    setSending(false);
  };

  const score = Math.min(100, 45 + attemptsUsed * 15 + Math.floor(Math.random() * 10));

  if (phase === "results") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-5">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center mb-5">
            <h1 className="text-xl font-bold text-gray-900 mb-2">Demo Complete!</h1>
            <p className="text-sm text-gray-500 mb-6">Here&apos;s how you did on the sample test</p>

            <div className="w-24 h-24 rounded-full bg-emerald-50 ring-2 ring-emerald-200 flex items-center justify-center text-3xl font-bold text-emerald-700 mx-auto mb-2">
              {score}
            </div>
            <p className="text-xs text-gray-400 mb-6">Prompt Score</p>

            <div className="grid grid-cols-3 gap-3 mb-6 text-center">
              <div className="bg-gray-50 rounded-md p-3">
                <div className="text-lg font-bold text-gray-900">{attemptsUsed}</div>
                <div className="text-[10px] text-gray-400">Prompts</div>
              </div>
              <div className="bg-gray-50 rounded-md p-3">
                <div className="text-lg font-bold text-gray-900">{tokensUsed}</div>
                <div className="text-[10px] text-gray-400">Tokens</div>
              </div>
              <div className="bg-gray-50 rounded-md p-3">
                <div className="text-lg font-bold text-gray-900">{formatTime(DEMO_TASK.timeLimitMinutes * 60 - timeLeft)}</div>
                <div className="text-[10px] text-gray-400">Time</div>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-6">
              This was just a demo with simulated responses. Real tests use live AI models and our scoring engine analyzes prompt quality, efficiency, and iteration intelligence.
            </p>
          </div>

          <div className="bg-[#0C2A3A] rounded-lg p-6 text-center">
            <h2 className="text-lg font-bold text-white mb-2">Ready to create your own tests?</h2>
            <p className="text-sm text-gray-400 mb-4">Set up an assessment in under 5 minutes. Free plan includes 3 tests/month.</p>
            <div className="flex flex-col gap-2">
              <Link href="/signup" className="bg-[#1B5B7D] hover:bg-[#14455E] text-white px-5 py-2.5 rounded-md text-sm font-medium transition-colors">
                Sign up for free
              </Link>
              <Link href="/" className="text-gray-400 hover:text-white text-sm transition-colors">
                Back to homepage
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "intro") {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-3xl mx-auto px-5 py-4 flex items-center justify-between">
            <Link href="/" className="font-bold text-base text-gray-900">InpromptiFy</Link>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-100 text-amber-700">Demo</span>
          </div>
        </div>

        <div className="max-w-lg mx-auto px-5 py-14">
          <div className="mb-8">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">{DEMO_TASK.model} · Demo</span>
            <h1 className="text-2xl font-bold text-gray-900 mt-1 mb-2">{DEMO_TASK.name}</h1>
            <p className="text-sm text-gray-600 leading-relaxed">{DEMO_TASK.description}</p>
          </div>

          <div className="grid grid-cols-4 gap-3 mb-8">
            {[
              { label: "Time", value: `${DEMO_TASK.timeLimitMinutes}m` },
              { label: "Attempts", value: DEMO_TASK.maxAttempts.toString() },
              { label: "Tokens", value: DEMO_TASK.tokenBudget.toLocaleString() },
              { label: "Model", value: DEMO_TASK.model },
            ].map((info) => (
              <div key={info.label} className="bg-white rounded-md border border-gray-200 p-3 text-center">
                <div className="text-[10px] text-gray-400 uppercase tracking-wide">{info.label}</div>
                <div className="font-bold text-gray-900 text-sm mt-0.5">{info.value}</div>
              </div>
            ))}
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-6">
            <p className="text-sm text-amber-800">
              <strong>This is a demo.</strong> No login required. Responses are simulated. Real tests use live AI models with full scoring.
            </p>
          </div>

          <button
            onClick={() => setPhase("sandbox")}
            className="w-full bg-[#1B5B7D] hover:bg-[#14455E] text-white py-3 rounded-md text-sm font-medium transition-colors"
          >
            Start Demo Test
          </button>
        </div>
      </div>
    );
  }

  // Sandbox phase
  return (
    <div className="h-screen flex flex-col bg-gray-950">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-gray-900 border-b border-gray-800 text-xs text-gray-400 shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/" className="font-bold text-white text-sm">InpromptiFy</Link>
          <span className="px-1.5 py-0.5 rounded bg-amber-900/50 text-amber-400 text-[10px] font-medium">DEMO</span>
        </div>
        <div className="flex items-center gap-5">
          <span>Attempts: <span className="text-white font-medium">{attemptsUsed}/{DEMO_TASK.maxAttempts}</span></span>
          <span>Tokens: <span className="text-white font-medium">{tokensUsed}/{DEMO_TASK.tokenBudget}</span></span>
          <span>Time: <span className={`font-medium ${timeLeft < 60 ? "text-red-400" : "text-amber-400"}`}>{formatTime(timeLeft)}</span></span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Task panel */}
        <div className="w-80 bg-gray-900 border-r border-gray-800 p-5 overflow-auto hidden md:block shrink-0">
          <h2 className="text-sm font-semibold text-white mb-2">{DEMO_TASK.name}</h2>
          <p className="text-xs text-gray-400 leading-relaxed mb-4">{DEMO_TASK.taskDescription}</p>
          <div className="bg-gray-800 rounded-md p-3">
            <h3 className="text-[10px] uppercase tracking-wide text-gray-500 mb-1">Tip</h3>
            <p className="text-xs text-gray-400">Be specific about your target audience, desired tone, and required elements. Good prompts produce better results in fewer attempts.</p>
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col">
          <div ref={chatRef} className="flex-1 overflow-auto p-5 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-600 text-sm mt-20">
                <p className="mb-1">Send your first prompt to get started.</p>
                <p className="text-xs text-gray-700">You have {DEMO_TASK.maxAttempts} attempts. Make them count!</p>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] rounded-lg px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                  m.role === "user"
                    ? "bg-[#1B5B7D] text-white"
                    : "bg-gray-800 text-gray-300"
                }`}>
                  {m.role === "assistant" && <span className="text-gray-500 text-[10px] block mb-1.5">{DEMO_TASK.model}</span>}
                  {m.content}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="bg-gray-800 text-gray-500 rounded-lg px-4 py-3 text-sm">
                  <span className="animate-pulse">Generating response...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-800 bg-gray-900">
            {attemptsLeft > 0 ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                  placeholder="Type your prompt..."
                  className="flex-1 bg-gray-800 text-white rounded-md px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B5B7D] placeholder-gray-600"
                  disabled={sending}
                />
                <button
                  onClick={handleSend}
                  disabled={sending || !input.trim()}
                  className="bg-[#1B5B7D] hover:bg-[#14455E] disabled:opacity-40 text-white px-4 py-2.5 rounded-md text-sm font-medium transition-colors"
                >
                  Send
                </button>
                {messages.length > 0 && (
                  <button
                    onClick={() => setPhase("results")}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-md text-sm font-medium transition-colors"
                  >
                    Submit
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center">
                <p className="text-sm text-gray-400 mb-2">No attempts remaining</p>
                <button
                  onClick={() => setPhase("results")}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-md text-sm font-medium transition-colors"
                >
                  View Results
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
