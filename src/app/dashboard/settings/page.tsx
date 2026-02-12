"use client";

import { useState } from "react";
import { ds } from "@/lib/designSystem";

export default function SettingsPage() {
  const [name, setName] = useState("Jane Doe");
  const [email, setEmail] = useState("jane@company.com");
  const [company, setCompany] = useState("Acme Corp");
  const [emailNotif, setEmailNotif] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [candidateAlerts, setCandidateAlerts] = useState(false);

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
    <button onClick={() => onChange(!checked)}
      className={`relative w-9 h-5 rounded-full transition-colors duration-200 ${checked ? "bg-indigo-600" : "bg-gray-200"}`}>
      <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-200 shadow-sm ${checked ? "translate-x-4" : ""}`} />
    </button>
  );

  return (
    <div className={`${ds.page} max-w-[640px]`}>
      <div className="mb-10">
        <h1 className={ds.pageTitle}>Settings</h1>
        <p className={ds.pageSubtitle}>Manage your account and preferences</p>
      </div>

      {/* Profile */}
      <section className={ds.flatSection}>
        <h2 className={`${ds.sectionLabel} mb-4`}>Profile</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={ds.inputLabel}>Full Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={ds.input} />
            </div>
            <div>
              <label className={ds.inputLabel}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={ds.input} />
            </div>
            <div>
              <label className={ds.inputLabel}>Company</label>
              <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} className={ds.input} />
            </div>
            <div>
              <label className={ds.inputLabel}>Role</label>
              <select className={`${ds.input} bg-white`}>
                <option>Employer</option>
                <option>Educator</option>
                <option>Individual</option>
              </select>
            </div>
          </div>
          <button className={ds.btnPrimary}>Save Changes</button>
        </div>
      </section>

      {/* Notifications */}
      <section className={ds.flatSection}>
        <h2 className={`${ds.sectionLabel} mb-4`}>Notifications</h2>
        <div className="space-y-4">
          {[
            { label: "Email notifications", desc: "Receive updates about test activity", checked: emailNotif, onChange: setEmailNotif },
            { label: "Weekly digest", desc: "Activity summary every Monday", checked: weeklyDigest, onChange: setWeeklyDigest },
            { label: "Candidate alerts", desc: "Notified when a candidate finishes a test", checked: candidateAlerts, onChange: setCandidateAlerts },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <div>
                <div className="text-[13px] text-gray-900">{item.label}</div>
                <div className="text-[11px] text-gray-400 mt-0.5">{item.desc}</div>
              </div>
              <Toggle checked={item.checked} onChange={item.onChange} />
            </div>
          ))}
        </div>
      </section>

      {/* API Keys */}
      <section className={ds.flatSection}>
        <h2 className={`${ds.sectionLabel} mb-1`}>API Keys</h2>
        <p className="text-[12px] text-gray-400 mb-4">Programmatic access to your account</p>
        <div className="flex items-center justify-between py-3 border-b border-gray-50">
          <div>
            <div className="text-[13px] font-mono text-gray-900">sk-inp-****************************a3f7</div>
            <div className="text-[11px] text-gray-400 mt-0.5">Created Jan 15, 2026</div>
          </div>
          <button className="text-[12px] text-red-500 hover:text-red-600 font-medium transition-colors">Revoke</button>
        </div>
        <button className="text-[12px] text-indigo-600 hover:text-indigo-700 font-medium mt-3 transition-colors">Generate new key</button>
      </section>

      {/* Billing */}
      <section className="pb-6">
        <h2 className={`${ds.sectionLabel} mb-1`}>Billing</h2>
        <p className="text-[12px] text-gray-400 mb-4">Manage your subscription</p>
        <div className="flex items-center justify-between py-3 border-b border-gray-50">
          <div>
            <div className="text-[13px] font-medium text-gray-900">Business Plan</div>
            <div className="text-[11px] text-gray-400 mt-0.5">$249/month · Next billing: Mar 1, 2026</div>
          </div>
          <span className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-medium">
            <span className={ds.statusDot.active} />
            Active
          </span>
        </div>
        <div className="flex gap-3 mt-3 text-[12px]">
          <button className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors">Manage subscription</button>
          <span className="text-gray-200">|</span>
          <button className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors">View invoices</button>
        </div>
      </section>
    </div>
  );
}
