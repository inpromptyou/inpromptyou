"use client";

import { useState, useEffect, useRef, use, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { mockTests } from "@/lib/mockData";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

type SandboxState = "ready" | "active" | "submitting" | "submitted" | "timeup";

export default function TestSandboxPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const test = mockTests.find((t) => t.id === id) || mockTests[0];

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [tokensUsed, setTokensUsed] = useState(0);
  const [timeLeft, setTimeLeft] = useState(test.timeLimitMinutes * 60);
  const [isTyping, setIsTyping] = useState(false);
  const [sandboxState, setSandboxState] = useState<SandboxState>("ready");
  const [error, setError] = useState<string | null>(null);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showMobileTask, setShowMobileTask] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const startTimeRef = useRef<number>(Date.now());

  // Timer
  useEffect(() => {
    if (sandboxState !== "active" && sandboxState !== "ready") return;
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setSandboxState("timeup");
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [sandboxState]);

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 160) + "px";
    }
  }, [input]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const sendMessage = useCallback(async () => {
    if (!input.trim() || isTyping || attempts >= test.maxAttempts || timeLeft === 0)
      return;

    const promptText = input.trim();
    const userMsg: Message = {
      role: "user",
      content: promptText,
      timestamp: new Date().toISOString(),
    };
    const newAttempt = attempts + 1;

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setAttempts(newAttempt);
    setIsTyping(true);
    setError(null);
    if (sandboxState === "ready") setSandboxState("active");

    try {
      const res = await fetch("/api/test/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: promptText,
          testId: test.id,
          taskDescription: test.taskDescription,
          attemptNumber: newAttempt,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to get AI response");
      }

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.response,
          timestamp: data.timestamp,
        },
      ]);
      setTokensUsed((t) => t + (data.tokensUsed?.total || 0));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Try again."
      );
    } finally {
      setIsTyping(false);
    }
  }, [input, isTyping, attempts, test, timeLeft, sandboxState]);

  const handleFinalSubmit = async () => {
    if (messages.length === 0) return;
    setSandboxState("submitting");
    setShowSubmitConfirm(false);

    const timeSpentSeconds =
      test.timeLimitMinutes * 60 - timeLeft;

    try {
      const res = await fetch("/api/test/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          testId: test.id,
          messages,
          attemptsUsed: attempts,
          tokensUsed,
          timeSpentSeconds,
          maxAttempts: test.maxAttempts,
          tokenBudget: test.tokenBudget,
          timeLimitMinutes: test.timeLimitMinutes,
          taskDescription: test.taskDescription,
          expectedOutcome: test.expectedOutcome,
        }),
      });

      if (!res.ok) throw new Error("Evaluation failed");

      const scores = await res.json();

      // Store scores + messages in sessionStorage for results page
      sessionStorage.setItem(
        `test-result-${test.id}`,
        JSON.stringify({
          ...scores,
          testName: test.name,
          testDescription: test.description,
          taskDescription: test.taskDescription,
          tokenBudget: test.tokenBudget,
          maxAttempts: test.maxAttempts,
          timeLimitMinutes: test.timeLimitMinutes,
          messages,
          timeSpentSeconds: timeSpentSeconds,
        })
      );

      setSandboxState("submitted");
      router.push(`/test/${test.id}/results`);
    } catch {
      setError("Failed to submit. Please try again.");
      setSandboxState("active");
    }
  };

  // Auto-submit on time up
  useEffect(() => {
    if (sandboxState === "timeup" && messages.length > 0) {
      handleFinalSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sandboxState]);

  const timeWarning = timeLeft < 120;
  const timeCritical = timeLeft < 30;
  const tokensWarning = tokensUsed > test.tokenBudget * 0.8;
  const attemptsWarning = attempts >= test.maxAttempts - 1;
  const isDisabled =
    attempts >= test.maxAttempts ||
    timeLeft === 0 ||
    sandboxState === "submitting" ||
    sandboxState === "submitted";

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 px-3 sm:px-4 py-2.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Link
            href="/"
            className="font-bold text-sm text-gray-900 shrink-0"
          >
            InpromptiFy
          </Link>
          <span className="text-xs text-gray-300 hidden sm:inline">|</span>
          <div className="min-w-0 hidden sm:block">
            <span className="text-sm font-medium text-gray-900 truncate">
              {test.name}
            </span>
            <span className="text-xs text-gray-400 ml-2">{test.model}</span>
          </div>
          {/* Mobile task toggle */}
          <button
            onClick={() => setShowMobileTask(!showMobileTask)}
            className="md:hidden text-xs text-[#1B5B7D] font-medium px-2 py-1 rounded border border-[#1B5B7D]/20 hover:bg-[#1B5B7D]/5"
          >
            {showMobileTask ? "Chat" : "Task"}
          </button>
        </div>

        {/* Counters */}
        <div className="flex items-center gap-2 sm:gap-5">
          <div className="text-center hidden sm:block">
            <div className="text-[10px] text-gray-400 uppercase tracking-wide">
              Attempts
            </div>
            <div
              className={`text-sm font-mono font-bold ${attemptsWarning ? "text-red-500" : "text-gray-900"}`}
            >
              {attempts}/{test.maxAttempts}
            </div>
          </div>
          <div className="text-center hidden sm:block">
            <div className="text-[10px] text-gray-400 uppercase tracking-wide">
              Tokens
            </div>
            <div
              className={`text-sm font-mono font-bold ${tokensWarning ? "text-red-500" : "text-gray-900"}`}
            >
              {tokensUsed.toLocaleString()}/{test.tokenBudget.toLocaleString()}
            </div>
          </div>
          <div className="text-center">
            <div className="text-[10px] text-gray-400 uppercase tracking-wide">
              Time
            </div>
            <div
              className={`text-sm font-mono font-bold ${
                timeCritical
                  ? "text-red-500 animate-pulse"
                  : timeWarning
                    ? "text-red-500"
                    : "text-gray-900"
              }`}
            >
              {formatTime(timeLeft)}
            </div>
          </div>
          <button
            onClick={() =>
              messages.length > 0
                ? setShowSubmitConfirm(true)
                : undefined
            }
            disabled={messages.length === 0 || sandboxState === "submitting"}
            className="bg-[#10B981] hover:bg-[#059669] disabled:bg-gray-200 disabled:text-gray-400 text-white px-3 sm:px-4 py-1.5 rounded-md text-sm font-medium transition-colors"
          >
            {sandboxState === "submitting" ? (
              <span className="flex items-center gap-1.5">
                <svg
                  className="animate-spin h-3.5 w-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Scoring...
              </span>
            ) : (
              "Submit Final"
            )}
          </button>
        </div>
      </div>

      {/* Mobile stats bar */}
      <div className="sm:hidden bg-white border-b border-gray-100 px-3 py-1.5 flex items-center justify-between text-xs">
        <span className={attemptsWarning ? "text-red-500 font-bold" : "text-gray-500"}>
          {attempts}/{test.maxAttempts} attempts
        </span>
        <span className={tokensWarning ? "text-red-500 font-bold" : "text-gray-500"}>
          {tokensUsed.toLocaleString()} tokens
        </span>
        <span className="text-gray-400">{test.model}</span>
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Submit Final Answer?
            </h3>
            <p className="text-sm text-gray-500 mb-1">
              This will end the test and score your responses.
            </p>
            <p className="text-xs text-gray-400 mb-5">
              {attempts} attempt{attempts !== 1 ? "s" : ""} used •{" "}
              {tokensUsed.toLocaleString()} tokens •{" "}
              {formatTime(test.timeLimitMinutes * 60 - timeLeft)} elapsed
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowSubmitConfirm(false)}
                className="flex-1 border border-gray-200 hover:border-gray-300 text-gray-700 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Keep Working
              </button>
              <button
                onClick={handleFinalSubmit}
                className="flex-1 bg-[#10B981] hover:bg-[#059669] text-white py-2 rounded-md text-sm font-medium transition-colors"
              >
                Submit & Score
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content — Split Pane */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Task Description */}
        <div
          className={`${
            showMobileTask ? "block" : "hidden"
          } md:block w-full md:w-[360px] shrink-0 bg-white border-r border-gray-200 overflow-y-auto`}
        >
          <div className="p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">
              Task Description
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-5">
              {test.taskDescription}
            </p>

            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Expected Outcome
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-5">
              {test.expectedOutcome}
            </p>

            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Scoring Criteria
            </h3>
            <div className="space-y-2">
              {[
                {
                  label: "Accuracy (35%)",
                  desc: "Output quality vs. expected outcome",
                  color: "bg-emerald-500",
                },
                {
                  label: "Efficiency (30%)",
                  desc: "Token usage minimization",
                  color: "bg-blue-500",
                },
                {
                  label: "Speed (20%)",
                  desc: "Complete within time limit",
                  color: "bg-purple-500",
                },
                {
                  label: "Attempts (15%)",
                  desc: "Fewer prompts = higher score",
                  color: "bg-amber-500",
                },
              ].map((c) => (
                <div
                  key={c.label}
                  className="bg-gray-50 rounded-md px-3 py-2 flex items-start gap-2"
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${c.color} mt-1.5 shrink-0`}
                  />
                  <div>
                    <div className="text-xs font-medium text-gray-900">
                      {c.label}
                    </div>
                    <div className="text-[11px] text-gray-400">{c.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 p-3 bg-[#1B5B7D]/5 rounded-md border border-[#1B5B7D]/10">
              <p className="text-xs text-[#1B5B7D] leading-relaxed">
                <strong>Tip:</strong> Write clear, specific prompts. Include
                context about your target audience, desired format, and
                constraints. Quality over quantity — fewer well-crafted
                prompts score higher.
              </p>
            </div>
          </div>
        </div>

        {/* Right: AI Chat Interface */}
        <div
          className={`${
            showMobileTask ? "hidden" : "flex"
          } md:flex flex-1 flex-col`}
        >
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
            {messages.length === 0 && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center max-w-xs">
                  <div className="w-12 h-12 rounded-full bg-[#1B5B7D]/10 flex items-center justify-center mx-auto mb-3">
                    <svg
                      className="w-6 h-6 text-[#1B5B7D]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-sm font-medium text-gray-900 mb-1">
                    Ready to begin
                  </h3>
                  <p className="text-xs text-gray-400">
                    Type your first prompt to start interacting with{" "}
                    {test.model}. Read the task description{" "}
                    <span className="hidden md:inline">on the left</span>
                    <button
                      onClick={() => setShowMobileTask(true)}
                      className="md:hidden text-[#1B5B7D] underline"
                    >
                      here
                    </button>{" "}
                    for instructions.
                  </p>
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[80%] rounded-lg px-4 py-2.5 ${
                    msg.role === "user"
                      ? "bg-[#1B5B7D] text-white"
                      : "bg-white border border-gray-200 text-gray-800"
                  }`}
                >
                  {msg.role === "assistant" && (
                    <span className="text-[10px] font-medium text-gray-400 block mb-1">
                      {test.model}
                    </span>
                  )}
                  <div className="text-sm leading-relaxed whitespace-pre-wrap">
                    {msg.content}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-lg px-4 py-2.5">
                  <span className="text-[10px] font-medium text-gray-400 block mb-1">
                    {test.model}
                  </span>
                  <div className="flex gap-1">
                    <span
                      className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <span
                      className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <span
                      className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="flex justify-center">
                <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-2 text-sm">
                  {error}
                  <button
                    onClick={() => setError(null)}
                    className="ml-2 text-red-400 hover:text-red-600"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 bg-white p-3">
            {isDisabled && sandboxState !== "submitting" ? (
              <div className="text-center py-2">
                <p className="text-sm text-gray-500">
                  {timeLeft === 0
                    ? "⏰ Time's up! Submitting your responses..."
                    : attempts >= test.maxAttempts
                      ? "Maximum attempts reached. Submit your final answer above."
                      : "Test completed."}
                </p>
              </div>
            ) : (
              <div className="flex gap-2 items-end">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder={
                    sandboxState === "submitting"
                      ? "Scoring in progress..."
                      : "Type your prompt... (Enter to send, Shift+Enter for new line)"
                  }
                  disabled={isDisabled || isTyping}
                  rows={1}
                  className="flex-1 border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B5B7D] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-300 resize-none"
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || isTyping || isDisabled}
                  className="bg-[#1B5B7D] hover:bg-[#14455E] disabled:bg-gray-200 disabled:text-gray-400 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors shrink-0"
                >
                  {isTyping ? (
                    <svg
                      className="animate-spin h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                  ) : (
                    "Send"
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
