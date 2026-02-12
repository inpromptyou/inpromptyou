"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import TestThumbnail from "@/components/TestThumbnail";

interface TestData {
  id: string;
  title: string;
  description: string;
  model: string;
  task_prompt: string;
  max_attempts: number;
  time_limit_minutes: number;
  token_budget: number;
  cover_image: string | null;
  company_name: string | null;
  location: string | null;
  salary_range: string | null;
  listing_type: string;
}

export default function TestLandingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [test, setTest] = useState<TestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    fetch(`/api/tests/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Test not found");
        return r.json();
      })
      .then((d) => {
        if (d && d.title) {
          setTest({
            id: d.id?.toString() || id,
            title: d.title,
            description: d.description || "",
            model: d.model || "gpt-4o",
            task_prompt: d.task_prompt || "",
            max_attempts: d.max_attempts || 5,
            time_limit_minutes: d.time_limit_minutes || 15,
            token_budget: d.token_budget || 2000,
            cover_image: d.cover_image || null,
            company_name: d.company_name || null,
            location: d.location || null,
            salary_range: d.salary_range || null,
            listing_type: d.listing_type || "test",
          });
        } else {
          setError("Test not found");
        }
      })
      .catch(() => setError("Test not found or not available"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!name.trim()) { setFormError("Name is required"); return; }
    if (!email.trim() || !email.includes("@")) { setFormError("Valid email is required"); return; }

    sessionStorage.setItem(`guest-${id}`, JSON.stringify({ name: name.trim(), email: email.trim() }));
    router.push(`/test/${id}/sandbox`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-sm text-gray-400">Loading test...</div>
      </div>
    );
  }

  if (error || !test) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-sm mb-4">{error || "Test not found"}</p>
          <Link href="/" className="text-sm text-[#6366F1] hover:text-[#4F46E5] font-medium">← Back to Home</Link>
        </div>
      </div>
    );
  }

  const modelLabel = test.model === "gpt-4o" ? "GPT-4o" : test.model === "claude" ? "Claude" : test.model === "gemini" ? "Gemini" : test.model;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-5 py-4 flex items-center justify-between">
          <Link href="/" className="font-bold text-base text-gray-900">InpromptiFy</Link>
          <span className="text-xs text-gray-400">AI Prompting Assessment</span>
        </div>
      </div>

      {/* Cover image banner */}
      <div className="w-full max-w-3xl mx-auto mt-6 px-5">
        <div className="rounded-xl overflow-hidden">
          {test.cover_image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={test.cover_image} alt="" className="w-full h-48 sm:h-56 object-cover" />
          ) : (
            <TestThumbnail
              title={test.title}
              listingType={test.listing_type}
              model={test.model}
              variant="banner"
            />
          )}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 py-14">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">{modelLabel}</span>
            {test.listing_type === "job" && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">Job</span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mt-1 mb-2">{test.title}</h1>
          <p className="text-sm text-gray-600 leading-relaxed">{test.description}</p>
          {test.listing_type === "job" && test.company_name && (
            <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-400">
              <span>🏢 {test.company_name}</span>
              {test.location && <span>📍 {test.location}</span>}
              {test.salary_range && <span>💰 {test.salary_range}</span>}
            </div>
          )}
        </div>

        <div className="grid grid-cols-4 gap-3 mb-8">
          {[
            { label: "Time", value: `${test.time_limit_minutes}m` },
            { label: "Attempts", value: test.max_attempts.toString() },
            { label: "Tokens", value: test.token_budget.toLocaleString() },
            { label: "Model", value: modelLabel },
          ].map((info) => (
            <div key={info.label} className="bg-white rounded-md border border-gray-200 p-3 text-center">
              <div className="text-[10px] text-gray-400 uppercase tracking-wide">{info.label}</div>
              <div className="font-bold text-gray-900 text-sm mt-0.5">{info.value}</div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-md border border-gray-200 p-5 mb-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">What we measure</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { metric: "Efficiency", desc: "Token usage relative to budget" },
              { metric: "Speed", desc: "Time to complete the task" },
              { metric: "Accuracy", desc: "Output quality vs. expected" },
              { metric: "Attempts", desc: "Number of prompts needed" },
            ].map((m) => (
              <div key={m.metric}>
                <div className="text-sm font-medium text-gray-900">{m.metric}</div>
                <div className="text-xs text-gray-400">{m.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-md border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-1">Enter your details to begin</h2>
          <p className="text-xs text-gray-400 mb-3">No account required — just your name and email.</p>

          {formError && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2 mb-3">{formError}</div>
          )}

          <form onSubmit={handleStart} className="space-y-3">
            <div>
              <label htmlFor="name" className="block text-xs font-medium text-gray-500 mb-1">Full Name *</label>
              <input
                id="name" type="text" value={name} onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent"
                placeholder="Your full name"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-gray-500 mb-1">Email Address *</label>
              <input
                id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent"
                placeholder="you@example.com"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-[#6366F1] hover:bg-[#4F46E5] text-white text-center py-2.5 rounded-md text-sm font-medium transition-colors"
            >
              Start Test
            </button>
          </form>
          <p className="text-[11px] text-gray-400 mt-3 text-center">Your results will be shared with the test creator.</p>
        </div>
      </div>
    </div>
  );
}
