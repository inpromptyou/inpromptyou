"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function Nav({ transparent = false }: { transparent?: boolean }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isDark = transparent;

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? isDark
            ? "bg-[#0A0F1C]/95 backdrop-blur-xl shadow-lg shadow-black/20"
            : "bg-white/95 backdrop-blur-xl shadow-sm"
          : isDark
            ? "bg-transparent"
            : "bg-white/80 backdrop-blur-md"
      }`}
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14 items-center">
          {/* Logo — monospace wordmark with bracket motif */}
          <Link href="/" className="flex items-center gap-0 group">
            <span className={`font-mono text-lg tracking-tight select-none ${isDark ? "text-white" : "text-gray-900"}`}>
              <span className="text-indigo-500 font-normal opacity-60 group-hover:opacity-100 transition-opacity">[</span>
              <span className="font-semibold">Inprompti</span>
              <span className="font-semibold text-indigo-400">F</span>
              <span className="font-semibold">y</span>
              <span className="text-indigo-500 font-normal opacity-60 group-hover:opacity-100 transition-opacity">]</span>
            </span>
          </Link>

          {/* Center nav links — subtle, no pills */}
          <div className="hidden md:flex items-center gap-1">
            {[
              { label: "How It Works", href: "/how-it-works" },
              { label: "Jobs", href: "/jobs" },
              { label: "Pricing", href: "/pricing" },
              { label: "Leaderboard", href: "/leaderboard" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-[13px] px-3 py-1.5 rounded transition-colors ${
                  isDark
                    ? "text-gray-500 hover:text-gray-200"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side — login + CTA */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              href="/login"
              className={`text-[13px] px-3 py-1.5 rounded transition-colors ${
                isDark ? "text-gray-500 hover:text-gray-200" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Log in
            </Link>
            <span className={`mx-1 h-4 w-px ${isDark ? "bg-white/10" : "bg-gray-200"}`} />
            <Link
              href="/signup"
              className={`text-[13px] font-medium px-4 py-1.5 rounded-md transition-all ${
                isDark
                  ? "text-white bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.08] hover:border-white/[0.16]"
                  : "text-gray-900 bg-gray-100 hover:bg-gray-200"
              }`}
            >
              Get Started →
            </Link>
          </div>

          {/* Mobile toggle — minimal line icon */}
          <button
            className={`md:hidden p-1.5 rounded ${isDark ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"}`}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <div className="w-5 flex flex-col gap-[5px]">
              <span
                className={`block h-[1.5px] rounded-full transition-all duration-200 ${isDark ? "bg-current" : "bg-current"} ${
                  mobileOpen ? "rotate-45 translate-y-[3.25px]" : ""
                }`}
              />
              <span
                className={`block h-[1.5px] rounded-full transition-all duration-200 ${isDark ? "bg-current" : "bg-current"} ${
                  mobileOpen ? "-rotate-45 -translate-y-[3.25px]" : ""
                }`}
              />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile dropdown — clean, no overlay */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-200 ${
          mobileOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className={`px-5 pb-4 pt-2 space-y-1 ${isDark ? "border-t border-white/[0.04]" : "border-t border-gray-100"}`}>
          {[
            { label: "How It Works", href: "/how-it-works" },
            { label: "Jobs", href: "/jobs" },
            { label: "Pricing", href: "/pricing" },
            { label: "Leaderboard", href: "/leaderboard" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`block text-sm py-2 ${isDark ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"}`}
            >
              {link.label}
            </Link>
          ))}
          <div className={`h-px my-2 ${isDark ? "bg-white/[0.04]" : "bg-gray-100"}`} />
          <Link href="/login" onClick={() => setMobileOpen(false)} className={`block text-sm py-2 ${isDark ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"}`}>
            Log in
          </Link>
          <Link
            href="/signup"
            onClick={() => setMobileOpen(false)}
            className={`block text-sm py-2 font-medium ${isDark ? "text-indigo-400" : "text-indigo-600"}`}
          >
            Get Started →
          </Link>
        </div>
      </div>
    </nav>
  );
}
