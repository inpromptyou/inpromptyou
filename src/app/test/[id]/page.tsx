"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { mockTests } from "@/lib/mockData";

interface TestData {
  id: string;
  name: string;
  description: string;
  model: string;
  taskDescription: string;
  maxAttempts: number;
  timeLimitMinutes: number;
  tokenBudget: number;
}

export default function TestLandingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // Try to load from mock data first, will attempt DB fetch
  const mockTest = mockTests.find((t) => t.id === id) || mockTests[0];
  const [test, setTest] = useState<TestData>({
    id: mockTest.id,
    name: mockTest.name,
    description: mockTest.description,
    model: mockTest.model,
    taskDescription: mockTest.taskDescription,
    maxAttempts: mockTest.maxAttempts,
    timeLimitMinutes: mockTest.timeLimitMinutes,
    tokenBudget: mockTest.tokenBudget,
  });

  useEffect(() => {
    // Try fetching real test data from DB
    fetch(`/api/tests/${id}`)
      .then((r) => {
        if (!r.ok) return null;
        return r.json();
      })
      .then((d) => {
        if (d && d.title) {
          setTest({
            id: d.id?.toString() || id,
            name: d.title,
            description: d.description || "",
            model: d.model || "GPT-4o",
            taskDescription: d.task_prompt || d.taskDescription || "",
            maxAttempts: d.max_attempts || 5,
            timeLimitMinutes: d.time_limit_minutes || 15,
            tokenBudget: d.token_budget || 2000,
          });
        }
      })
      .catch(() => {});
  }, [id]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-5 py-4 flex items-center justify-between">
          <Link href="/" className="font-bold text-base text-gray-900">InpromptiFy</Link>
          <span className="text-xs text-gray-400">AI Prompting Assessment</span>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 py-14">
        <div className="mb-8">
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">{test.model}</span>
          <h1 className="text-2xl font-bold text-gray-900 mt-1 mb-2">{test.name}</h1>
          <p className="text-sm text-gray-600 leading-relaxed">{test.description}</p>
        </div>

        <div className="grid grid-cols-4 gap-3 mb-8">
          {[
            { label: "Time", value: `${test.timeLimitMinutes}m` },
            { label: "Attempts", value: test.maxAttempts.toString() },
            { label: "Tokens", value: test.tokenBudget.toLocaleString() },
            { label: "Model", value: test.model },
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
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Enter your details to begin</h2>
          <form onSubmit={(e) => e.preventDefault()} className="space-y-3">
            <div>
              <label htmlFor="name" className="block text-xs font-medium text-gray-500 mb-1">Full Name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent"
                placeholder="Your full name"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-gray-500 mb-1">Email Address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent"
                placeholder="you@example.com"
              />
            </div>
            <Link
              href={`/test/${test.id}/sandbox`}
              className="block w-full bg-[#6366F1] hover:bg-[#4F46E5] text-white text-center py-2.5 rounded-md text-sm font-medium transition-colors"
            >
              Start Test
            </Link>
          </form>
          <p className="text-[11px] text-gray-400 mt-3 text-center">Your results will be shared with the test creator.</p>
        </div>
      </div>
    </div>
  );
}
