"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ds } from "@/lib/designSystem";

const steps = ["Basics", "Task", "Visibility", "Settings", "Scoring", "Review"];
const TEST_TYPES = [
  { value: "email", label: "Email", desc: "Professional emails" },
  { value: "code", label: "Code", desc: "Debug or generate" },
  { value: "data", label: "Data", desc: "Analyze & transform" },
  { value: "creative", label: "Creative", desc: "Creative writing" },
  { value: "custom", label: "Custom", desc: "Define your own" },
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
  coverImage: string;
  visibility: "public" | "private";
  listingType: "job" | "test" | "casual";
  companyName: string;
  location: string;
  salaryRange: string;
}

export default function CreateTestPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState<FormState>({
    title: "", description: "", taskPrompt: "", expectedOutcomes: "",
    testType: "custom", difficulty: "intermediate",
    timeLimitMinutes: 15, maxAttempts: 5, tokenBudget: 2000, model: "gpt-4o",
    scoringWeights: { accuracy: 40, efficiency: 30, speed: 30 },
    coverImage: "", visibility: "private", listingType: "test",
    companyName: "", location: "", salaryRange: "",
  });

  const update = (field: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const updateWeight = (key: string, value: number) => {
    setForm((prev) => ({ ...prev, scoringWeights: { ...prev.scoringWeights, [key]: value } }));
  };

  const validateStep = (s: number): boolean => {
    const errs: Record<string, string> = {};
    if (s === 0) {
      if (!form.title.trim()) errs.title = "Title is required";
      if (!form.testType) errs.testType = "Select a test type";
    } else if (s === 1) {
      if (!form.taskPrompt.trim()) errs.taskPrompt = "Task prompt is required";
    } else if (s === 2) {
      if (form.visibility === "public" && form.listingType === "job") {
        if (!form.companyName.trim()) errs.companyName = "Company name is required for job listings";
      }
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const goNext = () => { if (validateStep(step)) setStep(step + 1); };

  const handleSubmit = async (status: "draft" | "active") => {
    if (!validateStep(0) || !validateStep(1)) { setError("Please fill in all required fields."); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/tests/create", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, status }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to create test"); setLoading(false); return; }
      router.push(`/dashboard/tests/${data.id}`);
    } catch { setError("Something went wrong. Please try again."); setLoading(false); }
  };

  const modelLabel = form.model === "gpt-4o" ? "GPT-4o" : form.model === "claude" ? "Claude" : "Gemini";
  const weightsTotal = form.scoringWeights.accuracy + form.scoringWeights.efficiency + form.scoringWeights.speed;
  const listingLabel = form.listingType === "job" ? "Job Listing" : form.listingType === "casual" ? "Casual / Practice" : "Professional Assessment";

  return (
    <div className={`${ds.page} max-w-[800px]`}>
      <div className="mb-10">
        <h1 className={ds.pageTitle}>Create New Test</h1>
        <p className={ds.pageSubtitle}>Build an AI prompting assessment</p>
      </div>

      {/* Progress steps */}
      <div className="flex items-center gap-1 mb-10">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-1 flex-1">
            <button
              onClick={() => { if (i < step || validateStep(step)) setStep(i); }}
              className={`flex items-center gap-2 text-[12px] font-medium transition-all duration-200 ${
                i === step ? "text-indigo-600" : i < step ? "text-emerald-600" : "text-gray-300"
              }`}
            >
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold transition-all duration-200 ${
                i === step ? "bg-indigo-600 text-white" : i < step ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-400"
              }`}>
                {i < step ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                ) : i + 1}
              </span>
              <span className="hidden sm:inline">{s}</span>
            </button>
            {i < steps.length - 1 && <div className={`flex-1 h-px transition-colors duration-300 ${i < step ? "bg-emerald-400" : "bg-gray-100"}`} />}
          </div>
        ))}
      </div>

      {error && (
        <div className="text-[13px] text-red-600 bg-red-50 border border-red-100 rounded-md px-4 py-3 mb-6">{error}</div>
      )}

      <div className={`${ds.card} p-7`}>
        {/* Step 1: Basics */}
        {step === 0 && (
          <div className="space-y-6">
            <h2 className={ds.sectionTitle}>Test Basics</h2>
            <div>
              <label className={ds.inputLabel}>Test Title *</label>
              <input type="text" value={form.title} onChange={(e) => update("title", e.target.value)}
                className={`${ds.input} ${fieldErrors.title ? "border-red-300 focus:ring-red-200" : ""}`}
                placeholder="e.g., Write a Marketing Email" />
              {fieldErrors.title && <p className={ds.inputError}>{fieldErrors.title}</p>}
            </div>
            <div>
              <label className={ds.inputLabel}>Description</label>
              <textarea value={form.description} onChange={(e) => update("description", e.target.value)} rows={3}
                className={`${ds.input} resize-none`} placeholder="Brief description of what this test evaluates…" />
            </div>
            <div>
              <label className={ds.inputLabel}>Cover Image (optional)</label>
              <input type="url" value={form.coverImage} onChange={(e) => update("coverImage", e.target.value)}
                className={ds.input} placeholder="https://example.com/image.jpg" />
              <p className="text-[11px] text-gray-400 mt-1">Paste an image URL — shown on test cards and landing page</p>
              {form.coverImage && (
                <div className="mt-3 rounded-lg overflow-hidden border border-gray-200 max-w-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={form.coverImage} alt="Cover preview" className="w-full h-36 object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                </div>
              )}
            </div>
            <div>
              <label className={`${ds.inputLabel} mb-2.5`}>Test Type *</label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {TEST_TYPES.map((t) => (
                  <button key={t.value} type="button" onClick={() => update("testType", t.value)}
                    className={`p-3 rounded-lg border text-left transition-all duration-200 ${
                      form.testType === t.value ? "border-indigo-400 bg-indigo-50/50 shadow-sm shadow-indigo-600/5" : "border-gray-200 hover:border-gray-300"
                    }`}>
                    <div className="font-medium text-[13px] text-gray-900">{t.label}</div>
                    <div className="text-[11px] text-gray-400 mt-0.5">{t.desc}</div>
                  </button>
                ))}
              </div>
              {fieldErrors.testType && <p className={ds.inputError}>{fieldErrors.testType}</p>}
            </div>
            <div>
              <label className={`${ds.inputLabel} mb-2.5`}>Difficulty</label>
              <div className="flex gap-2">
                {DIFFICULTIES.map((d) => (
                  <button key={d} type="button" onClick={() => update("difficulty", d)}
                    className={`px-3.5 py-1.5 rounded-md text-[12px] font-medium border transition-all duration-200 ${
                      form.difficulty === d ? "border-indigo-400 bg-indigo-50/50 text-indigo-600" : "border-gray-200 text-gray-500 hover:border-gray-300"
                    }`}>
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
            <h2 className={ds.sectionTitle}>Define the Task</h2>
            <div>
              <label className={ds.inputLabel}>Task Prompt *</label>
              <p className="text-[11px] text-gray-400 mb-2">What candidates will see and need to accomplish.</p>
              <textarea value={form.taskPrompt} onChange={(e) => update("taskPrompt", e.target.value)} rows={6}
                className={`${ds.input} resize-none ${fieldErrors.taskPrompt ? "border-red-300 focus:ring-red-200" : ""}`}
                placeholder="Describe the task in detail…" />
              {fieldErrors.taskPrompt && <p className={ds.inputError}>{fieldErrors.taskPrompt}</p>}
            </div>
            <div>
              <label className={ds.inputLabel}>Expected Outcomes</label>
              <p className="text-[11px] text-gray-400 mb-2">What a successful result looks like. Used for scoring.</p>
              <textarea value={form.expectedOutcomes} onChange={(e) => update("expectedOutcomes", e.target.value)} rows={4}
                className={`${ds.input} resize-none`} placeholder="What does a high-quality output look like?" />
            </div>
            <div>
              <label className={`${ds.inputLabel} mb-2.5`}>AI Model</label>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { value: "gpt-4o", name: "GPT-4o", provider: "OpenAI" },
                  { value: "claude", name: "Claude", provider: "Anthropic" },
                  { value: "gemini", name: "Gemini", provider: "Google" },
                ].map((m) => (
                  <button key={m.value} type="button" onClick={() => update("model", m.value)}
                    className={`p-3.5 rounded-lg border text-left transition-all duration-200 ${
                      form.model === m.value ? "border-indigo-400 bg-indigo-50/50 shadow-sm shadow-indigo-600/5" : "border-gray-200 hover:border-gray-300"
                    }`}>
                    <div className="font-medium text-[13px] text-gray-900">{m.name}</div>
                    <div className="text-[11px] text-gray-400">{m.provider}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Visibility & Listing */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className={ds.sectionTitle}>Visibility & Listing</h2>

            <div>
              <label className={`${ds.inputLabel} mb-2.5`}>Visibility</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: "private" as const, label: "Private", desc: "Only accessible via direct link. Not listed anywhere.", icon: "🔒" },
                  { value: "public" as const, label: "Public", desc: "Appears in public listings. Anyone can discover it.", icon: "🌐" },
                ].map((v) => (
                  <button key={v.value} type="button" onClick={() => update("visibility", v.value)}
                    className={`p-4 rounded-lg border text-left transition-all duration-200 ${
                      form.visibility === v.value ? "border-indigo-400 bg-indigo-50/50 shadow-sm shadow-indigo-600/5" : "border-gray-200 hover:border-gray-300"
                    }`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base">{v.icon}</span>
                      <span className="font-medium text-[13px] text-gray-900">{v.label}</span>
                    </div>
                    <div className="text-[11px] text-gray-400">{v.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {form.visibility === "public" && (
              <>
                <div>
                  <label className={`${ds.inputLabel} mb-2.5`}>Listing Type</label>
                  <p className="text-[11px] text-gray-400 mb-3">Choose where your test appears in public directories.</p>
                  <div className="grid grid-cols-3 gap-2.5">
                    {[
                      { value: "job" as const, label: "Job", desc: "Real job opening — shown on Jobs board", icon: "💼" },
                      { value: "test" as const, label: "Assessment", desc: "Professional test — shown on Assessments page", icon: "📋" },
                      { value: "casual" as const, label: "Casual", desc: "Fun / practice — shown on Explore page", icon: "🎮" },
                    ].map((t) => (
                      <button key={t.value} type="button" onClick={() => update("listingType", t.value)}
                        className={`p-3.5 rounded-lg border text-left transition-all duration-200 ${
                          form.listingType === t.value ? "border-indigo-400 bg-indigo-50/50 shadow-sm shadow-indigo-600/5" : "border-gray-200 hover:border-gray-300"
                        }`}>
                        <div className="flex items-center gap-1.5 mb-1">
                          <span>{t.icon}</span>
                          <span className="font-medium text-[13px] text-gray-900">{t.label}</span>
                        </div>
                        <div className="text-[11px] text-gray-400">{t.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {form.listingType === "job" && (
                  <div className="space-y-4 p-4 rounded-lg bg-gray-50 border border-gray-100">
                    <h3 className="text-[13px] font-medium text-gray-700">Job Details</h3>
                    <div>
                      <label className={ds.inputLabel}>Company Name *</label>
                      <input type="text" value={form.companyName} onChange={(e) => update("companyName", e.target.value)}
                        className={`${ds.input} ${fieldErrors.companyName ? "border-red-300 focus:ring-red-200" : ""}`}
                        placeholder="e.g., Acme Corp" />
                      {fieldErrors.companyName && <p className={ds.inputError}>{fieldErrors.companyName}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={ds.inputLabel}>Location</label>
                        <input type="text" value={form.location} onChange={(e) => update("location", e.target.value)}
                          className={ds.input} placeholder="e.g., Remote, NYC" />
                      </div>
                      <div>
                        <label className={ds.inputLabel}>Salary Range</label>
                        <input type="text" value={form.salaryRange} onChange={(e) => update("salaryRange", e.target.value)}
                          className={ds.input} placeholder="e.g., $80k–$120k" />
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Step 4: Settings */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className={ds.sectionTitle}>Test Settings</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {[
                { label: "Max Attempts", field: "maxAttempts", value: form.maxAttempts, min: 1, max: 20, hint: "Prompts allowed" },
                { label: "Time Limit (min)", field: "timeLimitMinutes", value: form.timeLimitMinutes, min: 1, max: 120, hint: "Total time" },
                { label: "Token Budget", field: "tokenBudget", value: form.tokenBudget, min: 100, max: 50000, step: 500, hint: "All prompts combined" },
              ].map((s) => (
                <div key={s.field}>
                  <label className={ds.inputLabel}>{s.label}</label>
                  <input type="number" value={s.value} onChange={(e) => update(s.field, parseInt(e.target.value) || s.min)} min={s.min} max={s.max} step={s.step}
                    className={ds.input} />
                  <p className="text-[11px] text-gray-400 mt-1">{s.hint}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 5: Scoring */}
        {step === 4 && (
          <div className="space-y-6">
            <h2 className={ds.sectionTitle}>Scoring Weights</h2>
            <p className="text-[13px] text-gray-500">Weights should sum to 100.</p>
            {weightsTotal !== 100 && (
              <div className="text-[12px] text-amber-600 bg-amber-50 border border-amber-100 rounded-md px-3 py-2">
                Current total: {weightsTotal} — should be 100.
              </div>
            )}
            <div className="space-y-5">
              {(["accuracy", "efficiency", "speed"] as const).map((key) => (
                <div key={key}>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[13px] font-medium text-gray-700 capitalize">{key}</label>
                    <span className="text-[12px] font-mono text-gray-500">{form.scoringWeights[key]}%</span>
                  </div>
                  <input type="range" min={0} max={100} value={form.scoringWeights[key]}
                    onChange={(e) => updateWeight(key, parseInt(e.target.value))}
                    className="w-full h-1 bg-gray-200 rounded-full appearance-none cursor-pointer accent-indigo-600" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 6: Review */}
        {step === 5 && (
          <div className="space-y-6">
            <h2 className={ds.sectionTitle}>Review &amp; Publish</h2>

            {form.coverImage && (
              <div className="rounded-lg overflow-hidden border border-gray-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={form.coverImage} alt="Cover" className="w-full h-40 object-cover" />
              </div>
            )}

            <div className="space-y-3">
              {[
                { label: "Title", value: form.title || "Untitled" },
                { label: "Type", value: form.testType },
                { label: "Difficulty", value: form.difficulty },
                { label: "Visibility", value: form.visibility === "public" ? `Public — ${listingLabel}` : "Private" },
                ...(form.visibility === "public" && form.listingType === "job" ? [
                  { label: "Company", value: form.companyName || "—" },
                  { label: "Location", value: form.location || "—" },
                  { label: "Salary", value: form.salaryRange || "—" },
                ] : []),
                { label: "Model", value: modelLabel },
                { label: "Time", value: `${form.timeLimitMinutes}m` },
                { label: "Attempts", value: form.maxAttempts.toString() },
                { label: "Token Budget", value: form.tokenBudget.toLocaleString() },
                { label: "Scoring", value: `A:${form.scoringWeights.accuracy} E:${form.scoringWeights.efficiency} S:${form.scoringWeights.speed}` },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                  <span className="text-[13px] text-gray-400">{row.label}</span>
                  <span className="text-[13px] text-gray-900 capitalize font-medium">{row.value}</span>
                </div>
              ))}
            </div>

            {form.taskPrompt && (
              <div>
                <div className={`${ds.sectionLabel} mb-2`}>Task Prompt</div>
                <div className="bg-gray-50 rounded-lg p-4 text-[13px] text-gray-700 whitespace-pre-wrap border border-gray-100 leading-relaxed">
                  {form.taskPrompt}
                </div>
              </div>
            )}

            {/* Candidate preview */}
            <div className="border border-dashed border-gray-200 rounded-lg p-5">
              <div className={`${ds.sectionLabel} mb-3`}>Candidate Preview</div>
              {form.coverImage && (
                <div className="rounded-md overflow-hidden mb-3 -mx-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={form.coverImage} alt="" className="w-full h-32 object-cover" />
                </div>
              )}
              <h3 className="text-[16px] font-semibold text-gray-900 mb-1">{form.title || "Untitled Test"}</h3>
              <p className="text-[13px] text-gray-500 mb-3">{form.description || "No description."}</p>
              <div className="flex flex-wrap gap-4 text-[12px] text-gray-400">
                <span>{modelLabel}</span>
                <span>{form.timeLimitMinutes}m</span>
                <span>{form.maxAttempts} attempts</span>
                <span className="capitalize">{form.difficulty}</span>
                <span className={form.visibility === "public" ? "text-emerald-500" : "text-gray-400"}>
                  {form.visibility === "public" ? "🌐 Public" : "🔒 Private"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
          <button onClick={() => setStep(Math.max(0, step - 1))}
            className={step === 0 ? "invisible" : ds.btnSecondary}>Back</button>
          <div className="flex gap-2.5">
            {step < steps.length - 1 ? (
              <button onClick={goNext} className={ds.btnPrimary}>Continue</button>
            ) : (
              <>
                <button onClick={() => handleSubmit("draft")} disabled={loading}
                  className={`${ds.btnSecondary} disabled:opacity-50`}>
                  {loading ? "Saving…" : "Save Draft"}
                </button>
                <button onClick={() => handleSubmit("active")} disabled={loading}
                  className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-md px-4 py-2 text-[13px] font-medium transition-all duration-200">
                  {loading ? "Publishing…" : "Publish Test"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
