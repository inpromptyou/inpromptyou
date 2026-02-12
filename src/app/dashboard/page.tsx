"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import PromptScoreBadge from "@/components/PromptScoreBadge";
import { dashboardStats, mockCandidates, type Candidate } from "@/lib/mockData";

interface Stats {
  testsCreated: number;
  candidatesTested: number;
  avgPromptScore: number;
  totalTokensUsed: number;
}

export default function DashboardHome() {
  const [stats, setStats] = useState<Stats>({
    testsCreated: dashboardStats.testsCreated,
    candidatesTested: dashboardStats.candidatesTested,
    avgPromptScore: dashboardStats.avgPromptScore,
    totalTokensUsed: dashboardStats.totalTokensSaved,
  });
  const [recentResults, setRecentResults] = useState<Candidate[]>(mockCandidates.slice(0, 6));

  useEffect(() => {
    fetch("/api/dashboard/stats").then((r) => r.json()).then((d) => {
      if (d.testsCreated !== undefined) setStats(d);
    }).catch(() => {});
    fetch("/api/dashboard/candidates").then((r) => r.json()).then((d) => {
      if (Array.isArray(d) && d.length > 0) setRecentResults(d.slice(0, 6));
    }).catch(() => {});
  }, []);

  return (
    <div className="p-6 lg:p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Overview of your assessment activity</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {[
          { label: "Tests Created", value: stats.testsCreated.toString() },
          { label: "Candidates Tested", value: stats.candidatesTested.toString() },
          { label: "Avg Prompt Score", value: stats.avgPromptScore.toString() },
          { label: "Tokens Used", value: `${(stats.totalTokensUsed / 1000).toFixed(1)}K` },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-lg border border-gray-200 p-4">
            <span className="text-xs text-gray-500">{stat.label}</span>
            <div className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3 mb-8">
        <Link href="/dashboard/create" className="flex items-center gap-2 bg-[#1B5B7D] hover:bg-[#14455E] text-white rounded-md px-4 py-2.5 text-sm font-medium transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Create New Test
        </Link>
        <Link href="/dashboard/tests" className="flex items-center gap-2 bg-white border border-gray-200 hover:border-gray-300 rounded-md px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors">
          View My Tests
        </Link>
      </div>

      {/* Recent Results */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-5 py-3.5 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">Recent Results</h2>
          <Link href="/dashboard/candidates" className="text-xs text-[#1B5B7D] hover:text-[#14455E] font-medium">View all</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-gray-400 uppercase tracking-wider border-b border-gray-100">
                <th className="px-5 py-2.5 font-medium">Candidate</th>
                <th className="px-5 py-2.5 font-medium">Test</th>
                <th className="px-5 py-2.5 font-medium">Score</th>
                <th className="px-5 py-2.5 font-medium">Tokens</th>
                <th className="px-5 py-2.5 font-medium">Time</th>
                <th className="px-5 py-2.5 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentResults.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-medium text-gray-500">
                        {c.name.split(" ").map((n: string) => n[0]).join("")}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{c.name}</div>
                        <div className="text-xs text-gray-400">{c.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-600">{c.testName}</td>
                  <td className="px-5 py-3"><PromptScoreBadge score={c.promptScore} size="sm" /></td>
                  <td className="px-5 py-3 text-sm text-gray-500">{c.tokensUsed.toLocaleString()}</td>
                  <td className="px-5 py-3 text-sm text-gray-500">{c.timeSpentMinutes}m</td>
                  <td className="px-5 py-3 text-sm text-gray-400">{c.completedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
