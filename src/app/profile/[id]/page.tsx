"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import PromptScoreBadge from "@/components/PromptScoreBadge";

interface Profile {
  name: string;
  score: number;
  tests: number;
  joinedDate: string;
  avgTokens: number;
  avgAttempts: number;
  badges: string[];
  testHistory: { name: string; score: number; date: string; tokens: number; attempts: number }[];
  categoryScores: { category: string; score: number; tests: number }[];
}

const fallbackProfile: Profile = {
  name: "Sarah Chen",
  score: 87,
  tests: 5,
  joinedDate: "January 2026",
  avgTokens: 420,
  avgAttempts: 1.8,
  badges: ["Top 10%"],
  testHistory: [
    { name: "Write a Marketing Email", score: 87, date: "2026-02-08", tokens: 940, attempts: 2 },
    { name: "Debug This Python Code", score: 82, date: "2026-02-06", tokens: 1120, attempts: 2 },
    { name: "Summarize Legal Document", score: 78, date: "2026-02-03", tokens: 680, attempts: 3 },
    { name: "Customer Support Response", score: 91, date: "2026-01-28", tokens: 540, attempts: 1 },
    { name: "Create a Data Pipeline", score: 74, date: "2026-01-22", tokens: 1680, attempts: 3 },
  ],
  categoryScores: [
    { category: "Writing", score: 89, tests: 2 },
    { category: "Code Generation", score: 82, tests: 1 },
    { category: "Data Analysis", score: 74, tests: 1 },
    { category: "Legal", score: 78, tests: 1 },
  ],
};

function getScoreColor(score: number) {
  if (score >= 80) return "text-emerald-600";
  if (score >= 60) return "text-gray-900";
  if (score >= 40) return "text-orange-600";
  return "text-red-600";
}

export default function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [profile, setProfile] = useState<Profile>(fallbackProfile);

  useEffect(() => {
    fetch(`/api/profile/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.name) setProfile(d);
      })
      .catch(() => {});
  }, [id]);

  return (
    <>
      <Nav />
      <main className="min-h-screen bg-white">
        <div className="max-w-3xl mx-auto px-5 sm:px-6 py-14">
          {/* Profile header */}
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-10">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-xl font-bold text-gray-500">
                {profile.name.charAt(0)}
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{profile.name}</h1>
                <p className="text-xs text-gray-400 mt-0.5">Member since {profile.joinedDate}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                  <span>{profile.tests} tests</span>
                  <span className="text-gray-300">|</span>
                  <span>Avg {profile.avgTokens} tokens</span>
                  <span className="text-gray-300">|</span>
                  <span>{profile.avgAttempts}x avg attempts</span>
                </div>
                {profile.badges.length > 0 && (
                  <div className="flex gap-1.5 mt-2">
                    {profile.badges.map((badge) => (
                      <span key={badge} className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-600">
                        {badge}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="text-center">
              <PromptScoreBadge score={profile.score} size="lg" />
              <div className="text-[10px] text-gray-400 mt-1">Prompt Score</div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {profile.categoryScores.length > 0 && (
              <div className="sm:col-span-2 bg-white rounded-lg border border-gray-200 p-5">
                <h2 className="text-sm font-semibold text-gray-900 mb-4">Scores by Category</h2>
                <div className="space-y-3">
                  {profile.categoryScores.map((cat) => (
                    <div key={cat.category} className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <span className="text-sm text-gray-600 w-28">{cat.category}</span>
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-[#1B5B7D] transition-all" style={{ width: `${cat.score}%` }} />
                        </div>
                      </div>
                      <div className="flex items-center gap-3 ml-3">
                        <span className={`text-sm font-semibold w-8 text-right ${getScoreColor(cat.score)}`}>{cat.score}</span>
                        <span className="text-xs text-gray-300 w-12">{cat.tests} tests</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3">
              <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
                <div className="text-2xl font-bold text-gray-900">{profile.avgTokens}</div>
                <div className="text-[10px] text-gray-400">Avg Tokens</div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
                <div className="text-2xl font-bold text-gray-900">{profile.avgAttempts}x</div>
                <div className="text-[10px] text-gray-400">Avg Attempts</div>
              </div>
            </div>
          </div>

          {/* Test history */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-200 bg-gray-50/50">
              <h2 className="text-sm font-semibold text-gray-900">Recent Tests</h2>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2.5 px-5 font-medium text-gray-400 text-xs">Test</th>
                  <th className="text-center py-2.5 px-4 font-medium text-gray-400 text-xs">Score</th>
                  <th className="text-center py-2.5 px-4 font-medium text-gray-400 text-xs">Tokens</th>
                  <th className="text-center py-2.5 px-4 font-medium text-gray-400 text-xs">Attempts</th>
                  <th className="text-right py-2.5 px-5 font-medium text-gray-400 text-xs">Date</th>
                </tr>
              </thead>
              <tbody>
                {profile.testHistory.map((test, i) => (
                  <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                    <td className="py-2.5 px-5 font-medium text-gray-900">{test.name}</td>
                    <td className="py-2.5 px-4 text-center"><PromptScoreBadge score={test.score} size="sm" /></td>
                    <td className="py-2.5 px-4 text-center text-gray-500">{test.tokens.toLocaleString()}</td>
                    <td className="py-2.5 px-4 text-center text-gray-500">{test.attempts}</td>
                    <td className="py-2.5 px-5 text-right text-gray-400">{test.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6">
            <Link href="/leaderboard" className="text-sm text-[#1B5B7D] hover:text-[#14455E] font-medium">
              View Full Leaderboard
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
