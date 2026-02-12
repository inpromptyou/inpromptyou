"use client";

import { useState, useEffect } from "react";
import { mockCandidates, type Candidate } from "@/lib/mockData";
import PromptScoreBadge from "@/components/PromptScoreBadge";

type SortKey = "promptScore" | "completedAt" | "testName" | "tokensUsed" | "timeSpentMinutes";

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>(mockCandidates);
  const [sortKey, setSortKey] = useState<SortKey>("promptScore");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/dashboard/candidates")
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d) && d.length > 0) setCandidates(d); })
      .catch(() => {});
  }, []);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const sorted = [...candidates]
    .filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.testName.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortDir === "asc" ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });

  const SortHeader = ({ label, sortKeyName }: { label: string; sortKeyName: SortKey }) => (
    <th
      className="px-5 py-2.5 font-medium cursor-pointer hover:text-gray-600 select-none"
      onClick={() => handleSort(sortKeyName)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {sortKey === sortKeyName && (
          <svg className={`w-3 h-3 ${sortDir === "asc" ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
        )}
      </span>
    </th>
  );

  return (
    <div className="p-6 lg:p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-gray-900">Candidates</h1>
        <p className="text-gray-500 text-sm mt-1">All candidates who have taken your assessments</p>
      </div>

      <div className="mb-5">
        <div className="relative max-w-xs">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search candidates..."
            className="w-full border border-gray-200 rounded-md pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B5B7D] focus:border-transparent"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-gray-400 uppercase tracking-wider border-b border-gray-200">
                <th className="px-5 py-2.5 font-medium">Candidate</th>
                <SortHeader label="Test" sortKeyName="testName" />
                <SortHeader label="Score" sortKeyName="promptScore" />
                <SortHeader label="Tokens" sortKeyName="tokensUsed" />
                <SortHeader label="Time" sortKeyName="timeSpentMinutes" />
                <th className="px-5 py-2.5 font-medium">Attempts</th>
                <SortHeader label="Date" sortKeyName="completedAt" />
                <th className="px-5 py-2.5 font-medium">Percentile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sorted.map((c) => (
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
                  <td className="px-5 py-3 text-sm text-gray-500">{c.testName}</td>
                  <td className="px-5 py-3"><PromptScoreBadge score={c.promptScore} size="sm" /></td>
                  <td className="px-5 py-3 text-sm text-gray-500">{c.tokensUsed.toLocaleString()}</td>
                  <td className="px-5 py-3 text-sm text-gray-500">{c.timeSpentMinutes}m</td>
                  <td className="px-5 py-3 text-sm text-gray-500">{c.attemptsUsed}</td>
                  <td className="px-5 py-3 text-sm text-gray-400">{c.completedAt}</td>
                  <td className="px-5 py-3">
                    <span className="text-xs text-gray-500">Top {100 - c.percentile}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
