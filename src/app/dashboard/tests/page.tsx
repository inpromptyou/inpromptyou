"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

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

  return (
    <div className="p-6 lg:p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-bold text-gray-900">My Tests</h1>
          <p className="text-gray-500 text-sm mt-1">Manage assessments and track performance</p>
        </div>
        <Link href="/dashboard/create" className="bg-[#6366F1] hover:bg-[#4F46E5] text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
          Create New Test
        </Link>
      </div>

      {loading && (
        <div className="text-center py-16 text-gray-400 text-sm">Loading tests...</div>
      )}

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-4 py-3 mb-6">{error}</div>
      )}

      {!loading && !error && tests.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-400 text-sm mb-4">No tests yet. Create your first assessment!</p>
          <Link href="/dashboard/create" className="bg-[#6366F1] hover:bg-[#4F46E5] text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
            Create New Test
          </Link>
        </div>
      )}

      <div className="space-y-3">
        {tests.map((test) => (
          <Link
            key={test.id}
            href={`/dashboard/tests/${test.id}`}
            className="block bg-white rounded-lg border border-gray-200 p-5 hover:border-gray-300 transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2.5 mb-1.5">
                  <h3 className="font-semibold text-gray-900 text-sm">{test.title}</h3>
                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium ${
                    test.status === "active"
                      ? "bg-emerald-50 text-emerald-700"
                      : test.status === "draft"
                      ? "bg-gray-100 text-gray-500"
                      : "bg-gray-100 text-gray-400"
                  }`}>
                    {test.status.charAt(0).toUpperCase() + test.status.slice(1)}
                  </span>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-600 capitalize">
                    {test.test_type}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-3 line-clamp-1">{test.description || "No description"}</p>
                <div className="flex flex-wrap gap-5 text-xs text-gray-400">
                  <span>{test.candidates_count} candidates</span>
                  <span>Avg score: {Number(test.avg_score) || "n/a"}</span>
                  <span>{Number(test.completion_rate)}% completion</span>
                  <span>{test.model}</span>
                  <span className="capitalize">{test.difficulty}</span>
                  <span>Created {new Date(test.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <svg className="w-4 h-4 text-gray-300 shrink-0 ml-4 mt-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
