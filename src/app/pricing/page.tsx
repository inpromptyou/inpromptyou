"use client";

import { useState } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Link from "next/link";

const plans = [
  {
    name: "Free",
    monthlyPrice: 0,
    description: "Try it out",
    features: [
      "3 tests per month",
      "Basic scoring metrics",
      "GPT-4o only",
      "Public candidate profile",
    ],
    cta: "Get Started",
    highlight: false,
  },
  {
    name: "Pro",
    monthlyPrice: 79,
    description: "For recruiters and small teams",
    features: [
      "100 tests per month",
      "All AI models",
      "Analytics dashboard",
      "Custom branding",
      "CSV export",
      "Email support",
    ],
    cta: "Start Free Trial",
    highlight: false,
  },
  {
    name: "Business",
    monthlyPrice: 249,
    description: "For teams with volume hiring",
    features: [
      "Unlimited tests",
      "Up to 10 seats",
      "ATS integrations",
      "Custom scoring rubrics",
      "API access",
      "Priority support",
    ],
    cta: "Start Free Trial",
    highlight: true,
  },
  {
    name: "Enterprise",
    monthlyPrice: 799,
    description: "For organizations with specific needs",
    features: [
      "Everything in Business",
      "Unlimited seats",
      "SSO / SAML",
      "White-label option",
      "Unlimited API access",
      "Dedicated account manager",
    ],
    cta: "Contact Sales",
    highlight: false,
  },
];

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);

  const getPrice = (monthlyPrice: number) => {
    if (monthlyPrice === 0) return "$0";
    if (annual) return `$${Math.round(monthlyPrice * 0.8)}`;
    return `$${monthlyPrice}`;
  };

  return (
    <>
      <Nav />
      <main>
        <div className="max-w-5xl mx-auto px-5 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="max-w-2xl mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Pricing</h1>
            <p className="text-gray-600">
              Start free. No credit card needed. Scale when your hiring pipeline demands it.
            </p>
          </div>

          {/* Toggle */}
          <div className="flex items-center gap-3 mb-10">
            <span className={`text-sm font-medium ${!annual ? "text-gray-900" : "text-gray-400"}`}>Monthly</span>
            <button
              onClick={() => setAnnual(!annual)}
              className={`relative w-10 h-5 rounded-full transition-colors ${annual ? "bg-[#6366F1]" : "bg-gray-300"}`}
              aria-label="Toggle annual pricing"
            >
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${annual ? "translate-x-5" : ""}`} />
            </button>
            <span className={`text-sm font-medium ${annual ? "text-gray-900" : "text-gray-400"}`}>
              Annual
              <span className="ml-1.5 text-xs text-[#10B981] font-medium">Save 20%</span>
            </span>
          </div>

          {/* Plans Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-lg p-6 flex flex-col ${
                  plan.highlight
                    ? "bg-gray-950 text-white ring-1 ring-gray-800"
                    : "bg-white border border-gray-200"
                }`}
              >
                <div className={`text-sm font-semibold mb-1 ${plan.highlight ? "text-gray-400" : "text-gray-500"}`}>{plan.name}</div>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className={`text-3xl font-bold ${plan.highlight ? "text-white" : "text-gray-900"}`}>{getPrice(plan.monthlyPrice)}</span>
                  {plan.monthlyPrice > 0 && <span className={`text-sm ${plan.highlight ? "text-gray-500" : "text-gray-400"}`}>/mo</span>}
                </div>
                <p className={`text-sm mb-5 ${plan.highlight ? "text-gray-400" : "text-gray-500"}`}>{plan.description}</p>

                <ul className="space-y-2.5 mb-6 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className={`flex items-start gap-2 text-sm ${plan.highlight ? "text-gray-300" : "text-gray-600"}`}>
                      <svg className={`w-4 h-4 mt-0.5 shrink-0 ${plan.highlight ? "text-[#10B981]" : "text-gray-400"}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.name === "Enterprise" ? "#" : "/signup"}
                  className={`block text-center py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    plan.highlight
                      ? "bg-[#6366F1] text-white hover:bg-[#4F46E5]"
                      : "bg-gray-900 text-white hover:bg-gray-800"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>

          {/* FAQ */}
          <div className="max-w-2xl mt-20">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Common questions</h2>
            <div className="space-y-5">
              {[
                { q: "What counts as a 'test'?", a: "A single candidate taking a single assessment. If three candidates take the same test, that's three tests toward your monthly limit." },
                { q: "Can I switch plans?", a: "Yes, upgrade or downgrade anytime. Upgrades are prorated. Downgrades take effect at the next billing cycle." },
                { q: "Do you offer education discounts?", a: "50% off Pro and Business for verified educational institutions. Email us with your .edu address." },
                { q: "Which AI models are supported?", a: "Free plans include GPT-4o. Paid plans unlock Claude and Gemini. Enterprise customers can bring their own model endpoints." },
                { q: "Is candidate data secure?", a: "All data encrypted at rest and in transit. SOC 2 Type II compliant. GDPR ready. Enterprise plans offer data residency options." },
              ].map((faq) => (
                <div key={faq.q} className="border-b border-gray-200 pb-5">
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">{faq.q}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
