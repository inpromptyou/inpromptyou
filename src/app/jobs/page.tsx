"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

interface Job {
  id: number;
  title: string;
  company: string;
  description: string;
  location: string;
  salary_range: string;
  required_score: number;
  test_id: number | null;
  test_title: string | null;
  created_at: string;
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/jobs")
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d)) setJobs(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Nav />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-5 sm:px-6 py-14">
          <div className="mb-10">
            <h1 className="text-2xl font-bold text-gray-900">Open Roles</h1>
            <p className="text-sm text-gray-500 mt-1">Apply by completing a prompting assessment</p>
          </div>

          {loading ? (
            <div className="text-center py-16 text-gray-400 text-sm">Loading jobs...</div>
          ) : jobs.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 px-5 py-16 text-center">
              <p className="text-gray-400 text-sm mb-2">No open roles at the moment</p>
              <p className="text-xs text-gray-300">Check back soon — employers are adding new listings regularly</p>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <div key={job.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:border-gray-300 transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg font-semibold text-gray-900">{job.title}</h2>
                      <p className="text-sm text-[#6366F1] font-medium mt-0.5">{job.company}</p>
                      {job.description && <p className="text-sm text-gray-500 mt-2 line-clamp-2">{job.description}</p>}
                      <div className="flex flex-wrap gap-3 mt-3 text-xs text-gray-400">
                        {job.location && <span>📍 {job.location}</span>}
                        {job.salary_range && <span>💰 {job.salary_range}</span>}
                        {job.required_score > 0 && <span>🎯 Min PromptScore: {job.required_score}</span>}
                        <span>Posted {new Date(job.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    {job.test_id && (
                      <Link
                        href={`/test/${job.test_id}`}
                        className="shrink-0 ml-4 bg-[#6366F1] hover:bg-[#4F46E5] text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                      >
                        Apply →
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
