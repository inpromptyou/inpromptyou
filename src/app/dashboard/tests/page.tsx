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
  cover_image: string | null;
  visibility: string;
  listing_type: string;
  company_name: string | null;
  candidates_count: number;
  avg_score: number;
  completion_rate: number;
  time_limit_minutes: number;
  created_at: string;
}

type FilterTab = "all" | "active" | "draft" | "archived";

export default function MyTestsPage() {
  const [tests, setTests] = useState<DbTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<FilterTab>("all");
  const [copiedId, setCopiedId] = useState<number | null>(null);

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

  const filtered = tests.filter((t) => {
    if (tab === "all") return true;
    if (tab === "archived") return t.status === "archived";
    return t.status === tab;
  });

  const counts = {
    all: tests.length,
    active: tests.filter((t) => t.status === "active").length,
    draft: tests.filter((t) => t.status === "draft").length,
    archived: tests.filter((t) => t.status === "archived").length,
  };

  const copyLink = (id: number) => {
    navigator.clipboard.writeText(`${window.location.origin}/test/${id}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleStatus = async (test: DbTest) => {
    const newStatus = test.status === "active" ? "draft" : "active";
    try {
      const res = await fetch(`/api/tests/${test.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setTests((prev) => prev.map((t) => t.id === test.id ? { ...t, status: newStatus } : t));
      }
    } catch { /* ignore */ }
  };

  const archiveTest = async (test: DbTest) => {
    try {
      const res = await fetch(`/api/tests/${test.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "archived" }),
      });
      if (res.ok) {
        setTests((prev) => prev.map((t) => t.id === test.id ? { ...t, status: "archived" } : t));
      }
    } catch { /* ignore */ }
  };

  const deleteTest = async (test: DbTest) => {
    if (!confirm(`Delete "${test.title}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/tests/${test.id}`, { method: "DELETE" });
      if (res.ok) {
        setTests((prev) => prev.filter((t) => t.id !== test.id));
      }
    } catch { /* ignore */ }
  };

  const listingBadge = (t: DbTest) => {
    const type = t.listing_type || "test";
    const colors: Record<string, string> = {
      job: "bg-blue-50 text-blue-700 border-blue-100",
      test: "bg-violet-50 text-violet-700 border-violet-100",
      casual: "bg-amber-50 text-amber-700 border-amber-100",
    };
    const labels: Record<string, string> = { job: "Job", test: "Test", casual: "Casual" };
    return (
      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border ${colors[type] || colors.test}`}>
        {labels[type] || "Test"}
      </span>
    );
  };

  const visibilityBadge = (t: DbTest) => {
    const isPublic = t.visibility === "public";
    return (
      <span className={`text-[11px] ${isPublic ? "text-emerald-600" : "text-gray-400"}`}>
        {isPublic ? "🌐 Public" : "🔒 Private"}
      </span>
    );
  };

  return (
    <div className={ds.page}>
      <div className="flex items-center justify-between mb-8">
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

      {/* Filter tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-100">
        {(["all", "active", "draft", "archived"] as FilterTab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-3 py-2 text-[13px] font-medium border-b-2 transition-all duration-200 ${
              tab === t ? "border-indigo-500 text-indigo-600" : "border-transparent text-gray-400 hover:text-gray-600"
            }`}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
            <span className="ml-1.5 text-[11px] text-gray-300">{counts[t]}</span>
          </button>
        ))}
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

      {!loading && !error && tests.length > 0 && filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400 text-[13px]">
          No {tab} tests found.
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className={`${ds.card} overflow-hidden`}>
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className={`${ds.tableCell} ${ds.tableHeader} text-left`}>Test</th>
                <th className={`${ds.tableCell} ${ds.tableHeader} text-left hidden sm:table-cell`}>Type</th>
                <th className={`${ds.tableCell} ${ds.tableHeader} text-left hidden md:table-cell`}>Visibility</th>
                <th className={`${ds.tableCell} ${ds.tableHeader} text-left hidden sm:table-cell`}>Candidates</th>
                <th className={`${ds.tableCell} ${ds.tableHeader} text-left hidden md:table-cell`}>Avg Score</th>
                <th className={`${ds.tableCell} ${ds.tableHeader} text-left hidden lg:table-cell`}>Created</th>
                <th className={`${ds.tableCell} ${ds.tableHeader} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((test, i) => (
                <tr key={test.id} className={`${ds.tableRow} group ${i < filtered.length - 1 ? "border-b border-gray-50" : ""}`}>
                  <td className={ds.tableCell}>
                    <div className="flex items-center gap-3">
                      {test.cover_image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={test.cover_image} alt="" className="w-10 h-10 rounded-md object-cover shrink-0 hidden sm:block" />
                      ) : (
                        <div className="w-10 h-10 rounded-md bg-gray-100 shrink-0 hidden sm:flex items-center justify-center">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-300">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                          </svg>
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            test.status === "active" ? "bg-emerald-500" : test.status === "draft" ? "bg-gray-300" : "bg-gray-200"
                          }`} />
                          <Link href={`/dashboard/tests/${test.id}`} className="text-[13px] font-medium text-gray-900 hover:text-indigo-600 transition-colors truncate">
                            {test.title}
                          </Link>
                        </div>
                        <div className="text-[11px] text-gray-400 line-clamp-1 max-w-[280px] ml-3.5">{test.description || "No description"}</div>
                      </div>
                    </div>
                  </td>
                  <td className={`${ds.tableCell} hidden sm:table-cell`}>{listingBadge(test)}</td>
                  <td className={`${ds.tableCell} hidden md:table-cell`}>{visibilityBadge(test)}</td>
                  <td className={`${ds.tableCell} text-gray-600 hidden sm:table-cell`}>{test.candidates_count}</td>
                  <td className={`${ds.tableCell} hidden md:table-cell`}>
                    <span className={`text-[13px] font-medium ${ds.scoreBadge(Number(test.avg_score))}`}>
                      {Number(test.avg_score) || "—"}
                    </span>
                  </td>
                  <td className={`${ds.tableCellMuted} hidden lg:table-cell`}>
                    {new Date(test.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </td>
                  <td className={`${ds.tableCell} text-right`}>
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                      <Link href={`/dashboard/tests/${test.id}`}
                        className="px-2 py-1 text-[11px] font-medium text-gray-500 hover:text-indigo-600 rounded hover:bg-indigo-50 transition-colors"
                        title="Edit">
                        Edit
                      </Link>
                      <button onClick={() => toggleStatus(test)}
                        className="px-2 py-1 text-[11px] font-medium text-gray-500 hover:text-emerald-600 rounded hover:bg-emerald-50 transition-colors"
                        title={test.status === "active" ? "Unpublish" : "Publish"}>
                        {test.status === "active" ? "Unpublish" : "Publish"}
                      </button>
                      {test.status === "active" && (
                        <button onClick={() => copyLink(test.id)}
                          className="px-2 py-1 text-[11px] font-medium text-gray-500 hover:text-blue-600 rounded hover:bg-blue-50 transition-colors"
                          title="Copy share link">
                          {copiedId === test.id ? "Copied!" : "Share"}
                        </button>
                      )}
                      {test.status !== "archived" && (
                        <button onClick={() => archiveTest(test)}
                          className="px-2 py-1 text-[11px] font-medium text-gray-500 hover:text-amber-600 rounded hover:bg-amber-50 transition-colors"
                          title="Archive">
                          Archive
                        </button>
                      )}
                      <button onClick={() => deleteTest(test)}
                        className="px-2 py-1 text-[11px] font-medium text-gray-500 hover:text-red-600 rounded hover:bg-red-50 transition-colors"
                        title="Delete">
                        Delete
                      </button>
                    </div>
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
