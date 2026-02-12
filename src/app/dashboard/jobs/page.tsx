"use client";

import { useState, useEffect } from "react";

interface Job {
  id: number;
  title: string;
  company: string;
  description: string;
  location: string;
  salary_range: string;
  required_score: number;
  test_id: number | null;
  is_active: boolean;
  created_at: string;
}

interface TestOption {
  id: number;
  title: string;
}

export default function DashboardJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [tests, setTests] = useState<TestOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "", company: "", description: "", location: "", salaryRange: "", requiredScore: 0, testId: "",
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/jobs").then(r => r.json()),
      fetch("/api/tests").then(r => r.json()),
    ]).then(([jobsData, testsData]) => {
      if (Array.isArray(jobsData)) setJobs(jobsData);
      if (Array.isArray(testsData)) setTests(testsData.map((t: Record<string, unknown>) => ({ id: t.id as number, title: t.title as string })));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    if (!form.title.trim() || !form.company.trim()) {
      setError("Title and company are required");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/jobs/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error || "Failed to create job");
        return;
      }
      const newJob = await res.json();
      setJobs(prev => [newJob, ...prev]);
      setShowForm(false);
      setForm({ title: "", company: "", description: "", location: "", salaryRange: "", requiredScore: 0, testId: "" });
    } catch {
      setError("Failed to create job");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Job Listings</h1>
          <p className="text-gray-500 text-sm mt-1">Create roles that require a prompting assessment</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="bg-[#6366F1] hover:bg-[#4F46E5] text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
          {showForm ? "Cancel" : "Create Job"}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">New Job Listing</h2>
          {error && <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2 mb-4">{error}</div>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Job Title *</label>
              <input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent" placeholder="AI Content Strategist" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Company *</label>
              <input type="text" value={form.company} onChange={e => setForm(p => ({ ...p, company: e.target.value }))} className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent" placeholder="Acme Corp" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
              <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent resize-none" placeholder="Job description..." />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Location</label>
              <input type="text" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent" placeholder="Remote / NYC" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Salary Range</label>
              <input type="text" value={form.salaryRange} onChange={e => setForm(p => ({ ...p, salaryRange: e.target.value }))} className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent" placeholder="$80k - $120k" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Required PromptScore</label>
              <input type="number" value={form.requiredScore} onChange={e => setForm(p => ({ ...p, requiredScore: parseInt(e.target.value) || 0 }))} min={0} max={100} className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Linked Test</label>
              <select value={form.testId} onChange={e => setForm(p => ({ ...p, testId: e.target.value }))} className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent bg-white">
                <option value="">None</option>
                {tests.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
              </select>
            </div>
          </div>
          <button onClick={handleCreate} disabled={saving} className="mt-4 bg-[#10B981] hover:bg-[#059669] disabled:opacity-60 text-white px-6 py-2.5 rounded-md text-sm font-medium transition-colors">
            {saving ? "Creating..." : "Create Job Listing"}
          </button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 text-gray-400 text-sm">Loading jobs...</div>
      ) : jobs.length === 0 && !showForm ? (
        <div className="bg-white rounded-lg border border-gray-200 px-5 py-16 text-center">
          <p className="text-gray-400 text-sm mb-4">No job listings yet</p>
          <button onClick={() => setShowForm(true)} className="bg-[#6366F1] hover:bg-[#4F46E5] text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">Create your first job listing</button>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map(job => (
            <div key={job.id} className="bg-white rounded-lg border border-gray-200 p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">{job.title}</h3>
                  <p className="text-sm text-[#6366F1] font-medium">{job.company}</p>
                  {job.description && <p className="text-sm text-gray-500 mt-1 line-clamp-1">{job.description}</p>}
                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-400">
                    {job.location && <span>{job.location}</span>}
                    {job.salary_range && <span>{job.salary_range}</span>}
                    {job.required_score > 0 && <span>Min score: {job.required_score}</span>}
                    <span>{new Date(job.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded ${job.is_active ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                  {job.is_active ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
