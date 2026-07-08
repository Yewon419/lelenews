import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import MobileAccess from "@/components/MobileAccess";
import DigestButton from "@/components/DigestButton";

export const metadata: Metadata = {
  title: "LeLeNews — 오늘의 IT",
  description: "GeekNews, Hacker News, 44BITS, CIO Korea, ZDNet Korea 통합 뉴스",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-[#0a0e17]">
        <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0a0e17]/90 backdrop-blur-md">
          <div className="max-w-6xl mx-auto px-5 h-12 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center">
                <span className="text-white text-xs font-bold">L</span>
              </div>
              <span className="text-white font-semibold text-sm tracking-wide">LeLeNews</span>
            </Link>
            <nav className="flex items-center gap-3">
              <Link href="/" className="text-xs text-slate-400 hover:text-white transition-colors">
                피드
              </Link>
              <Link href="/bookmarks" className="text-xs text-slate-400 hover:text-white transition-colors">
                북마크
              </Link>
              <DigestButton />
              <MobileAccess />
            </nav>
          </div>
        </header>
        <main className="max-w-6xl mx-auto px-5 py-8">{children}</main>
      </body>
    </html>
  );
}
