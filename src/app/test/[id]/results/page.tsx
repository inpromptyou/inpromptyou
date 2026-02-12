"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import ScoreCard from "@/components/ScoreCard";
import type { ScoringResult } from "@/lib/scoring";

interface StoredMessage {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
}

interface StoredResult extends ScoringResult {
  testName?: string;
  testDescription?: string;
  taskDescription?: string;
  messages?: StoredMessage[];
  timeSpentSeconds?: number;
  tokenBudget?: number;
  maxAttempts?: number;
  timeLimitMinutes?: number;
}

function AttemptTimeline({ messages }: { messages: StoredMessage[] }) {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const pairs: { prompt: StoredMessage; response?: StoredMessage; index: number }[] = [];
  let pairIdx = 0;
  for (let i = 0; i < messages.length; i++) {
    if (messages[i].role === "user") {
      pairs.push({ prompt: messages[i], response: messages[i + 1]?.role === "assistant" ? messages[i + 1] : undefined, index: pairIdx++ });
    }
  }
  if (pairs.length === 0) return null;

  return (
    <div className="space-y-3">
      {pairs.map((pair) => {
        const isExpanded = expandedIdx === pair.index;
        return (
          <div key={pair.index} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
            <button onClick={() => setExpandedIdx(isExpanded ? null : pair.index)} className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors text-left">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-7 h-7 rounded-full bg-[#6366F1] text-white flex items-center justify-center text-xs font-bold shrink-0">{pair.index + 1}</div>
                <p className="text-sm text-gray-900 font-medium truncate max-w-[300px] sm:max-w-[500px]">{pair.prompt.content.slice(0, 80)}{pair.prompt.content.length > 80 ? "…" : ""}</p>
              </div>
              <svg className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </button>
            {isExpanded && (
              <div className="border-t border-gray-100 px-4 py-3 space-y-3">
                <div>
                  <span className="text-[10px] font-semibold text-[#6366F1] uppercase tracking-wide">Your Prompt</span>
                  <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap leading-relaxed">{pair.prompt.content}</p>
                </div>
                {pair.response && (
                  <div>
                    <span className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wide">AI Response</span>
                    <div className="text-sm text-gray-600 mt-1 whitespace-pre-wrap leading-relaxed bg-gray-50 rounded-md p-3 max-h-[300px] overflow-y-auto">{pair.response.content}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ScoreDistributionChart({ userScore }: { userScore: number }) {
  const buckets = [
    { range: "0-19", count: 2, },
    { range: "20-39", count: 5, },
    { range: "40-59", count: 14, },
    { range: "60-79", count: 18, },
    { range: "80-89", count: 8, },
    { range: "90-100", count: 3, },
  ];
  const maxCount = Math.max(...buckets.map((b) => b.count));

  return (
    <div className="space-y-2">
      {buckets.map((b) => {
        const pct = (b.count / maxCount) * 100;
        const [lo, hi] = b.range.split("-").map(Number);
        const isUser = userScore >= lo && userScore <= hi;
        return (
          <div key={b.range} className="flex items-center gap-3">
            <span className="text-[10px] text-gray-400 w-10 text-right font-mono">{b.range}</span>
            <div className="flex-1 h-5 bg-gray-100 rounded-sm overflow-hidden relative">
              <div className={`h-full rounded-sm transition-all duration-1000 ease-out ${isUser ? "bg-[#6366F1]" : "bg-gray-300"}`} style={{ width: `${pct}%` }} />
              {isUser && <span className="absolute right-2 top-0.5 text-[9px] font-bold text-white">YOU</span>}
            </div>
            <span className="text-[10px] text-gray-400 w-6 font-mono">{b.count}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function TestResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [result, setResult] = useState<StoredResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "journey" | "comparison">("overview");
  const [shareTooltip, setShareTooltip] = useState(false);
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem(`test-result-${id}`);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.dimensions) {
          setResult(parsed as StoredResult);
        } else {
          setResult(buildLegacyResult(parsed));
        }
      } catch {
        setResult(null);
      }
    }
    // Check if guest user
    const guest = sessionStorage.getItem(`guest-${id}`);
    if (guest) setShowSignupPrompt(true);
    setLoading(false);
  }, [id]);

  const handleShare = async () => {
    const text = result
      ? `I scored ${result.promptScore}/100 (Grade: ${result.letterGrade}) on "${result.testName || "InpromptiFy"}"! 🧠\n\nBetter than ${result.percentile}% of candidates.\n\nTest your AI prompting skills → InpromptiFy.ai`
      : "";
    if (navigator.share) {
      try { await navigator.share({ title: "My PromptScore™", text }); } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(text);
      setShareTooltip(true);
      setTimeout(() => setShareTooltip(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-[#6366F1] border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-sm text-gray-400">Calculating your score...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-sm mb-4">No results found for this test session.</p>
          <Link href="/" className="text-sm text-[#6366F1] hover:text-[#4F46E5] font-medium">← Back to Home</Link>
        </div>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const timeTaken = result.stats.timeSpentSeconds || result.timeSpentSeconds || 0;
  const messages = result.messages || [];
  const testName = result.testName || "Test";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-5 py-3 flex items-center justify-between">
          <Link href="/" className="font-bold text-base text-gray-900">InpromptiFy</Link>
          <span className="text-xs text-gray-400">Assessment Results</span>
        </div>
      </div>

      {/* Guest signup prompt */}
      {showSignupPrompt && (
        <div className="bg-[#6366F1]/5 border-b border-[#6366F1]/10">
          <div className="max-w-3xl mx-auto px-5 py-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#6366F1]">Create an account to save your PromptScore™</p>
              <p className="text-xs text-gray-500 mt-0.5">Appear on the leaderboard and track your progress</p>
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/signup?link=${id}`} className="bg-[#6366F1] hover:bg-[#4F46E5] text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">Sign Up</Link>
              <button onClick={() => setShowSignupPrompt(false)} className="text-gray-400 hover:text-gray-600 text-sm px-2">Dismiss</button>
            </div>
          </div>
        </div>
      )}

      {/* Test Info Banner */}
      <div className="bg-[#0A0F1C] text-white">
        <div className="max-w-3xl mx-auto px-5 py-6">
          <h1 className="text-lg font-bold mb-1">{testName}</h1>
          {result.testDescription && <p className="text-sm text-gray-300 leading-relaxed mb-3">{result.testDescription}</p>}
          <div className="flex flex-wrap gap-4 text-xs text-gray-400">
            <span>⏱ {formatTime(timeTaken)} / {result.stats.timeLimitMinutes}:00</span>
            <span>📝 {result.stats.attemptsUsed} of {result.stats.maxAttempts} attempts</span>
            <span>🪙 {result.stats.tokensUsed.toLocaleString()} / {result.stats.tokenBudget.toLocaleString()} tokens</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-5 flex gap-0">
          {([{ key: "overview", label: "Overview" }, { key: "journey", label: "Your Journey" }, { key: "comparison", label: "Comparison" }] as const).map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.key ? "border-[#6366F1] text-[#6366F1]" : "border-transparent text-gray-400 hover:text-gray-600"}`}>{tab.label}</button>
          ))}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-5 py-8">
        {activeTab === "overview" && (
          <div className="space-y-6">
            <ScoreCard result={result} testName={testName} />
          </div>
        )}

        {activeTab === "journey" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-sm font-semibold text-gray-900 mb-1">Your Prompt Journey</h2>
              <p className="text-xs text-gray-400 mb-4">
                {messages.length > 0 ? `You made ${Math.ceil(messages.length / 2)} prompt attempt${Math.ceil(messages.length / 2) !== 1 ? "s" : ""}.` : "No prompt history available."}
              </p>
              {messages.length > 0 ? <AttemptTimeline messages={messages} /> : (
                <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                  <p className="text-gray-400 text-sm">Prompt history is only available for sessions completed in this browser tab.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "comparison" && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-5 text-center">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Your Percentile</p>
              <div className="text-5xl font-bold text-[#6366F1] mb-1">{result.percentile}<span className="text-lg text-gray-400 font-normal">th</span></div>
              <p className="text-sm text-gray-500">You scored higher than {result.percentile}% of all candidates</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Score Distribution</h3>
              <ScoreDistributionChart userScore={result.promptScore} />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-2">
          <div className="relative">
            <button onClick={handleShare} className="w-full bg-[#6366F1] hover:bg-[#4F46E5] text-white px-3 py-2.5 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-1.5">Share</button>
            {shareTooltip && <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-10">Copied!</div>}
          </div>
          <Link href="/" className="bg-white border border-gray-200 hover:border-gray-300 text-gray-700 px-3 py-2.5 rounded-md text-sm font-medium transition-colors text-center">Try Another</Link>
          <Link href="/jobs" className="bg-white border border-gray-200 hover:border-gray-300 text-gray-700 px-3 py-2.5 rounded-md text-sm font-medium transition-colors text-center">Job Board</Link>
        </div>
      </div>
    </div>
  );
}

function makeDimension(score: number, weight: number) {
  return { score, weight, weightedScore: Math.round(score * weight), strengths: [] as string[], weaknesses: [] as string[], suggestions: [] as string[] };
}

function buildLegacyResult(data: Record<string, unknown>): StoredResult {
  const ps = (data.promptScore as number) || 60;
  return {
    promptScore: ps,
    letterGrade: ps >= 95 ? "S" : ps >= 80 ? "A" : ps >= 65 ? "B" : ps >= 50 ? "C" : ps >= 35 ? "D" : "F",
    percentile: (data.percentile as number) || 50,
    dimensions: {
      promptQuality: makeDimension((data.accuracy as number) || ps, 0.3),
      efficiency: makeDimension((data.efficiency as number) || ps, 0.15),
      speed: makeDimension((data.speed as number) || ps, 0.15),
      responseQuality: makeDimension(ps, 0.25),
      iterationIQ: makeDimension(ps, 0.15),
    },
    feedback: { summary: "Score imported from a previous version.", topStrengths: [], topWeaknesses: [], improvementPlan: [] },
    stats: {
      attemptsUsed: (data.attemptsUsed as number) || 0,
      tokensUsed: (data.tokensUsed as number) || 0,
      timeSpentSeconds: (data.timeSpentSeconds as number) || 0,
      maxAttempts: (data.maxAttempts as number) || 5,
      tokenBudget: (data.tokenBudget as number) || 2000,
      timeLimitMinutes: (data.timeLimitMinutes as number) || 15,
      totalPrompts: (data.attemptsUsed as number) || 0,
      avgPromptLength: 0,
      totalResponseLength: 0,
    },
    criteriaUsed: "Legacy",
    evaluatedAt: new Date().toISOString(),
    testName: data.testName as string,
    testDescription: data.testDescription as string,
    messages: (data.messages as StoredMessage[]) || [],
  };
}
