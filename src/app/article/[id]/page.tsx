"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CATEGORY_ACCENT } from "@/components/CategoryTag";
import type { Category } from "@/types/news";

interface ArticleData {
  title: string;
  text: string;
  originalText: string | null;
  summary: string[];
  isTranslated: boolean;
  hasAI: boolean;
  error?: string;
}

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="space-y-2">
        <div className="h-3 bg-white/5 rounded w-24" />
        <div className="h-7 bg-white/5 rounded w-3/4" />
        <div className="h-7 bg-white/5 rounded w-1/2" />
      </div>
      <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5 space-y-3">
        <div className="h-4 bg-white/5 rounded w-32" />
        <div className="h-3 bg-white/5 rounded w-full" />
        <div className="h-3 bg-white/5 rounded w-5/6" />
        <div className="h-3 bg-white/5 rounded w-4/6" />
      </div>
      {[...Array(6)].map((_, i) => (
        <div key={i} className="space-y-1.5">
          <div className="h-3.5 bg-white/5 rounded w-full" />
          <div className="h-3.5 bg-white/5 rounded w-11/12" />
          <div className="h-3.5 bg-white/5 rounded w-4/5" />
        </div>
      ))}
    </div>
  );
}

function ArticlePage() {
  const params = useSearchParams();
  const articleUrl = params.get("url") ?? "";
  const source = params.get("source") ?? "";
  const category = (params.get("category") ?? "기타") as Category;

  const [data, setData] = useState<ArticleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showOriginal, setShowOriginal] = useState(false);

  const accent = CATEGORY_ACCENT[category] ?? "#6366f1";

  useEffect(() => {
    if (!articleUrl) return;
    setLoading(true);
    fetch(`/api/article?url=${encodeURIComponent(articleUrl)}`)
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => setData({ title: "", text: "", originalText: null, summary: [], isTranslated: false, hasAI: false, error: "불러오기 실패" }))
      .finally(() => setLoading(false));
  }, [articleUrl]);

  return (
    <div className="max-w-2xl mx-auto">
      {/* 상단 네비 */}
      <div className="flex items-center justify-between mb-8">
        <Link href="/" className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          뒤로
        </Link>
        {articleUrl && (
          <a
            href={articleUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors border border-white/10 hover:border-white/20 rounded-lg px-3 py-1.5"
          >
            원문 보기
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>
        )}
      </div>

      {loading ? (
        <LoadingSkeleton />
      ) : data?.error ? (
        <div className="text-center py-20 space-y-3">
          <p className="text-slate-500">{data.error}</p>
          {articleUrl && (
            <a href={articleUrl} target="_blank" rel="noopener noreferrer"
              className="inline-block text-sm text-blue-400 hover:text-blue-300">
              원문에서 직접 읽기 →
            </a>
          )}
        </div>
      ) : data ? (
        <div className="fade-enter space-y-8">
          {/* 소스 + 제목 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded"
                style={{ color: accent, background: `${accent}18` }}>
                {source}
              </span>
              {data.isTranslated && (
                <span className="text-[10px] text-slate-500 flex items-center gap-1">
                  <span>🌐</span> AI 번역
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-white leading-tight">
              {data.title || params.get("title") || "기사"}
            </h1>
          </div>

          {/* AI 요약 */}
          {data.summary.length > 0 && (
            <div
              className="rounded-xl p-5 border space-y-3"
              style={{
                background: `${accent}08`,
                borderColor: `${accent}30`,
                boxShadow: `0 0 24px ${accent}10`,
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: accent }} />
                <span className="text-xs font-semibold tracking-wide uppercase" style={{ color: accent }}>
                  AI 핵심 요약
                </span>
              </div>
              <ul className="space-y-2.5">
                {data.summary.map((point, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-slate-300 leading-relaxed">
                    <span className="flex-shrink-0 mt-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold"
                      style={{ background: `${accent}25`, color: accent }}>
                      {i + 1}
                    </span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!data.hasAI && (
            <div className="text-xs text-slate-600 bg-white/[0.02] border border-white/5 rounded-lg px-4 py-3">
              💡 <code className="font-mono">.env.local</code>에 <code className="font-mono">ANTHROPIC_API_KEY</code>를 추가하면 AI 요약과 번역이 활성화됩니다.
            </div>
          )}

          {/* 구분선 */}
          <div className="h-px" style={{ background: `linear-gradient(90deg, ${accent}30, transparent)` }} />

          {/* 본문 */}
          <article className="space-y-5 text-slate-300 text-[15px] leading-[1.85]">
            {(showOriginal ? data.originalText : data.text)
              ?.split("\n\n")
              .filter(Boolean)
              .map((para, i) => (
                <p key={i}>{para}</p>
              ))}
          </article>

          {/* 원문 토글 (번역된 경우만) */}
          {data.isTranslated && data.originalText && (
            <button
              onClick={() => setShowOriginal((v) => !v)}
              className="text-xs text-slate-600 hover:text-slate-400 transition-colors border border-white/5 hover:border-white/10 rounded-lg px-3 py-1.5"
            >
              {showOriginal ? "번역본 보기" : "원문 (English) 보기"}
            </button>
          )}

          {/* 하단 원문 링크 */}
          <div className="pt-4 border-t border-white/5">
            <a href={articleUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm px-4 py-2.5 rounded-lg transition-colors"
              style={{ background: `${accent}15`, color: accent }}
            >
              원문에서 읽기
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function ArticlePageWrapper() {
  return (
    <Suspense fallback={<div className="max-w-2xl mx-auto animate-pulse space-y-4 pt-4">
      <div className="h-4 bg-white/5 rounded w-1/4" />
      <div className="h-7 bg-white/5 rounded w-3/4" />
      <div className="h-7 bg-white/5 rounded w-1/2" />
    </div>}>
      <ArticlePage />
    </Suspense>
  );
}
