"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ds, sparklinePath, progressRing } from "@/lib/designSystem";
import { dashboardStats, mockCandidates, type Candidate } from "@/lib/mockData";

interface Stats {
  testsCreated: number;
  candidatesTested: number;
  avgPromptScore: number;
  totalTokensUsed: number;
}

function Sparkline({ data, color = "#6366f1", width = 60, height = 20 }: { data: number[]; color?: string; width?: number; height?: number }) {
  const d = sparklinePath(data, width, height);
  return (
    <svg width={width} height={height} className="overflow-visible">
      <path d={d} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
      <circle cx={width} cy={parseFloat(d.split(" ").slice(-1)[0])} r="2" fill={color} />
    </svg>
  );
}

function ProgressRingSvg({ percent, size = 44, stroke = 3.5 }: { percent: number; size?: number; stroke?: number }) {
  const { radius, circumference, offset, cx, cy } = progressRing(percent, size, stroke);
  const color = ds.scoreRingColor(percent);
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={cx} cy={cy} r={radius} fill="none" stroke="#f3f4f6" strokeWidth={stroke} />
      <circle cx={cx} cy={cy} r={radius} fill="none" stroke={color} strokeWidth={stroke} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-700 ease-out" />
    </svg>
  );
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

  const statCards = [
    { label: "Tests Created", value: stats.testsCreated, trend: ds.fakeTrend(stats.testsCreated), delta: "+2", deltaUp: true },
    { label: "Candidates", value: stats.candidatesTested, trend: ds.fakeTrend(stats.candidatesTested), delta: "+8", deltaUp: true },
    { label: "Avg Score", value: stats.avgPromptScore, isScore: true, delta: "↑ 3pts", deltaUp: true },
    { label: "Tokens Used", value: stats.totalTokensUsed, format: (v: number) => `${(v / 1000).toFixed(1)}K`, trend: ds.fakeTrend(stats.totalTokensUsed / 1000), delta: "12% less", deltaUp: true },
  ];

  return (
    <div className={ds.page}>
      {/* Header */}
      <div className="mb-10">
        <h1 className={ds.pageTitle}>Dashboard</h1>
        <p className={ds.pageSubtitle}>Overview of your assessment activity</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {statCards.map((stat) => (
          <div key={stat.label} className={`${ds.card} p-4`}>
            <div className="flex items-start justify-between mb-3">
              <span className={ds.sectionLabel}>{stat.label}</span>
              {stat.trend && <Sparkline data={stat.trend} color="#6366f1" />}
            </div>
            <div className="flex items-end gap-3">
              {stat.isScore ? (
                <div className="relative">
                  <ProgressRingSvg percent={stat.value} />
                  <span className={`absolute inset-0 flex items-center justify-center text-[13px] font-semibold ${ds.scoreBadge(stat.value)}`}>
                    {stat.value}
                  </span>
                </div>
              ) : (
                <span className="text-[26px] font-semibold text-gray-900 leading-none tracking-[-0.02em]">
                  {stat.format ? stat.format(stat.value) : stat.value}
                </span>
              )}
            </div>
            {stat.delta && (
              <div className={`text-[11px] mt-2 ${stat.deltaUp ? "text-emerald-600" : "text-red-500"}`}>
                {stat.delta} <span className="text-gray-400">from last week</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="flex items-center gap-3 mb-10">
        <Link href="/dashboard/create" className={ds.btnPrimary}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Create Test
        </Link>
        <Link href="/dashboard/tests" className={ds.btnSecondary}>View All Tests</Link>
        <Link href="/dashboard/candidates" className={ds.btnGhost}>Candidates →</Link>
      </div>

      {/* Recent Results */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className={ds.sectionTitle}>Recent Results</h2>
          <Link href="/dashboard/candidates" className="text-[12px] text-indigo-600 hover:text-indigo-700 font-medium transition-colors">
            View all →
          </Link>
        </div>
        <div className={`${ds.card} overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className={`${ds.tableCell} ${ds.tableHeader} text-left`}>Candidate</th>
                  <th className={`${ds.tableCell} ${ds.tableHeader} text-left`}>Test</th>
                  <th className={`${ds.tableCell} ${ds.tableHeader} text-left`}>Score</th>
                  <th className={`${ds.tableCell} ${ds.tableHeader} text-left`}>Tokens</th>
                  <th className={`${ds.tableCell} ${ds.tableHeader} text-left`}>Time</th>
                  <th className={`${ds.tableCell} ${ds.tableHeader} text-left`}>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentResults.map((c, i) => (
                  <tr key={c.id} className={`${ds.tableRow} ${i < recentResults.length - 1 ? "border-b border-gray-50" : ""}`}>
                    <td className={ds.tableCell}>
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-medium text-gray-400">
                          {c.name.split(" ").map((n: string) => n[0]).join("")}
                        </div>
                        <div>
                          <div className="text-[13px] font-medium text-gray-900">{c.name}</div>
                          <div className="text-[11px] text-gray-400">{c.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className={`${ds.tableCell} text-gray-600`}>{c.testName}</td>
                    <td className={ds.tableCell}>
                      <span className={`text-[13px] font-semibold ${ds.scoreBadge(c.promptScore)}`}>{c.promptScore}</span>
                    </td>
                    <td className={ds.tableCellMuted}>{c.tokensUsed.toLocaleString()}</td>
                    <td className={ds.tableCellMuted}>{c.timeSpentMinutes}m</td>
                    <td className={ds.tableCellMuted}>{c.completedAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
