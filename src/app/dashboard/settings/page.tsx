"use client";

import { useState } from "react";

export default function SettingsPage() {
  const [name, setName] = useState("Jane Doe");
  const [email, setEmail] = useState("jane@company.com");
  const [company, setCompany] = useState("Acme Corp");
  const [emailNotif, setEmailNotif] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [candidateAlerts, setCandidateAlerts] = useState(false);

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-9 h-5 rounded-full transition-colors ${checked ? "bg-[#6366F1]" : "bg-gray-300"}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${checked ? "translate-x-4" : ""}`} />
    </button>
  );

  return (
    <div className="p-6 lg:p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your account and preferences</p>
      </div>

      {/* Profile */}
      <div className="bg-white rounded-lg border border-gray-200 p-5 mb-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Profile</h2>
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Company</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Role</label>
              <select className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent bg-white">
                <option>Employer</option>
                <option>Educator</option>
                <option>Individual</option>
              </select>
            </div>
          </div>
          <button className="bg-[#6366F1] hover:bg-[#4F46E5] text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
            Save Changes
          </button>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-lg border border-gray-200 p-5 mb-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Notifications</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-900">Email notifications</div>
              <div className="text-xs text-gray-400">Receive updates about test activity</div>
            </div>
            <Toggle checked={emailNotif} onChange={setEmailNotif} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-900">Weekly digest</div>
              <div className="text-xs text-gray-400">Activity summary every Monday</div>
            </div>
            <Toggle checked={weeklyDigest} onChange={setWeeklyDigest} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-900">Candidate alerts</div>
              <div className="text-xs text-gray-400">Notified when a candidate finishes a test</div>
            </div>
            <Toggle checked={candidateAlerts} onChange={setCandidateAlerts} />
          </div>
        </div>
      </div>

      {/* API Keys */}
      <div className="bg-white rounded-lg border border-gray-200 p-5 mb-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-1">API Keys</h2>
        <p className="text-xs text-gray-400 mb-4">Manage API keys for programmatic access</p>
        <div className="bg-gray-50 rounded-md p-3 mb-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-mono text-gray-900">sk-inp-****************************a3f7</div>
              <div className="text-xs text-gray-400 mt-0.5">Created Jan 15, 2026</div>
            </div>
            <button className="text-xs text-red-500 hover:text-red-600 font-medium">Revoke</button>
          </div>
        </div>
        <button className="text-xs text-[#6366F1] hover:text-[#4F46E5] font-medium">Generate new key</button>
      </div>

      {/* Billing */}
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-1">Billing</h2>
        <p className="text-xs text-gray-400 mb-4">Manage your subscription</p>
        <div className="flex items-center justify-between bg-gray-50 rounded-md p-3 mb-3">
          <div>
            <div className="text-sm font-medium text-gray-900">Business Plan</div>
            <div className="text-xs text-gray-400">$249/month &middot; Next billing: Mar 1, 2026</div>
          </div>
          <span className="text-[11px] font-medium text-emerald-600">Active</span>
        </div>
        <div className="flex gap-3 text-xs">
          <button className="text-[#6366F1] hover:text-[#4F46E5] font-medium">Manage subscription</button>
          <span className="text-gray-300">|</span>
          <button className="text-[#6366F1] hover:text-[#4F46E5] font-medium">View invoices</button>
        </div>
      </div>
    </div>
  );
}
