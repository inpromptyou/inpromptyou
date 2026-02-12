"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface TestDetail {
  id: number;
  title: string;
  description: string;
  task_prompt: string;
  expected_outcomes: string;
  test_type: string;
  difficulty: string;
  time_limit_minutes: number;
  max_attempts: number;
  token_budget: number;
  model: string;
  scoring_weights: { accuracy: number; efficiency: number; speed: number };
  status: string;
  candidates_count: number;
  avg_score: number;
  completion_rate: number;
  created_at: string;
}

export default function TestDetailPage() {
  const { id } = useParams();
  const [test, setTest] = useState<TestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    fetch(`/api/tests/${id}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then(setTest)
      .catch(() => setError("Test not found"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-6 lg:p-8 text-gray-400 text-sm">Loading...</div>;
  if (error || !test) return (
    <div className="p-6 lg:p-8">
      <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-4 py-3">{error || "Test not found"}</div>
      <Link href="/dashboard/tests" className="text-sm text-[#6366F1] mt-4 inline-block">← Back to My Tests</Link>
    </div>
  );

  const weights = typeof test.scoring_weights === "string" ? JSON.parse(test.scoring_weights) : (test.scoring_weights || { accuracy: 40, efficiency: 30, speed: 30 });

  return (
    <div className="p-6 lg:p-8 max-w-6xl">
      <div className="mb-8">
        <Link href="/dashboard/tests" className="text-xs text-gray-400 hover:text-gray-600 mb-2 inline-flex items-center gap-1">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          Back to My Tests
        </Link>
        <div className="flex items-center gap-3 mt-2">
          <h1 className="text-xl font-bold text-gray-900">{test.title}</h1>
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
            test.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"
          }`}>
            {test.status.charAt(0).toUpperCase() + test.status.slice(1)}
          </span>
        </div>
        <p className="text-gray-500 text-sm mt-1">{test.description || "No description"}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-8">
        {[
          { label: "Candidates", value: test.candidates_count.toString() },
          { label: "Avg Score", value: Number(test.avg_score).toString() },
          { label: "Completion", value: `${Number(test.completion_rate)}%` },
          { label: "Model", value: test.model === "gpt-4o" ? "GPT-4o" : test.model === "claude" ? "Claude" : "Gemini" },
          { label: "Time Limit", value: `${test.time_limit_minutes}m` },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-lg border border-gray-200 p-3.5">
            <div className="text-xs text-gray-400 mb-0.5">{stat.label}</div>
            <div className="text-lg font-bold text-gray-900">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Test Details */}
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Test Configuration</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Type</span><span className="text-gray-900 capitalize">{test.test_type}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Difficulty</span><span className="text-gray-900 capitalize">{test.difficulty}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Max Attempts</span><span className="text-gray-900">{test.max_attempts}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Token Budget</span><span className="text-gray-900">{test.token_budget.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Created</span><span className="text-gray-900">{new Date(test.created_at).toLocaleDateString()}</span></div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Scoring Weights</h3>
          <div className="space-y-3">
            {(["accuracy", "efficiency", "speed"] as const).map((key) => (
              <div key={key} className="flex items-center gap-3">
                <span className="text-sm text-gray-500 w-20 capitalize">{key}</span>
                <div className="flex-1 bg-gray-100 rounded h-3 overflow-hidden">
                  <div className="bg-[#6366F1] h-full rounded" style={{ width: `${weights[key]}%` }} />
                </div>
                <span className="text-sm font-mono text-gray-600 w-10 text-right">{weights[key]}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Task Prompt */}
      {test.task_prompt && (
        <div className="bg-white rounded-lg border border-gray-200 p-5 mb-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Task Prompt</h3>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{test.task_prompt}</p>
        </div>
      )}

      {/* Expected Outcomes */}
      {test.expected_outcomes && (
        <div className="bg-white rounded-lg border border-gray-200 p-5 mb-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Expected Outcomes</h3>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{test.expected_outcomes}</p>
        </div>
      )}

      {/* No candidates yet message */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-5 py-3.5 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-900">Candidate Results</h2>
        </div>
        <div className="px-5 py-10 text-center text-gray-400 text-sm">
          No candidates have taken this test yet. Share the test link to get started.
        </div>
      </div>
    </div>
  );
}
