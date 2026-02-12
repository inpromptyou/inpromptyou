"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import PromptScoreBadge from "@/components/PromptScoreBadge";

interface LeaderboardEntry {
  rank: number;
  name: string;
  promptScore: number;
  testsCompleted: number;
  avgTokens?: number;
  avgAttempts?: number;
  avgEfficiency?: number;
  avgSpeed?: number;
  avgAccuracy?: number;
}

const fallbackData: LeaderboardEntry[] = [
  { rank: 1, name: "Sarah Chen", promptScore: 87, testsCompleted: 5, avgTokens: 420, avgAttempts: 1.8 },
  { rank: 2, name: "Marcus Rivera", promptScore: 78, testsCompleted: 4, avgTokens: 510, avgAttempts: 2.1 },
  { rank: 3, name: "Aisha Patel", promptScore: 72, testsCompleted: 3, avgTokens: 580, avgAttempts: 2.4 },
  { rank: 4, name: "James O'Brien", promptScore: 68, testsCompleted: 4, avgTokens: 640, avgAttempts: 2.6 },
  { rank: 5, name: "Yuki Tanaka", promptScore: 64, testsCompleted: 2, avgTokens: 720, avgAttempts: 3.0 },
  { rank: 6, name: "Emma Larsson", promptScore: 61, testsCompleted: 3, avgTokens: 690, avgAttempts: 2.8 },
  { rank: 7, name: "David Kim", promptScore: 58, testsCompleted: 2, avgTokens: 810, avgAttempts: 3.2 },
  { rank: 8, name: "Priya Sharma", promptScore: 55, testsCompleted: 3, avgTokens: 770, avgAttempts: 3.0 },
  { rank: 9, name: "Alex Novak", promptScore: 51, testsCompleted: 1, avgTokens: 890, avgAttempts: 3.6 },
  { rank: 10, name: "Fatima Al-Hassan", promptScore: 47, testsCompleted: 2, avgTokens: 940, avgAttempts: 3.4 },
  { rank: 11, name: "Tom Fischer", promptScore: 43, testsCompleted: 1, avgTokens: 1020, avgAttempts: 4.0 },
  { rank: 12, name: "Nina Kowalski", promptScore: 38, testsCompleted: 1, avgTokens: 1100, avgAttempts: 3.8 },
];

export default function LeaderboardPage() {
  const [data, setData] = useState<LeaderboardEntry[]>(fallbackData);

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d) && d.length > 0) setData(d); })
      .catch(() => {});
  }, []);

  return (
    <>
      <Nav />
      <main className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-5 sm:px-6 py-16">
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Leaderboard</h1>
            <p className="text-sm text-gray-500 max-w-lg">
              Ranked by Prompt Score. Fewer tokens, fewer attempts, better results.
              Scores update as candidates complete new assessments.
            </p>
          </div>

          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/80">
                  <th className="text-left py-3 px-4 font-medium text-gray-500 w-14">Rank</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Name</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500">Score</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500">Tests</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500 hidden sm:table-cell">Avg Tokens</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500 hidden sm:table-cell">Avg Attempts</th>
                </tr>
              </thead>
              <tbody>
                {data.map((person) => (
                  <tr key={person.rank} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <span className={`text-sm font-mono ${
                        person.rank <= 3 ? "font-bold text-gray-900" : "text-gray-400"
                      }`}>
                        {person.rank}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Link href={`/profile/${person.rank}`} className="font-medium text-gray-900 hover:text-[#1B5B7D] transition-colors">
                        {person.name}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <PromptScoreBadge score={person.promptScore} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-center text-gray-500">{person.testsCompleted}</td>
                    <td className="py-3 px-4 text-center text-gray-500 hidden sm:table-cell">{(person.avgTokens || 0).toLocaleString()}</td>
                    <td className="py-3 px-4 text-center text-gray-500 hidden sm:table-cell">{person.avgAttempts || 0}x</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8">
            <p className="text-sm text-gray-400">
              Want to see your name here?{" "}
              <Link href="/signup" className="text-[#1B5B7D] hover:text-[#14455E] font-medium">
                Take a test
              </Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
