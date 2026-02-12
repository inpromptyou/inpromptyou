"use client";

import { useState, useEffect } from "react";
import { mockCandidates, type Candidate } from "@/lib/mockData";
import { ds } from "@/lib/designSystem";

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
    if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
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
      if (typeof aVal === "string" && typeof bVal === "string")
        return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      return sortDir === "asc" ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });

  const SortHeader = ({ label, sortKeyName, className = "" }: { label: string; sortKeyName: SortKey; className?: string }) => (
    <th
      className={`${ds.tableCell} ${ds.tableHeader} text-left cursor-pointer select-none hover:text-gray-600 transition-colors ${className}`}
      onClick={() => handleSort(sortKeyName)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {sortKey === sortKeyName && (
          <svg className={`w-3 h-3 transition-transform ${sortDir === "asc" ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
        )}
      </span>
    </th>
  );

  return (
    <div className={ds.page}>
      <div className="mb-10">
        <h1 className={ds.pageTitle}>Candidates</h1>
        <p className={ds.pageSubtitle}>All candidates who have taken your assessments</p>
      </div>

      {/* Search & count */}
      <div className="flex items-center justify-between mb-5">
        <div className="relative max-w-[260px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search candidates…"
            className={`${ds.input} pl-9`}
          />
        </div>
        <span className="text-[12px] text-gray-400">{sorted.length} candidate{sorted.length !== 1 ? "s" : ""}</span>
      </div>

      <div className={`${ds.card} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className={`${ds.tableCell} ${ds.tableHeader} text-left`}>Candidate</th>
                <SortHeader label="Test" sortKeyName="testName" />
                <SortHeader label="Score" sortKeyName="promptScore" />
                <SortHeader label="Tokens" sortKeyName="tokensUsed" />
                <SortHeader label="Time" sortKeyName="timeSpentMinutes" />
                <th className={`${ds.tableCell} ${ds.tableHeader} text-left`}>Attempts</th>
                <SortHeader label="Date" sortKeyName="completedAt" />
                <th className={`${ds.tableCell} ${ds.tableHeader} text-left`}>Percentile</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((c, i) => (
                <tr key={c.id} className={`${ds.tableRow} ${i < sorted.length - 1 ? "border-b border-gray-50" : ""}`}>
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
                  <td className={`${ds.tableCell} text-gray-500`}>{c.testName}</td>
                  <td className={ds.tableCell}>
                    <div className="flex items-center gap-2">
                      <span className={`text-[13px] font-semibold ${ds.scoreBadge(c.promptScore)}`}>{c.promptScore}</span>
                      <div className="w-10 h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${c.promptScore}%`, backgroundColor: ds.scoreRingColor(c.promptScore) }} />
                      </div>
                    </div>
                  </td>
                  <td className={ds.tableCellMuted}>{c.tokensUsed.toLocaleString()}</td>
                  <td className={ds.tableCellMuted}>{c.timeSpentMinutes}m</td>
                  <td className={ds.tableCellMuted}>{c.attemptsUsed}</td>
                  <td className={ds.tableCellMuted}>{c.completedAt}</td>
                  <td className={ds.tableCell}>
                    <span className={`text-[12px] ${c.percentile >= 75 ? "text-emerald-600" : c.percentile >= 50 ? "text-gray-600" : "text-gray-400"}`}>
                      Top {100 - c.percentile}%
                    </span>
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
