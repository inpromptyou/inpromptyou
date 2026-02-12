"use client";

import { useState } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

// Enterprise Pricing Formula:
// Base: $499/mo platform fee
// Per-seat: $29/mo per seat (minimum 5 seats)
// Per-test: $0.35 per test (volume discounts at 5K, 10K, 25K)
// Add-ons: SSO ($99/mo), White-label ($199/mo), Custom models ($149/mo), SLA ($249/mo)
// Annual discount: 25% off total
//
// Example: 20 seats, 5,000 tests/mo, SSO + White-label
// Base: $499 + (20 × $29) + (5000 × $0.30*) + $99 + $199 = $499 + $580 + $1,500 + $298 = $2,877/mo
// * $0.30 rate at 5K tier (down from $0.35)

const PRICING = {
  baseFee: 499,
  perSeat: 29,
  minSeats: 5,
  testTiers: [
    { upTo: 2000, perTest: 0.35 },
    { upTo: 5000, perTest: 0.30 },
    { upTo: 10000, perTest: 0.25 },
    { upTo: 25000, perTest: 0.20 },
    { upTo: Infinity, perTest: 0.15 },
  ],
  addOns: {
    sso: { label: "SSO / SAML", price: 99 },
    whiteLabel: { label: "White-label branding", price: 199 },
    customModels: { label: "Custom model endpoints", price: 149 },
    sla: { label: "99.9% SLA guarantee", price: 249 },
    dedicatedSupport: { label: "Dedicated account manager", price: 199 },
  },
  annualDiscount: 0.25,
};

function calculateTestCost(tests: number): number {
  const tier = PRICING.testTiers.find((t) => tests <= t.upTo) || PRICING.testTiers[PRICING.testTiers.length - 1];
  return tests * tier.perTest;
}

function getTestRate(tests: number): number {
  const tier = PRICING.testTiers.find((t) => tests <= t.upTo) || PRICING.testTiers[PRICING.testTiers.length - 1];
  return tier.perTest;
}

type AddOnKey = keyof typeof PRICING.addOns;

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    role: "",
    seats: "10",
    testsPerMonth: "2000",
    message: "",
  });
  const [addOns, setAddOns] = useState<Record<AddOnKey, boolean>>({
    sso: false,
    whiteLabel: false,
    customModels: false,
    sla: false,
    dedicatedSupport: false,
  });
  const [annual, setAnnual] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const seats = Math.max(PRICING.minSeats, parseInt(formData.seats) || PRICING.minSeats);
  const tests = parseInt(formData.testsPerMonth) || 2000;

  const baseCost = PRICING.baseFee;
  const seatCost = seats * PRICING.perSeat;
  const testCost = calculateTestCost(tests);
  const addOnCost = (Object.keys(addOns) as AddOnKey[]).reduce(
    (sum, key) => sum + (addOns[key] ? PRICING.addOns[key].price : 0),
    0
  );
  const monthlyTotal = baseCost + seatCost + testCost + addOnCost;
  const finalMonthly = annual ? monthlyTotal * (1 - PRICING.annualDiscount) : monthlyTotal;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <>
      <Nav />
      <main>
        <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="max-w-2xl mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Enterprise</h1>
            <p className="text-gray-600">
              Custom pricing for organizations that need scale, security, and control. 
              Configure your plan below and we&apos;ll get back within 24 hours.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Left: Form */}
            <div>
              {submitted ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-8 text-center">
                  <div className="text-4xl mb-3">✅</div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Request received</h2>
                  <p className="text-gray-600">We&apos;ll review your configuration and get back to you at <strong>{formData.email}</strong> within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Work email</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                      <input
                        type="text"
                        required
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                      <input
                        type="text"
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        placeholder="e.g. Head of Talent"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Team seats</label>
                      <input
                        type="number"
                        min={PRICING.minSeats}
                        value={formData.seats}
                        onChange={(e) => setFormData({ ...formData, seats: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                      <p className="text-xs text-gray-400 mt-1">Minimum {PRICING.minSeats} seats</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tests per month</label>
                      <select
                        value={formData.testsPerMonth}
                        onChange={(e) => setFormData({ ...formData, testsPerMonth: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="1000">Up to 1,000</option>
                        <option value="2000">Up to 2,000</option>
                        <option value="5000">Up to 5,000</option>
                        <option value="10000">Up to 10,000</option>
                        <option value="25000">Up to 25,000</option>
                        <option value="50000">50,000+</option>
                      </select>
                    </div>
                  </div>

                  {/* Add-ons */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Add-ons</label>
                    <div className="space-y-2">
                      {(Object.keys(PRICING.addOns) as AddOnKey[]).map((key) => (
                        <label key={key} className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={addOns[key]}
                            onChange={() => setAddOns({ ...addOns, [key]: !addOns[key] })}
                            className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="text-sm text-gray-700">{PRICING.addOns[key].label}</span>
                          <span className="text-xs text-gray-400 ml-auto">${PRICING.addOns[key].price}/mo</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Anything else we should know?</label>
                    <textarea
                      rows={3}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Custom requirements, integrations, compliance needs..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gray-900 text-white py-2.5 px-4 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"
                  >
                    Request Enterprise Quote
                  </button>
                </form>
              )}
            </div>

            {/* Right: Live pricing calculator */}
            <div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 sticky top-24">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-sm font-semibold text-gray-900">Estimated pricing</h2>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs ${!annual ? "text-gray-900 font-medium" : "text-gray-400"}`}>Monthly</span>
                    <button
                      onClick={() => setAnnual(!annual)}
                      className={`relative w-8 h-4 rounded-full transition-colors ${annual ? "bg-indigo-600" : "bg-gray-300"}`}
                    >
                      <span className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform shadow-sm ${annual ? "translate-x-4" : ""}`} />
                    </button>
                    <span className={`text-xs ${annual ? "text-gray-900 font-medium" : "text-gray-400"}`}>
                      Annual <span className="text-emerald-600">-25%</span>
                    </span>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Platform base</span>
                    <span className="text-gray-900 font-medium">${baseCost}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">{seats} seats × ${PRICING.perSeat}</span>
                    <span className="text-gray-900 font-medium">${seatCost}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">{tests.toLocaleString()} tests × ${getTestRate(tests).toFixed(2)}</span>
                    <span className="text-gray-900 font-medium">${testCost.toFixed(0)}</span>
                  </div>
                  {(Object.keys(addOns) as AddOnKey[]).filter((k) => addOns[k]).map((key) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-gray-500">{PRICING.addOns[key].label}</span>
                      <span className="text-gray-900 font-medium">${PRICING.addOns[key].price}</span>
                    </div>
                  ))}

                  {annual && (
                    <>
                      <div className="border-t border-gray-200 pt-3 flex justify-between">
                        <span className="text-gray-500">Subtotal</span>
                        <span className="text-gray-400">${monthlyTotal.toFixed(0)}/mo</span>
                      </div>
                      <div className="flex justify-between text-emerald-600">
                        <span>Annual discount (25%)</span>
                        <span>-${(monthlyTotal * PRICING.annualDiscount).toFixed(0)}</span>
                      </div>
                    </>
                  )}

                  <div className="border-t border-gray-900 pt-3 flex justify-between">
                    <span className="text-gray-900 font-semibold">Estimated total</span>
                    <div className="text-right">
                      <span className="text-xl font-bold text-gray-900">${finalMonthly.toFixed(0)}</span>
                      <span className="text-gray-500 text-xs">/mo</span>
                      {annual && (
                        <div className="text-xs text-gray-400">${(finalMonthly * 12).toLocaleString()}/yr billed annually</div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-gray-200">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Volume discounts</h3>
                  <div className="space-y-1">
                    {PRICING.testTiers.slice(0, -1).map((tier, i) => (
                      <div key={i} className={`flex justify-between text-xs ${tests <= tier.upTo && (i === 0 || tests > (PRICING.testTiers[i - 1]?.upTo || 0)) ? "text-indigo-600 font-medium" : "text-gray-400"}`}>
                        <span>Up to {tier.upTo.toLocaleString()} tests</span>
                        <span>${tier.perTest.toFixed(2)}/test</span>
                      </div>
                    ))}
                    <div className={`flex justify-between text-xs ${tests > 25000 ? "text-indigo-600 font-medium" : "text-gray-400"}`}>
                      <span>25,000+ tests</span>
                      <span>$0.15/test</span>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-gray-400 mt-4">
                  Final pricing may vary based on custom requirements. This estimate is for reference only.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
