"use client";

import { useState, useEffect } from "react";

interface ApiKey {
  id: number;
  key_prefix: string;
  name: string;
  plan: string;
  rate_limit: number;
  requests_today: number;
  is_active: boolean;
  created_at: string;
}

export default function ApiPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKeyName, setNewKeyName] = useState("Default");
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/keys")
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setKeys(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const generateKey = async () => {
    setGenerating(true);
    setError("");
    setGeneratedKey(null);
    try {
      const res = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newKeyName }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to generate key");
        return;
      }
      setGeneratedKey(data.key);
      setKeys(prev => [data.apiKey, ...prev]);
      setNewKeyName("Default");
    } catch {
      setError("Failed to generate key");
    } finally {
      setGenerating(false);
    }
  };

  const revokeKey = async (id: number) => {
    try {
      await fetch(`/api/keys/${id}`, { method: "DELETE" });
      setKeys(prev => prev.filter(k => k.id !== id));
    } catch { /* ignore */ }
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-gray-900">API Access</h1>
        <p className="text-gray-500 text-sm mt-1">Manage API keys and integrate InpromptiFy programmatically</p>
      </div>

      {/* Generate Key */}
      <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">Generate API Key</h2>
        <p className="text-xs text-gray-400 mb-4">API access requires a Pro plan or above.</p>
        {error && <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2 mb-3">{error}</div>}
        <div className="flex gap-3">
          <input type="text" value={newKeyName} onChange={e => setNewKeyName(e.target.value)} className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent" placeholder="Key name" />
          <button onClick={generateKey} disabled={generating} className="bg-[#6366F1] hover:bg-[#4F46E5] disabled:opacity-60 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
            {generating ? "Generating..." : "Generate Key"}
          </button>
        </div>
        {generatedKey && (
          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-md p-3">
            <p className="text-xs text-amber-700 font-medium mb-1">⚠️ Copy this key now — it won&apos;t be shown again</p>
            <code className="text-sm font-mono text-gray-900 break-all">{generatedKey}</code>
          </div>
        )}
      </div>

      {/* Existing Keys */}
      <div className="bg-white rounded-lg border border-gray-200 mb-8">
        <div className="px-5 py-3.5 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-900">Your API Keys</h2>
        </div>
        {loading ? (
          <div className="px-5 py-8 text-center text-gray-400 text-sm">Loading...</div>
        ) : keys.length === 0 ? (
          <div className="px-5 py-8 text-center text-gray-400 text-sm">No API keys generated yet</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {keys.map(k => (
              <div key={k.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-mono text-gray-900">{k.key_prefix}****</div>
                  <div className="text-xs text-gray-400 mt-0.5">{k.name} • {k.requests_today} requests today • Limit: {k.rate_limit}/day</div>
                </div>
                <button onClick={() => revokeKey(k.id)} className="text-xs text-red-500 hover:text-red-600 font-medium">Revoke</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* API Documentation */}
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">API Documentation</h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Authentication</h3>
            <p className="text-sm text-gray-600 mb-2">Include your API key in the Authorization header:</p>
            <pre className="bg-gray-50 rounded-md p-3 text-xs text-gray-700 overflow-x-auto">Authorization: Bearer sk-inp-your-key-here</pre>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Endpoints</h3>
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-md p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">POST</span>
                  <code className="text-sm text-gray-900">/api/v1/tests/create</code>
                </div>
                <p className="text-xs text-gray-500 mb-2">Create a test programmatically</p>
                <pre className="text-xs text-gray-600 overflow-x-auto">{`curl -X POST https://inpromptify.ai/api/v1/tests/create \\
  -H "Authorization: Bearer sk-inp-..." \\
  -H "Content-Type: application/json" \\
  -d '{"title":"Email Test","taskPrompt":"Write a marketing email","maxAttempts":5}'`}</pre>
              </div>
              <div className="bg-gray-50 rounded-md p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">GET</span>
                  <code className="text-sm text-gray-900">/api/v1/tests/:id/results</code>
                </div>
                <p className="text-xs text-gray-500 mb-2">Get test results for a specific test</p>
                <pre className="text-xs text-gray-600 overflow-x-auto">{`curl https://inpromptify.ai/api/v1/tests/123/results \\
  -H "Authorization: Bearer sk-inp-..."`}</pre>
              </div>
              <div className="bg-gray-50 rounded-md p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">POST</span>
                  <code className="text-sm text-gray-900">/api/v1/tests/:id/invite</code>
                </div>
                <p className="text-xs text-gray-500 mb-2">Send a test invitation email</p>
                <pre className="text-xs text-gray-600 overflow-x-auto">{`curl -X POST https://inpromptify.ai/api/v1/tests/123/invite \\
  -H "Authorization: Bearer sk-inp-..." \\
  -H "Content-Type: application/json" \\
  -d '{"email":"candidate@example.com","name":"Jane"}'`}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
