"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ds } from "@/lib/designSystem";

interface DbTest {
  id: number;
  title: string;
  description: string;
  test_type: string;
  difficulty: string;
  model: string;
  status: string;
  candidates_count: number;
  avg_score: number;
  completion_rate: number;
  time_limit_minutes: number;
  created_at: string;
}

export default function MyTestsPage() {
  const [tests, setTests] = useState<DbTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/tests")
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load");
        return res.json();
      })
      .then(setTests)
      .catch(() => setError("Failed to load tests"))
      .finally(() => setLoading(false));
  }, []);

  const statusDot = (status: string) => {
    if (status === "active") return ds.statusDot.active;
    if (status === "draft") return ds.statusDot.draft;
    return ds.statusDot.inactive;
  };

  return (
    <div className={ds.page}>
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className={ds.pageTitle}>My Tests</h1>
          <p className={ds.pageSubtitle}>Manage assessments and track performance</p>
        </div>
        <Link href="/dashboard/create" className={ds.btnPrimary}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Create Test
        </Link>
      </div>

      {loading && (
        <div className="text-center py-20 text-gray-400 text-[13px]">Loading tests…</div>
      )}

      {error && (
        <div className="text-[13px] text-red-600 bg-red-50 border border-red-100 rounded-md px-4 py-3 mb-6">{error}</div>
      )}

      {!loading && !error && tests.length === 0 && (
        <div className="text-center py-20">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-400">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
            </svg>
          </div>
          <p className="text-gray-500 text-[13px] mb-1">No tests yet</p>
          <p className="text-gray-400 text-[12px] mb-5">Create your first assessment to get started</p>
          <Link href="/dashboard/create" className={ds.btnPrimary}>Create Test</Link>
        </div>
      )}

      {!loading && !error && tests.length > 0 && (
        <div className={`${ds.card} overflow-hidden`}>
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className={`${ds.tableCell} ${ds.tableHeader} text-left`}>Test</th>
                <th className={`${ds.tableCell} ${ds.tableHeader} text-left`}>Type</th>
                <th className={`${ds.tableCell} ${ds.tableHeader} text-left`}>Candidates</th>
                <th className={`${ds.tableCell} ${ds.tableHeader} text-left`}>Avg Score</th>
                <th className={`${ds.tableCell} ${ds.tableHeader} text-left`}>Completion</th>
                <th className={`${ds.tableCell} ${ds.tableHeader} text-left`}>Created</th>
                <th className={`${ds.tableCell} ${ds.tableHeader} text-right`}></th>
              </tr>
            </thead>
            <tbody>
              {tests.map((test, i) => (
                <tr key={test.id} className={`${ds.tableRow} group ${i < tests.length - 1 ? "border-b border-gray-50" : ""}`}>
                  <td className={ds.tableCell}>
                    <div className="flex items-center gap-2.5">
                      <span className={statusDot(test.status)} title={test.status} />
                      <div>
                        <Link href={`/dashboard/tests/${test.id}`} className="text-[13px] font-medium text-gray-900 hover:text-indigo-600 transition-colors">
                          {test.title}
                        </Link>
                        <div className="text-[11px] text-gray-400 line-clamp-1 max-w-[280px]">{test.description || "No description"}</div>
                      </div>
                    </div>
                  </td>
                  <td className={`${ds.tableCell} text-gray-500 capitalize text-[12px]`}>{test.test_type}</td>
                  <td className={`${ds.tableCell} text-gray-600`}>{test.candidates_count}</td>
                  <td className={ds.tableCell}>
                    <span className={`text-[13px] font-medium ${ds.scoreBadge(Number(test.avg_score))}`}>
                      {Number(test.avg_score) || "—"}
                    </span>
                  </td>
                  <td className={ds.tableCell}>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Number(test.completion_rate)}%` }} />
                      </div>
                      <span className="text-[12px] text-gray-400">{Number(test.completion_rate)}%</span>
                    </div>
                  </td>
                  <td className={ds.tableCellMuted}>{new Date(test.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</td>
                  <td className={`${ds.tableCell} text-right`}>
                    <Link href={`/dashboard/tests/${test.id}`} className="text-[12px] text-gray-400 hover:text-indigo-600 font-medium opacity-0 group-hover:opacity-100 transition-all duration-200">
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
