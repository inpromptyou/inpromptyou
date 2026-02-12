"use client";

import { useState, useEffect } from "react";

interface ProfileData {
  name: string;
  email: string;
  avatar_url: string;
  bio: string;
  work_history: string;
  linkedin_url: string;
  skills_tags: string;
  role: string;
  plan: string;
  prompt_score: number | null;
  created_at: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    name: "", avatarUrl: "", bio: "", workHistory: "", linkedinUrl: "", skillsTags: "",
  });

  useEffect(() => {
    fetch("/api/profile")
      .then(r => r.json())
      .then(d => {
        if (d.name) {
          setProfile(d);
          setForm({
            name: d.name || "",
            avatarUrl: d.avatar_url || "",
            bio: d.bio || "",
            workHistory: d.work_history || "",
            linkedinUrl: d.linkedin_url || "",
            skillsTags: d.skills_tags || "",
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const completeness = (() => {
    const fields = [
      { filled: !!form.name, weight: 20 },
      { filled: true, weight: 20 }, // email always filled
      { filled: !!form.avatarUrl, weight: 15 },
      { filled: !!form.bio, weight: 15 },
      { filled: !!form.workHistory, weight: 15 },
      { filled: !!form.linkedinUrl, weight: 10 },
      { filled: !!form.skillsTags, weight: 5 },
    ];
    return fields.reduce((sum, f) => sum + (f.filled ? f.weight : 0), 0);
  })();

  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch { /* ignore */ }
    finally { setSaving(false); }
  };

  if (loading) return <div className="p-6 lg:p-8 text-gray-400 text-sm">Loading profile...</div>;

  return (
    <div className="p-6 lg:p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-500 text-sm mt-1">Complete your profile to stand out to employers</p>
      </div>

      {/* Completeness Bar */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-900">Profile Completeness</span>
          <span className={`text-sm font-bold ${completeness >= 80 ? "text-emerald-600" : completeness >= 50 ? "text-amber-600" : "text-red-500"}`}>{completeness}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
          <div className={`h-full rounded-full transition-all ${completeness >= 80 ? "bg-emerald-500" : completeness >= 50 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${completeness}%` }} />
        </div>
      </div>

      {success && (
        <div className="text-sm text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-md px-4 py-3 mb-6">Profile saved successfully!</div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Full Name</label>
            <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Avatar URL</label>
            <input type="url" value={form.avatarUrl} onChange={e => setForm(p => ({ ...p, avatarUrl: e.target.value }))} className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent" placeholder="https://..." />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Bio / Description</label>
          <textarea value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} rows={3} className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent resize-none" placeholder="Tell employers about yourself..." />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Work History</label>
          <textarea value={form.workHistory} onChange={e => setForm(p => ({ ...p, workHistory: e.target.value }))} rows={4} className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent resize-none" placeholder="Past roles and experience..." />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">LinkedIn URL</label>
            <input type="url" value={form.linkedinUrl} onChange={e => setForm(p => ({ ...p, linkedinUrl: e.target.value }))} className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent" placeholder="https://linkedin.com/in/..." />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Skills (comma-separated)</label>
            <input type="text" value={form.skillsTags} onChange={e => setForm(p => ({ ...p, skillsTags: e.target.value }))} className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent" placeholder="AI prompting, content strategy, data analysis" />
          </div>
        </div>

        <button onClick={handleSave} disabled={saving} className="bg-[#6366F1] hover:bg-[#4F46E5] disabled:opacity-60 text-white px-6 py-2.5 rounded-md text-sm font-medium transition-colors">
          {saving ? "Saving..." : "Save Profile"}
        </button>
      </div>
    </div>
  );
}
