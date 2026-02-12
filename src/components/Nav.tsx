"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export default function Nav({ transparent = false }: { transparent?: boolean }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className={`sticky top-0 z-50 backdrop-blur-sm ${
      transparent
        ? "bg-[#0C2A3A]/40 border-b border-white/10"
        : "bg-white/90 border-b border-gray-200/80"
    }`}>
      <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo-icon.jpg" alt="InpromptiFy" width={28} height={28} className="rounded" />
            <span className={`font-bold text-xl tracking-tight ${transparent ? "text-white" : "text-gray-900"}`}>InpromptiFy</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="/how-it-works" className={`text-sm transition-colors ${transparent ? "text-gray-300 hover:text-white" : "text-gray-500 hover:text-gray-900"}`}>How It Works</Link>
            <Link href="/pricing" className={`text-sm transition-colors ${transparent ? "text-gray-300 hover:text-white" : "text-gray-500 hover:text-gray-900"}`}>Pricing</Link>
            <Link href="/leaderboard" className={`text-sm transition-colors ${transparent ? "text-gray-300 hover:text-white" : "text-gray-500 hover:text-gray-900"}`}>Leaderboard</Link>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/login" className={`text-sm px-4 py-2 transition-colors ${transparent ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-gray-900"}`}>Log in</Link>
            <Link href="/signup" className={`text-sm text-white px-4 py-2 rounded-md transition-colors font-medium ${transparent ? "bg-white/15 hover:bg-white/25 border border-white/20" : "bg-[#1B5B7D] hover:bg-[#14455E]"}`}>Get Started</Link>
          </div>

          <button className={`md:hidden p-2 ${transparent ? "text-white" : "text-gray-900"}`} onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {mobileOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className={`md:hidden border-t px-5 py-4 space-y-3 ${transparent ? "border-white/10 bg-[#0C2A3A]/90" : "border-gray-200 bg-white"}`}>
          <Link href="/how-it-works" className={`block text-sm ${transparent ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-gray-900"}`}>How It Works</Link>
          <Link href="/pricing" className={`block text-sm ${transparent ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-gray-900"}`}>Pricing</Link>
          <Link href="/leaderboard" className={`block text-sm ${transparent ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-gray-900"}`}>Leaderboard</Link>
          <hr className={transparent ? "border-white/10" : "border-gray-200"} />
          <Link href="/login" className={`block text-sm ${transparent ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-gray-900"}`}>Log in</Link>
          <Link href="/signup" className="block text-sm text-white bg-[#1B5B7D] hover:bg-[#14455E] px-4 py-2 rounded-md text-center font-medium">Get Started</Link>
        </div>
      )}
    </nav>
  );
}
