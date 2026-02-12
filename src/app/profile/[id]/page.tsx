"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import PromptScoreBadge from "@/components/PromptScoreBadge";

interface Profile {
  name: string;
  email: string;
  avatar_url: string;
  bio: string;
  work_history: string;
  linkedin_url: string;
  skills_tags: string;
  prompt_score: number | null;
  created_at: string;
  testHistory: { testName: string; score: number; completedAt: string }[];
}

export default function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/profile/${id}`)
      .then((r) => r.json())
      .then((d) => { if (d.name) setProfile(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <>
        <Nav />
        <main className="min-h-screen bg-white flex items-center justify-center">
          <p className="text-sm text-gray-400">Loading profile...</p>
        </main>
        <Footer />
      </>
    );
  }

  if (!profile) {
    return (
      <>
        <Nav />
        <main className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500 text-sm mb-4">Profile not found</p>
            <Link href="/" className="text-sm text-[#6366F1] font-medium">← Back to Home</Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const skills = profile.skills_tags ? profile.skills_tags.split(",").map(s => s.trim()).filter(Boolean) : [];

  return (
    <>
      <Nav />
      <main className="min-h-screen bg-white">
        <div className="max-w-3xl mx-auto px-5 sm:px-6 py-14">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-10">
            <div className="flex items-center gap-5">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.name} className="w-16 h-16 rounded-full object-cover" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-xl font-bold text-gray-500">
                  {profile.name.charAt(0)}
                </div>
              )}
              <div>
                <h1 className="text-xl font-bold text-gray-900">{profile.name}</h1>
                {profile.bio && <p className="text-sm text-gray-500 mt-1">{profile.bio}</p>}
                <p className="text-xs text-gray-400 mt-1">Member since {new Date(profile.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</p>
                {profile.linkedin_url && (
                  <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-xs text-[#6366F1] hover:text-[#4F46E5] font-medium mt-1 inline-block">LinkedIn →</a>
                )}
              </div>
            </div>
            {profile.prompt_score != null && profile.prompt_score > 0 && (
              <div className="text-center">
                <PromptScoreBadge score={profile.prompt_score} size="lg" />
                <div className="text-[10px] text-gray-400 mt-1">Prompt Score</div>
              </div>
            )}
          </div>

          {skills.length > 0 && (
            <div className="mb-8">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {skills.map(skill => (
                  <span key={skill} className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600">{skill}</span>
                ))}
              </div>
            </div>
          )}

          {profile.work_history && (
            <div className="mb-8">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">Work History</h2>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{profile.work_history}</p>
            </div>
          )}

          {profile.testHistory && profile.testHistory.length > 0 && (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-200 bg-gray-50/50">
                <h2 className="text-sm font-semibold text-gray-900">Recent Tests</h2>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2.5 px-5 font-medium text-gray-400 text-xs">Test</th>
                    <th className="text-center py-2.5 px-4 font-medium text-gray-400 text-xs">Score</th>
                    <th className="text-right py-2.5 px-5 font-medium text-gray-400 text-xs">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {profile.testHistory.map((test, i) => (
                    <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                      <td className="py-2.5 px-5 font-medium text-gray-900">{test.testName}</td>
                      <td className="py-2.5 px-4 text-center"><PromptScoreBadge score={test.score} size="sm" /></td>
                      <td className="py-2.5 px-5 text-right text-gray-400">{test.completedAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {(!profile.testHistory || profile.testHistory.length === 0) && !profile.work_history && skills.length === 0 && (
            <div className="bg-white rounded-lg border border-gray-200 px-5 py-16 text-center">
              <p className="text-gray-400 text-sm">This profile doesn&apos;t have any activity yet</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
