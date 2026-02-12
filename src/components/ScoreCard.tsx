"use client";

import { useState, useEffect } from "react";
import type { ScoringResult, LetterGrade, DimensionScore } from "@/lib/scoring";

// ─── Sub-components ──────────────────────────────────────────────────────────

/** Animated circular progress ring for the overall PromptScore */
function CircularProgress({
  score,
  letterGrade,
  animate,
}: {
  score: number;
  letterGrade: LetterGrade;
  animate: boolean;
}) {
  const size = 180;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = animate ? score / 100 : 0;
  const offset = circumference * (1 - progress);

  const gradeColors: Record<LetterGrade, { stroke: string; text: string; bg: string }> = {
    S: { stroke: "#8B5CF6", text: "text-violet-600", bg: "bg-violet-50" },
    A: { stroke: "#10B981", text: "text-emerald-600", bg: "bg-emerald-50" },
    B: { stroke: "#3B82F6", text: "text-blue-600", bg: "bg-blue-50" },
    C: { stroke: "#F59E0B", text: "text-amber-600", bg: "bg-amber-50" },
    D: { stroke: "#F97316", text: "text-orange-600", bg: "bg-orange-50" },
    F: { stroke: "#EF4444", text: "text-red-600", bg: "bg-red-50" },
  };

  const colors = gradeColors[letterGrade];

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#f3f4f6"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colors.stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-[2000ms] ease-out"
        />
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-5xl font-bold ${colors.text} transition-all duration-1000`}>
          {animate ? score : 0}
        </span>
        <span className="text-xs text-gray-400 mt-0.5">PromptScore™</span>
      </div>
    </div>
  );
}

/** Letter grade badge */
function GradeBadge({ grade, size = "lg" }: { grade: LetterGrade; size?: "sm" | "lg" }) {
  const gradeStyles: Record<LetterGrade, string> = {
    S: "bg-violet-100 text-violet-700 ring-violet-200",
    A: "bg-emerald-100 text-emerald-700 ring-emerald-200",
    B: "bg-blue-100 text-blue-700 ring-blue-200",
    C: "bg-amber-100 text-amber-700 ring-amber-200",
    D: "bg-orange-100 text-orange-700 ring-orange-200",
    F: "bg-red-100 text-red-700 ring-red-200",
  };

  const sizeClass = size === "lg" ? "w-14 h-14 text-2xl" : "w-8 h-8 text-sm";

  return (
    <div className={`${sizeClass} ${gradeStyles[grade]} ring-2 rounded-xl flex items-center justify-center font-bold`}>
      {grade}
    </div>
  );
}

/** Dimension breakdown bar */
function DimensionBar({
  label,
  dimension,
  color,
  animate,
  delay,
}: {
  label: string;
  dimension: DimensionScore;
  color: string;
  animate: boolean;
  delay: number;
}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (animate) {
      const timer = setTimeout(() => setShow(true), delay);
      return () => clearTimeout(timer);
    }
  }, [animate, delay]);

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900">{label}</span>
          <span className="text-[10px] text-gray-400">
            {Math.round(dimension.weight * 100)}% weight
          </span>
        </div>
        <span className="text-sm font-bold text-gray-900">{dimension.score}</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
        <div
          className={`${color} h-full rounded-full transition-all duration-1000 ease-out`}
          style={{ width: show ? `${dimension.score}%` : "0%" }}
        />
      </div>
      {/* Mini feedback */}
      {(dimension.strengths.length > 0 || dimension.weaknesses.length > 0) && (
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {dimension.strengths.slice(0, 1).map((s, i) => (
            <span key={`s-${i}`} className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
              ✓ {s}
            </span>
          ))}
          {dimension.weaknesses.slice(0, 1).map((w, i) => (
            <span key={`w-${i}`} className="text-[10px] text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
              ✗ {w}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/** Expandable feedback section */
function FeedbackSection({
  title,
  items,
  icon,
  colorClass,
}: {
  title: string;
  items: string[];
  icon: string;
  colorClass: string;
}) {
  if (items.length === 0) return null;

  return (
    <div>
      <h4 className={`text-xs font-semibold uppercase tracking-wide ${colorClass} mb-2`}>
        {icon} {title}
      </h4>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="text-sm text-gray-600 leading-relaxed flex items-start gap-2">
            <span className="text-gray-300 mt-0.5 shrink-0">•</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Main ScoreCard Component ────────────────────────────────────────────────

interface ScoreCardProps {
  result: ScoringResult;
  testName?: string;
}

export default function ScoreCard({ result, testName }: ScoreCardProps) {
  const [animate, setAnimate] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [shareTooltip, setShareTooltip] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 200);
    return () => clearTimeout(timer);
  }, []);

  const handleShare = async () => {
    const text = `I scored ${result.promptScore}/100 (Grade: ${result.letterGrade}) on ${testName || "InpromptiFy"}! 🧠\n\nBetter than ${result.percentile}% of candidates.\n\nTest your AI prompting skills → InpromptiFy.ai`;

    if (navigator.share) {
      try {
        await navigator.share({ title: "My PromptScore™", text });
      } catch {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(text);
      setShareTooltip(true);
      setTimeout(() => setShareTooltip(false), 2000);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const dimensionConfig = [
    { key: "promptQuality" as const, label: "Prompt Quality", color: "bg-[#1B5B7D]" },
    { key: "responseQuality" as const, label: "Response Quality", color: "bg-emerald-500" },
    { key: "efficiency" as const, label: "Efficiency", color: "bg-blue-500" },
    { key: "speed" as const, label: "Speed", color: "bg-purple-500" },
    { key: "iterationIQ" as const, label: "Iteration IQ", color: "bg-amber-500" },
  ];

  return (
    <div className="space-y-5">
      {/* ── Hero: Score + Grade ── */}
      <div
        className={`text-center transition-all duration-700 ${
          animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        {testName && (
          <p className="text-xs text-gray-400 mb-1 uppercase tracking-wide">{testName}</p>
        )}
        <h1 className="text-xl font-bold text-gray-900 mb-6">Your PromptScore™</h1>

        <div className="flex flex-col items-center gap-4">
          <CircularProgress
            score={result.promptScore}
            letterGrade={result.letterGrade}
            animate={animate}
          />
          <div className="flex items-center gap-3">
            <GradeBadge grade={result.letterGrade} />
            <div className="text-left">
              <p className="text-sm font-semibold text-gray-900">
                Grade {result.letterGrade}
              </p>
              <p className="text-xs text-gray-400">
                Better than <span className="font-semibold text-gray-600">{result.percentile}%</span> of candidates
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Dimension Breakdown ── */}
      <div
        className={`bg-white rounded-lg border border-gray-200 p-5 transition-all duration-700 delay-200 ${
          animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <h2 className="text-sm font-semibold text-gray-900 mb-5">Score Breakdown</h2>
        <div className="space-y-5">
          {dimensionConfig.map((dim, i) => (
            <DimensionBar
              key={dim.key}
              label={dim.label}
              dimension={result.dimensions[dim.key]}
              color={dim.color}
              animate={animate}
              delay={300 + i * 150}
            />
          ))}
        </div>
      </div>

      {/* ── Stats ── */}
      <div
        className={`grid grid-cols-3 gap-3 transition-all duration-700 delay-400 ${
          animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <div className="text-[10px] text-gray-400 uppercase tracking-wide">Tokens</div>
          <div className="text-lg font-bold text-gray-900 mt-0.5">
            {result.stats.tokensUsed.toLocaleString()}
          </div>
          <div className="text-[11px] text-gray-300">of {result.stats.tokenBudget.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <div className="text-[10px] text-gray-400 uppercase tracking-wide">Time</div>
          <div className="text-lg font-bold text-gray-900 mt-0.5">
            {formatTime(result.stats.timeSpentSeconds)}
          </div>
          <div className="text-[11px] text-gray-300">of {result.stats.timeLimitMinutes}:00</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <div className="text-[10px] text-gray-400 uppercase tracking-wide">Prompts</div>
          <div className="text-lg font-bold text-gray-900 mt-0.5">{result.stats.totalPrompts}</div>
          <div className="text-[11px] text-gray-300">of {result.stats.maxAttempts}</div>
        </div>
      </div>

      {/* ── Feedback Summary ── */}
      <div
        className={`bg-white rounded-lg border border-gray-200 p-5 transition-all duration-700 delay-500 ${
          animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <p className="text-sm text-gray-700 leading-relaxed mb-4">
          {result.feedback.summary}
        </p>

        <div className="space-y-4">
          <FeedbackSection
            title="Strengths"
            items={result.feedback.topStrengths}
            icon="💪"
            colorClass="text-emerald-600"
          />
          <FeedbackSection
            title="Areas to Improve"
            items={result.feedback.topWeaknesses}
            icon="🎯"
            colorClass="text-amber-600"
          />
        </div>

        {/* Toggle detailed view */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="mt-4 text-xs text-[#1B5B7D] hover:text-[#14455E] font-medium flex items-center gap-1"
        >
          {showDetails ? "Hide" : "Show"} detailed feedback
          <svg
            className={`w-3 h-3 transition-transform ${showDetails ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showDetails && (
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
            <FeedbackSection
              title="Improvement Plan"
              items={result.feedback.improvementPlan}
              icon="📈"
              colorClass="text-blue-600"
            />

            {/* Per-dimension details */}
            {dimensionConfig.map((dim) => {
              const d = result.dimensions[dim.key];
              const allFeedback = [...d.strengths, ...d.weaknesses, ...d.suggestions];
              if (allFeedback.length <= 1) return null;

              return (
                <div key={dim.key} className="p-3 bg-gray-50 rounded-md">
                  <h5 className="text-xs font-semibold text-gray-700 mb-2">
                    {dim.label} — {d.score}/100
                  </h5>
                  {d.suggestions.length > 0 && (
                    <ul className="space-y-1">
                      {d.suggestions.map((s, i) => (
                        <li key={i} className="text-xs text-gray-500 flex items-start gap-1.5">
                          <span className="text-[#1B5B7D] shrink-0">→</span> {s}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}

            <p className="text-[10px] text-gray-300 text-right">
              Scored using: {result.criteriaUsed} criteria
            </p>
          </div>
        )}
      </div>

      {/* ── Share Button ── */}
      <div
        className={`flex justify-center transition-all duration-700 delay-700 ${
          animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <div className="relative">
          <button
            onClick={handleShare}
            className="bg-[#1B5B7D] hover:bg-[#14455E] text-white px-6 py-2.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Share Your Score
          </button>
          {shareTooltip && (
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
              Copied to clipboard!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
