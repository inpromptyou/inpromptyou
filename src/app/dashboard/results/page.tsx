"use client";

import { useState, useEffect } from "react";
import PromptScoreBadge from "@/components/PromptScoreBadge";

interface Result {
  testName: string;
  score: number;
  completedAt: string;
}

export default function MyResultsPage() {
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/candidate/stats")
      .then(r => r.json())
      .then(d => { if (d.recentResults) setResults(d.recentResults); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-gray-900">My Results</h1>
        <p className="text-gray-500 text-sm mt-1">Your test history and scores</p>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400 text-sm">Loading results...</div>
      ) : results.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 px-5 py-16 text-center">
          <p className="text-gray-400 text-sm mb-2">No test results yet</p>
          <p className="text-xs text-gray-300">Take a test from the Job Board to see your results here</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-gray-400 uppercase tracking-wider border-b border-gray-200">
                <th className="px-5 py-2.5 font-medium">Test</th>
                <th className="px-5 py-2.5 font-medium">Score</th>
                <th className="px-5 py-2.5 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {results.map((r, i) => (
                <tr key={i} className="hover:bg-gray-50/50">
                  <td className="px-5 py-3 text-sm font-medium text-gray-900">{r.testName}</td>
                  <td className="px-5 py-3"><PromptScoreBadge score={r.score} size="sm" /></td>
                  <td className="px-5 py-3 text-sm text-gray-400">{r.completedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
