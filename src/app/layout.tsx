import type { Metadata } from "next";
import Providers from "@/components/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "InpromptiFy — Know who can actually prompt",
  description: "The assessment platform for AI prompting skills. Stop guessing. Start measuring. Create real-world tests, score candidates, hire the ones who can actually use AI.",
  icons: { icon: '/logo-icon.jpg', apple: '/logo-icon.jpg' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
