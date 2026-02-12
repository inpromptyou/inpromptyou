"use client";

import { useEffect, useState, useRef } from "react";

function useInView(ref: React.RefObject<HTMLDivElement | null>) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold: 0.4 }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [ref]);
  return inView;
}

export default function ScorePreview() {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (!visible) return;
    const target = 87;
    let current = 0;
    const step = () => {
      current += 1;
      if (current > target) return;
      setScore(current);
      requestAnimationFrame(step);
    };
    const id = setTimeout(step, 200);
    return () => clearTimeout(id);
  }, [visible]);

  const breakdowns = [
    { label: "Output Quality", value: 92, color: "bg-indigo-500" },
    { label: "Efficiency", value: 84, color: "bg-violet-500" },
    { label: "Iteration Strategy", value: 88, color: "bg-indigo-400" },
    { label: "Token Economy", value: 79, color: "bg-violet-400" },
  ];

  return (
    <div ref={ref} className="rounded-xl border border-white/[0.06] bg-[#0C1120] p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[11px] text-gray-600 font-mono uppercase tracking-wider mb-1">PromptScore</p>
          <p className="text-[11px] text-gray-600">Sarah Chen · Marketing Email Task</p>
        </div>
        <div className="text-right">
          <span className="text-4xl font-bold text-white tabular-nums">{score}</span>
          <span className="text-lg text-gray-600">/100</span>
        </div>
      </div>

      <div className="space-y-3">
        {breakdowns.map((b) => (
          <div key={b.label}>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-gray-500">{b.label}</span>
              <span className="text-gray-400 font-mono">{b.value}</span>
            </div>
            <div className="h-1 bg-white/[0.04] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${b.color} transition-all duration-1000 ease-out`}
                style={{ width: visible ? `${b.value}%` : "0%" }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 pt-4 border-t border-white/[0.04] flex items-center justify-between text-[11px]">
        <span className="text-gray-600 font-mono">3 attempts · 847 tokens · 6:12</span>
        <span className="text-emerald-500 font-medium">Top 15%</span>
      </div>
    </div>
  );
}
