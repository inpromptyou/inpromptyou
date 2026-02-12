"use client";

import { useState, useEffect, use, useRef } from "react";
import Link from "next/link";
import { mockTests, mockCandidates } from "@/lib/mockData";
import ScoreCard from "@/components/ScoreCard";
import type { ScoringResult } from "@/lib/scoring";
import type { Test } from "@/lib/mockData";

// ─── Types ───────────────────────────────────────────────────────────────────

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
}

// ─── Distribution Chart (SVG bar chart) ──────────────────────────────────────

function ScoreDistributionChart({ userScore }: { userScore: number }) {
  // Mock distribution data: score ranges and candidate counts
  const buckets = [
    { range: "0-19", count: 2, mid: 10 },
    { range: "20-39", count: 5, mid: 30 },
    { range: "40-59", count: 14, mid: 50 },
    { range: "60-79", count: 18, mid: 70 },
    { range: "80-89", count: 8, mid: 85 },
    { range: "90-100", count: 3, mid: 95 },
  ];
  const maxCount = Math.max(...buckets.map((b) => b.count));
  const userBucketIdx = buckets.findIndex(
    (b) => userScore >= b.mid - (b.range === "90-100" ? 5 : 10) && userScore <= b.mid + 10
  );

  return (
    <div className="space-y-2">
      {buckets.map((b, i) => {
        const pct = (b.count / maxCount) * 100;
        const isUser =
          i === userBucketIdx ||
          (userScore >= parseInt(b.range) &&
            userScore <= parseInt(b.range.split("-")[1]));
        return (
          <div key={b.range} className="flex items-center gap-3">
            <span className="text-[10px] text-gray-400 w-10 text-right font-mono">
              {b.range}
            </span>
            <div className="flex-1 h-5 bg-gray-100 rounded-sm overflow-hidden relative">
              <div
                className={`h-full rounded-sm transition-all duration-1000 ease-out ${
                  isUser ? "bg-[#6366F1]" : "bg-gray-300"
                }`}
                style={{ width: `${pct}%` }}
              />
              {isUser && (
                <span className="absolute right-2 top-0.5 text-[9px] font-bold text-white">
                  YOU
                </span>
              )}
            </div>
            <span className="text-[10px] text-gray-400 w-6 font-mono">
              {b.count}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Attempt Timeline ────────────────────────────────────────────────────────

function AttemptTimeline({ messages }: { messages: StoredMessage[] }) {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  // Group into pairs: user prompt → assistant response
  const pairs: { prompt: StoredMessage; response?: StoredMessage; index: number }[] = [];
  let pairIdx = 0;
  for (let i = 0; i < messages.length; i++) {
    if (messages[i].role === "user") {
      pairs.push({
        prompt: messages[i],
        response: messages[i + 1]?.role === "assistant" ? messages[i + 1] : undefined,
        index: pairIdx++,
      });
    }
  }

  if (pairs.length === 0) return null;

  return (
    <div className="space-y-3">
      {pairs.map((pair) => {
        const isExpanded = expandedIdx === pair.index;
        const ts = pair.prompt.timestamp
          ? new Date(pair.prompt.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })
          : null;

        return (
          <div
            key={pair.index}
            className="border border-gray-200 rounded-lg overflow-hidden bg-white"
          >
            {/* Header */}
            <button
              onClick={() => setExpandedIdx(isExpanded ? null : pair.index)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors text-left"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-7 h-7 rounded-full bg-[#6366F1] text-white flex items-center justify-center text-xs font-bold shrink-0">
                  {pair.index + 1}
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-gray-900 font-medium truncate max-w-[300px] sm:max-w-[500px]">
                    {pair.prompt.content.slice(0, 80)}
                    {pair.prompt.content.length > 80 ? "…" : ""}
                  </p>
                  {ts && (
                    <p className="text-[10px] text-gray-400 mt-0.5">{ts}</p>
                  )}
                </div>
              </div>
              <svg
                className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${
                  isExpanded ? "rotate-180" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Expanded content */}
            {isExpanded && (
              <div className="border-t border-gray-100 px-4 py-3 space-y-3">
                <div>
                  <span className="text-[10px] font-semibold text-[#6366F1] uppercase tracking-wide">
                    Your Prompt
                  </span>
                  <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap leading-relaxed">
                    {pair.prompt.content}
                  </p>
                </div>
                {pair.response && (
                  <div>
                    <span className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wide">
                      AI Response
                    </span>
                    <div className="text-sm text-gray-600 mt-1 whitespace-pre-wrap leading-relaxed bg-gray-50 rounded-md p-3 max-h-[300px] overflow-y-auto">
                      {pair.response.content}
                    </div>
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

// ─── Employer View Panel ─────────────────────────────────────────────────────

function EmployerPanel({
  result,
  test,
}: {
  result: ScoringResult;
  test: Test;
}) {
  const [showPanel, setShowPanel] = useState(false);
  const candidates = mockCandidates
    .filter((c) => c.testId === test.id)
    .sort((a, b) => b.promptScore - a.promptScore);

  const candidateRank =
    candidates.filter((c) => c.promptScore > result.promptScore).length + 1;

  return (
    <div className="bg-white rounded-lg border border-amber-200 overflow-hidden">
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-amber-50/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-amber-600">👔</span>
          <span className="text-sm font-semibold text-gray-900">
            Employer View
          </span>
          <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">
            TEST CREATOR
          </span>
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${showPanel ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showPanel && (
        <div className="border-t border-amber-100 px-5 py-4 space-y-4">
          {/* Ranking */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Candidate Ranking
            </h4>
            <p className="text-sm text-gray-700">
              This candidate ranked{" "}
              <span className="font-bold text-[#6366F1]">
                #{candidateRank}
              </span>{" "}
              out of {candidates.length + 1} candidates for this test.
            </p>
          </div>

          {/* Top candidates comparison */}
          {candidates.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Top Candidates
              </h4>
              <div className="space-y-1.5">
                {candidates.slice(0, 5).map((c, i) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 w-4">
                        #{i + 1}
                      </span>
                      <span className="text-gray-700">{c.name}</span>
                    </div>
                    <span className="font-mono font-bold text-gray-900">
                      {c.promptScore}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Flags */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Flagged Items
            </h4>
            {result.promptScore < 40 ? (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">
                <span>🚩</span>
                <span>Low score — candidate may need additional assessment</span>
              </div>
            ) : result.stats.attemptsUsed >= result.stats.maxAttempts ? (
              <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-md">
                <span>⚠️</span>
                <span>Used all available attempts</span>
              </div>
            ) : (
              <p className="text-sm text-gray-400">No flags for this submission.</p>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 pt-2">
            <button className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-md text-sm font-medium transition-colors">
              ✓ Shortlist
            </button>
            <button className="flex-1 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 py-2 rounded-md text-sm font-medium transition-colors">
              Maybe
            </button>
            <button className="flex-1 bg-white border border-red-200 hover:bg-red-50 text-red-600 py-2 rounded-md text-sm font-medium transition-colors">
              ✗ Reject
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Results Page ───────────────────────────────────────────────────────

export default function TestResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const test = mockTests.find((t) => t.id === id) || mockTests[0];
  const [result, setResult] = useState<StoredResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "journey" | "comparison">("overview");
  const [isEmployer] = useState(true); // Mock: toggle employer view
  const [shareTooltip, setShareTooltip] = useState(false);
  const [downloadingReport, setDownloadingReport] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem(`test-result-${id}`);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.dimensions) {
          setResult(parsed as StoredResult);
        } else {
          setResult(buildLegacyResult(parsed, test));
        }
      } catch {
        setResult(buildDefaultResult(test));
      }
    } else {
      setResult(buildDefaultResult(test));
    }
    setLoading(false);
  }, [id, test]);

  const handleShare = async () => {
    const text = result
      ? `I scored ${result.promptScore}/100 (Grade: ${result.letterGrade}) on "${test.name}" at InpromptiFy! 🧠\n\nBetter than ${result.percentile}% of candidates.\n\nTest your AI prompting skills → InpromptiFy.ai`
      : "";
    if (navigator.share) {
      try {
        await navigator.share({ title: "My PromptScore™", text });
      } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(text);
      setShareTooltip(true);
      setTimeout(() => setShareTooltip(false), 2000);
    }
  };

  const handleDownloadReport = () => {
    if (!result) return;
    setDownloadingReport(true);

    const dims = result.dimensions;
    const report = [
      `InpromptiFy — ASSESSMENT REPORT`,
      `================================`,
      ``,
      `Test: ${test.name}`,
      `Description: ${test.description}`,
      `Date: ${result.evaluatedAt ? new Date(result.evaluatedAt).toLocaleDateString() : new Date().toLocaleDateString()}`,
      `Criteria Used: ${result.criteriaUsed}`,
      ``,
      `── OVERALL SCORE ──`,
      `PromptScore™: ${result.promptScore}/100`,
      `Letter Grade: ${result.letterGrade}`,
      `Percentile: ${result.percentile}th`,
      ``,
      `── DIMENSIONS ──`,
      `Prompt Quality:     ${dims.promptQuality.score}/100  (weight: ${Math.round(dims.promptQuality.weight * 100)}%)`,
      `Response Quality:   ${dims.responseQuality.score}/100  (weight: ${Math.round(dims.responseQuality.weight * 100)}%)`,
      `Efficiency:         ${dims.efficiency.score}/100  (weight: ${Math.round(dims.efficiency.weight * 100)}%)`,
      `Speed:              ${dims.speed.score}/100  (weight: ${Math.round(dims.speed.weight * 100)}%)`,
      `Iteration IQ:       ${dims.iterationIQ.score}/100  (weight: ${Math.round(dims.iterationIQ.weight * 100)}%)`,
      ``,
      `── STATS ──`,
      `Attempts: ${result.stats.attemptsUsed}/${result.stats.maxAttempts}`,
      `Tokens: ${result.stats.tokensUsed}/${result.stats.tokenBudget}`,
      `Time: ${Math.floor(result.stats.timeSpentSeconds / 60)}:${(result.stats.timeSpentSeconds % 60).toString().padStart(2, "0")} / ${result.stats.timeLimitMinutes}:00`,
      ``,
      `── FEEDBACK ──`,
      result.feedback.summary,
      ``,
      `Strengths:`,
      ...result.feedback.topStrengths.map((s) => `  • ${s}`),
      ``,
      `Areas for Improvement:`,
      ...result.feedback.topWeaknesses.map((w) => `  • ${w}`),
      ``,
      `Improvement Plan:`,
      ...result.feedback.improvementPlan.map((p) => `  • ${p}`),
      ``,
      `── PROMPTING TIPS ──`,
      `• Be specific: include context, audience, and constraints in every prompt`,
      `• Structure matters: use numbered lists or bullet points for complex instructions`,
      `• Set the stage: define roles, tone, and format expectations upfront`,
      `• Iterate intentionally: reference AI output and refine, don't just retry`,
      `• Constrain the output: specify length, format, and what to avoid`,
      ``,
      `Generated by InpromptiFy.ai`,
    ].join("\n");

    const blob = new Blob([report], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `InpromptiFy-report-${test.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    setTimeout(() => setDownloadingReport(false), 1000);
  };

  if (loading || !result) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-[#6366F1] border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-sm text-gray-400">Calculating your score...</p>
        </div>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const timeTaken = result.stats.timeSpentSeconds || (result as StoredResult).timeSpentSeconds || 0;
  const messages = (result as StoredResult).messages || [];
  const testAvgScore = test.avgScore || 61;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-5 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-bold text-base text-gray-900">InpromptiFy</span>
          </Link>
          <span className="text-xs text-gray-400">Assessment Results</span>
        </div>
      </div>

      {/* Test Info Banner */}
      <div className="bg-[#0A0F1C] text-white">
        <div className="max-w-3xl mx-auto px-5 py-6">
          <h1 className="text-lg font-bold mb-1">{test.name}</h1>
          <p className="text-sm text-gray-300 leading-relaxed mb-3">
            {test.description}
          </p>
          <div className="flex flex-wrap gap-4 text-xs text-gray-400">
            <span>
              ⏱ {formatTime(timeTaken)} / {test.timeLimitMinutes}:00
            </span>
            <span>
              📝 {result.stats.attemptsUsed} of {result.stats.maxAttempts} attempts
            </span>
            <span>
              🪙 {result.stats.tokensUsed.toLocaleString()} / {result.stats.tokenBudget.toLocaleString()} tokens
            </span>
            <span>📊 {result.criteriaUsed} criteria</span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-5 flex gap-0">
          {(
            [
              { key: "overview", label: "Overview" },
              { key: "journey", label: "Your Journey" },
              { key: "comparison", label: "Comparison" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? "border-[#6366F1] text-[#6366F1]"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-5 py-8">
        {/* ═══ OVERVIEW TAB ═══ */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* ScoreCard */}
            <ScoreCard result={result} testName={test.name} />

            {/* Detailed Feedback Panel */}
            <div className="bg-white rounded-lg border border-gray-200 p-5 space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">
                💡 Prompting Tips
              </h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  {
                    title: "Be Specific",
                    tip: "Include context, audience, and constraints in every prompt. Vague instructions produce vague results.",
                    icon: "🎯",
                  },
                  {
                    title: "Structure Your Prompts",
                    tip: "Use numbered lists or bullet points for multi-part instructions. The AI follows structured prompts more reliably.",
                    icon: "📋",
                  },
                  {
                    title: "Set the Stage",
                    tip: "Define roles, tone, and format expectations upfront. 'You are a senior copywriter writing for CTOs' beats 'write an email'.",
                    icon: "🎭",
                  },
                  {
                    title: "Iterate Intentionally",
                    tip: "Reference the AI's previous output when refining. Say what to change and why, don't just retry the same prompt.",
                    icon: "🔄",
                  },
                ].map((t) => (
                  <div
                    key={t.title}
                    className="bg-gray-50 rounded-md p-3"
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span>{t.icon}</span>
                      <span className="text-xs font-semibold text-gray-900">
                        {t.title}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 leading-relaxed">
                      {t.tip}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Employer Panel */}
            {isEmployer && <EmployerPanel result={result} test={test} />}
          </div>
        )}

        {/* ═══ JOURNEY TAB ═══ */}
        {activeTab === "journey" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-sm font-semibold text-gray-900 mb-1">
                Your Prompt Journey
              </h2>
              <p className="text-xs text-gray-400 mb-4">
                {messages.length > 0
                  ? `You made ${Math.ceil(messages.length / 2)} prompt attempt${Math.ceil(messages.length / 2) !== 1 ? "s" : ""} during this assessment.`
                  : "No prompt history available for this session."}
              </p>

              {messages.length > 0 ? (
                <AttemptTimeline messages={messages} />
              ) : (
                <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                  <p className="text-gray-400 text-sm">
                    Prompt history is only available for sessions completed in this browser tab.
                  </p>
                </div>
              )}
            </div>

            {/* Iteration Score Insight */}
            {result.dimensions.iterationIQ && (
              <div className="bg-white rounded-lg border border-gray-200 p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Iteration Intelligence
                </h3>
                <div className="flex items-center gap-4 mb-3">
                  <div className="text-3xl font-bold text-[#6366F1]">
                    {result.dimensions.iterationIQ.score}
                  </div>
                  <div className="text-xs text-gray-400">/ 100</div>
                </div>
                {result.dimensions.iterationIQ.strengths.length > 0 && (
                  <div className="space-y-1 mb-2">
                    {result.dimensions.iterationIQ.strengths.map((s, i) => (
                      <p key={i} className="text-xs text-emerald-600 flex items-start gap-1.5">
                        <span className="shrink-0">✓</span> {s}
                      </p>
                    ))}
                  </div>
                )}
                {result.dimensions.iterationIQ.suggestions.length > 0 && (
                  <div className="space-y-1">
                    {result.dimensions.iterationIQ.suggestions.map((s, i) => (
                      <p key={i} className="text-xs text-gray-500 flex items-start gap-1.5">
                        <span className="text-[#6366F1] shrink-0">→</span> {s}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ═══ COMPARISON TAB ═══ */}
        {activeTab === "comparison" && (
          <div className="space-y-6">
            {/* Percentile Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-5 text-center">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">
                Your Percentile
              </p>
              <div className="text-5xl font-bold text-[#6366F1] mb-1">
                {result.percentile}
                <span className="text-lg text-gray-400 font-normal">th</span>
              </div>
              <p className="text-sm text-gray-500">
                You scored higher than {result.percentile}% of all candidates
              </p>
            </div>

            {/* Average comparison */}
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                How You Compare
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Your Score</span>
                    <span className="font-bold text-[#6366F1]">{result.promptScore}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-[#6366F1] h-full rounded-full"
                      style={{ width: `${result.promptScore}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Test Average</span>
                    <span className="font-bold text-gray-600">{testAvgScore}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gray-400 h-full rounded-full"
                      style={{ width: `${testAvgScore}%` }}
                    />
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-3">
                {result.promptScore >= testAvgScore
                  ? `You scored ${result.promptScore - testAvgScore} points above the average for "${test.name}".`
                  : `You scored ${testAvgScore - result.promptScore} points below the average. Review the tips to improve.`}
              </p>
            </div>

            {/* Distribution Chart */}
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                Score Distribution
              </h3>
              <ScoreDistributionChart userScore={result.promptScore} />
              <p className="text-[10px] text-gray-300 mt-3 text-center">
                Based on {test.candidates || 50} candidates across all sessions
              </p>
            </div>
          </div>
        )}

        {/* ═══ ACTION BUTTONS ═══ */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="relative">
            <button
              onClick={handleShare}
              className="w-full bg-[#6366F1] hover:bg-[#4F46E5] text-white px-3 py-2.5 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share
            </button>
            {shareTooltip && (
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-10">
                Copied!
              </div>
            )}
          </div>
          <Link
            href="/"
            className="bg-white border border-gray-200 hover:border-gray-300 text-gray-700 px-3 py-2.5 rounded-md text-sm font-medium transition-colors text-center"
          >
            Try Another
          </Link>
          <Link
            href="/leaderboard"
            className="bg-white border border-gray-200 hover:border-gray-300 text-gray-700 px-3 py-2.5 rounded-md text-sm font-medium transition-colors text-center"
          >
            Leaderboard
          </Link>
          <button
            onClick={handleDownloadReport}
            disabled={downloadingReport}
            className="bg-white border border-gray-200 hover:border-gray-300 text-gray-700 px-3 py-2.5 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {downloadingReport ? (
              <div className="animate-spin w-3.5 h-3.5 border-2 border-gray-400 border-t-transparent rounded-full" />
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            )}
            Report
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeDimension(score: number, weight: number) {
  return {
    score,
    weight,
    weightedScore: Math.round(score * weight),
    strengths: [] as string[],
    weaknesses: [] as string[],
    suggestions: [] as string[],
  };
}

function buildLegacyResult(data: Record<string, unknown>, test: Test): StoredResult {
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
    feedback: {
      summary: "Score imported from a previous version of the scoring engine.",
      topStrengths: [],
      topWeaknesses: [],
      improvementPlan: [],
    },
    stats: {
      attemptsUsed: (data.attemptsUsed as number) || 0,
      tokensUsed: (data.tokensUsed as number) || 0,
      timeSpentSeconds: (data.timeSpentSeconds as number) || 0,
      maxAttempts: test.maxAttempts,
      tokenBudget: test.tokenBudget,
      timeLimitMinutes: test.timeLimitMinutes,
      totalPrompts: (data.attemptsUsed as number) || 0,
      avgPromptLength: 0,
      totalResponseLength: 0,
    },
    criteriaUsed: "Legacy",
    evaluatedAt: new Date().toISOString(),
    messages: (data.messages as StoredMessage[]) || [],
  };
}

function buildDefaultResult(test: Test): StoredResult {
  return buildLegacyResult(
    {
      promptScore: 68,
      accuracy: 70,
      efficiency: 72,
      speed: 65,
      percentile: 60,
      attemptsUsed: 3,
      tokensUsed: 1340,
      timeSpentSeconds: 684,
    },
    test
  );
}
