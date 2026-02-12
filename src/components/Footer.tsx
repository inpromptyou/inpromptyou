import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2">
              <Image src="/logo-icon.jpg" alt="InpromptiFy" width={24} height={24} className="rounded" />
              <span className="font-bold text-lg text-gray-900">InpromptiFy</span>
            </div>
            <p className="text-sm text-gray-500 mt-3 leading-relaxed max-w-xs">
              The assessment platform for AI prompting skills. Measure what actually matters.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Product</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/how-it-works" className="hover:text-gray-900 transition-colors">How It Works</Link></li>
              <li><Link href="/pricing" className="hover:text-gray-900 transition-colors">Pricing</Link></li>
              <li><Link href="/leaderboard" className="hover:text-gray-900 transition-colors">Leaderboard</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Company</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><span className="cursor-default">About</span></li>
              <li><span className="cursor-default">Blog</span></li>
              <li><span className="cursor-default">Contact</span></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/privacy" className="hover:text-gray-900 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-gray-900 transition-colors">Terms of Service</Link></li>
              <li><Link href="/security" className="hover:text-gray-900 transition-colors">Security</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-200 mt-10 pt-6 flex items-center justify-between">
          <p className="text-sm text-gray-400">&copy; 2026 InpromptiFy. All rights reserved.</p>
          <a
            href="https://x.com/InpromptiFyai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-gray-900 transition-colors"
            aria-label="Follow us on X"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
}
