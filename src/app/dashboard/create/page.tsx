"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const steps = ["Basics", "Task", "Settings", "Scoring", "Review"];
const TEST_TYPES = [
  { value: "email", label: "Email", desc: "Write professional emails" },
  { value: "code", label: "Code", desc: "Debug or generate code" },
  { value: "data", label: "Data", desc: "Analyze or transform data" },
  { value: "creative", label: "Creative", desc: "Creative writing tasks" },
  { value: "custom", label: "Custom", desc: "Define your own task" },
];
const DIFFICULTIES = ["beginner", "intermediate", "advanced", "expert"];

interface FormState {
  title: string;
  description: string;
  taskPrompt: string;
  expectedOutcomes: string;
  testType: string;
  difficulty: string;
  timeLimitMinutes: number;
  maxAttempts: number;
  tokenBudget: number;
  model: string;
  scoringWeights: { accuracy: number; efficiency: number; speed: number };
}

export default function CreateTestPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState<FormState>({
    title: "",
    description: "",
    taskPrompt: "",
    expectedOutcomes: "",
    testType: "custom",
    difficulty: "intermediate",
    timeLimitMinutes: 15,
    maxAttempts: 5,
    tokenBudget: 2000,
    model: "gpt-4o",
    scoringWeights: { accuracy: 40, efficiency: 30, speed: 30 },
  });

  const update = (field: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const updateWeight = (key: string, value: number) => {
    setForm((prev) => ({
      ...prev,
      scoringWeights: { ...prev.scoringWeights, [key]: value },
    }));
  };

  const validateStep = (s: number): boolean => {
    const errs: Record<string, string> = {};
    if (s === 0) {
      if (!form.title.trim()) errs.title = "Title is required";
      if (!form.testType) errs.testType = "Select a test type";
    } else if (s === 1) {
      if (!form.taskPrompt.trim()) errs.taskPrompt = "Task prompt is required";
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const goNext = () => {
    if (validateStep(step)) setStep(step + 1);
  };

  const handleSubmit = async (status: "draft" | "active") => {
    if (!validateStep(0) || !validateStep(1)) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/tests/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, status }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create test");
        setLoading(false);
        return;
      }

      router.push(`/dashboard/tests/${data.id}`);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const modelLabel = form.model === "gpt-4o" ? "GPT-4o" : form.model === "claude" ? "Claude" : "Gemini";
  const weightsTotal = form.scoringWeights.accuracy + form.scoringWeights.efficiency + form.scoringWeights.speed;

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Create New Test</h1>
        <p className="text-gray-600 text-sm mt-1">Build an AI prompting assessment</p>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-10">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <button
              onClick={() => { if (i < step || validateStep(step)) setStep(i); }}
              className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                i === step ? "text-[#6366F1]" : i < step ? "text-[#10B981]" : "text-gray-400"
              }`}
            >
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                i === step ? "bg-[#6366F1] text-white" : i < step ? "bg-[#10B981] text-white" : "bg-gray-200 text-gray-500"
              }`}>
                {i < step ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                ) : i + 1}
              </span>
              <span className="hidden sm:inline">{s}</span>
            </button>
            {i < steps.length - 1 && <div className={`flex-1 h-px ${i < step ? "bg-[#10B981]" : "bg-gray-200"}`} />}
          </div>
        ))}
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-4 py-3 mb-6">{error}</div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-8">
        {/* Step 1: Basics */}
        {step === 0 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Test Basics</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Test Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent ${fieldErrors.title ? "border-red-300" : "border-gray-300"}`}
                placeholder="e.g., Write a Marketing Email"
              />
              {fieldErrors.title && <p className="text-xs text-red-500 mt-1">{fieldErrors.title}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent resize-none"
                placeholder="Brief description of what this test evaluates..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Test Type *</label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {TEST_TYPES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => update("testType", t.value)}
                    className={`p-3 rounded-lg border-2 text-left transition-colors ${
                      form.testType === t.value ? "border-[#6366F1] bg-[#6366F1]/10" : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="font-medium text-sm text-gray-900">{t.label}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{t.desc}</div>
                  </button>
                ))}
              </div>
              {fieldErrors.testType && <p className="text-xs text-red-500 mt-1">{fieldErrors.testType}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty Level</label>
              <div className="flex gap-2">
                {DIFFICULTIES.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => update("difficulty", d)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                      form.difficulty === d ? "border-[#6366F1] bg-[#6366F1]/10 text-[#6366F1]" : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    {d.charAt(0).toUpperCase() + d.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Task */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Define the Task</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Task Prompt (what candidates see) *</label>
              <p className="text-xs text-gray-500 mb-2">Be specific about what candidates need to accomplish using AI.</p>
              <textarea
                value={form.taskPrompt}
                onChange={(e) => update("taskPrompt", e.target.value)}
                rows={6}
                className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent resize-none ${fieldErrors.taskPrompt ? "border-red-300" : "border-gray-300"}`}
                placeholder="Describe the task in detail..."
              />
              {fieldErrors.taskPrompt && <p className="text-xs text-red-500 mt-1">{fieldErrors.taskPrompt}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expected Outcomes</label>
              <p className="text-xs text-gray-500 mb-2">Describe what a successful result looks like. Used for scoring.</p>
              <textarea
                value={form.expectedOutcomes}
                onChange={(e) => update("expectedOutcomes", e.target.value)}
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent resize-none"
                placeholder="What does a high-quality output look like?"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">AI Model</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { value: "gpt-4o", name: "GPT-4o", provider: "OpenAI" },
                  { value: "claude", name: "Claude", provider: "Anthropic" },
                  { value: "gemini", name: "Gemini", provider: "Google" },
                ].map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => update("model", m.value)}
                    className={`p-4 rounded-lg border-2 text-left transition-colors ${
                      form.model === m.value ? "border-[#6366F1] bg-[#6366F1]/10" : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="font-semibold text-sm text-gray-900">{m.name}</div>
                    <div className="text-xs text-gray-500">{m.provider}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Settings */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Test Settings</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Attempts</label>
                <input type="number" value={form.maxAttempts} onChange={(e) => update("maxAttempts", parseInt(e.target.value) || 1)} min={1} max={20}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent" />
                <p className="text-xs text-gray-500 mt-1">Number of prompts allowed</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time Limit (minutes)</label>
                <input type="number" value={form.timeLimitMinutes} onChange={(e) => update("timeLimitMinutes", parseInt(e.target.value) || 5)} min={1} max={120}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent" />
                <p className="text-xs text-gray-500 mt-1">Total time to complete</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Token Budget</label>
                <input type="number" value={form.tokenBudget} onChange={(e) => update("tokenBudget", parseInt(e.target.value) || 500)} min={100} max={50000} step={500}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent" />
                <p className="text-xs text-gray-500 mt-1">Max tokens across all prompts</p>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Scoring */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Scoring Weights</h2>
            <p className="text-sm text-gray-600">Customize how candidates are scored. Weights should sum to 100.</p>
            {weightsTotal !== 100 && (
              <div className="text-sm text-amber-600 bg-amber-50 border border-amber-100 rounded-md px-3 py-2">
                Weights sum to {weightsTotal} — they should total 100.
              </div>
            )}
            <div className="space-y-4">
              {(["accuracy", "efficiency", "speed"] as const).map((key) => (
                <div key={key} className="flex items-center gap-4">
                  <label className="text-sm font-medium text-gray-700 w-24 capitalize">{key}</label>
                  <input
                    type="range" min={0} max={100} value={form.scoringWeights[key]}
                    onChange={(e) => updateWeight(key, parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-sm font-mono text-gray-600 w-10 text-right">{form.scoringWeights[key]}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 5: Review */}
        {step === 4 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Review &amp; Publish</h2>

            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-gray-500">Title</span><p className="font-medium text-gray-900 mt-0.5">{form.title || "Untitled"}</p></div>
                <div><span className="text-gray-500">Type</span><p className="font-medium text-gray-900 mt-0.5 capitalize">{form.testType}</p></div>
                <div><span className="text-gray-500">Difficulty</span><p className="font-medium text-gray-900 mt-0.5 capitalize">{form.difficulty}</p></div>
                <div><span className="text-gray-500">AI Model</span><p className="font-medium text-gray-900 mt-0.5">{modelLabel}</p></div>
                <div><span className="text-gray-500">Time Limit</span><p className="font-medium text-gray-900 mt-0.5">{form.timeLimitMinutes}m</p></div>
                <div><span className="text-gray-500">Max Attempts</span><p className="font-medium text-gray-900 mt-0.5">{form.maxAttempts}</p></div>
                <div><span className="text-gray-500">Token Budget</span><p className="font-medium text-gray-900 mt-0.5">{form.tokenBudget.toLocaleString()}</p></div>
                <div><span className="text-gray-500">Scoring</span><p className="font-medium text-gray-900 mt-0.5">A:{form.scoringWeights.accuracy} E:{form.scoringWeights.efficiency} S:{form.scoringWeights.speed}</p></div>
              </div>
              {form.description && <div className="text-sm"><span className="text-gray-500">Description</span><p className="text-gray-900 mt-0.5">{form.description}</p></div>}
              {form.taskPrompt && <div className="text-sm"><span className="text-gray-500">Task Prompt</span><p className="text-gray-900 mt-0.5 whitespace-pre-wrap">{form.taskPrompt}</p></div>}
              {form.expectedOutcomes && <div className="text-sm"><span className="text-gray-500">Expected Outcomes</span><p className="text-gray-900 mt-0.5">{form.expectedOutcomes}</p></div>}
            </div>

            {/* Candidate Preview */}
            <div className="border border-dashed border-gray-300 rounded-lg p-6">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-3 font-medium">Candidate Preview</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{form.title || "Untitled Test"}</h3>
              <p className="text-sm text-gray-600 mb-3">{form.description || "No description."}</p>
              <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                <span>Model: {modelLabel}</span>
                <span>Time: {form.timeLimitMinutes}m</span>
                <span>Attempts: {form.maxAttempts}</span>
                <span className="capitalize">{form.difficulty}</span>
              </div>
              {form.taskPrompt && (
                <div className="bg-white border border-gray-200 rounded-md p-4">
                  <div className="text-xs text-gray-400 mb-2 font-medium">YOUR TASK</div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{form.taskPrompt}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={() => setStep(Math.max(0, step - 1))}
            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              step === 0 ? "invisible" : "text-gray-600 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            Back
          </button>
          <div className="flex gap-3">
            {step < steps.length - 1 ? (
              <button onClick={goNext} className="px-6 py-2.5 bg-[#6366F1] hover:bg-[#4F46E5] text-white rounded-lg text-sm font-medium transition-colors">
                Continue
              </button>
            ) : (
              <>
                <button
                  onClick={() => handleSubmit("draft")}
                  disabled={loading}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-60 rounded-lg text-sm font-medium transition-colors"
                >
                  {loading ? "Saving..." : "Save as Draft"}
                </button>
                <button
                  onClick={() => handleSubmit("active")}
                  disabled={loading}
                  className="px-6 py-2.5 bg-[#10B981] hover:bg-[#059669] disabled:opacity-60 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  {loading ? "Publishing..." : "Publish Test"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
