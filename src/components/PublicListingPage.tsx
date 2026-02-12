"use client";

import { useState, useEffect } from "react";
import PublicTestCard, { PublicTest } from "./PublicTestCard";

interface Props {
  title: string;
  subtitle: string;
  listingType: string;
  emptyIcon: string;
  emptyTitle: string;
  emptySubtitle: string;
}

const DIFFICULTIES = ["", "beginner", "intermediate", "advanced", "expert"];
const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "popular", label: "Most Taken" },
  { value: "highest", label: "Highest Avg Score" },
];

export default function PublicListingPage({ title, subtitle, listingType, emptyIcon, emptyTitle, emptySubtitle }: Props) {
  const [tests, setTests] = useState<PublicTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [sort, setSort] = useState("newest");

  useEffect(() => {
    const params = new URLSearchParams({
      listing_type: listingType,
      q: search,
      sort,
      difficulty,
    });
    setLoading(true);
    fetch(`/api/tests/public?${params}`)
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d)) setTests(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [listingType, search, sort, difficulty]);

  return (
    <div className="max-w-5xl mx-auto px-5 sm:px-6 py-14">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tests..."
            className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
          />
        </div>
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          className="border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
        >
          <option value="">All Difficulties</option>
          {DIFFICULTIES.filter(Boolean).map((d) => (
            <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
        >
          {SORT_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400 text-sm">Loading...</div>
      ) : tests.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 px-5 py-20 text-center">
          <div className="text-3xl mb-3">{emptyIcon}</div>
          <p className="text-gray-500 text-sm mb-1">{emptyTitle}</p>
          <p className="text-xs text-gray-300">{emptySubtitle}</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {tests.map((test) => (
            <PublicTestCard key={test.id} test={test} />
          ))}
        </div>
      )}
    </div>
  );
}
