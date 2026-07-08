"use client";

import { useState, useEffect, useCallback } from "react";
import HeroCard from "./HeroCard";
import NewsCard from "./NewsCard";
import SourceFilter from "./SourceFilter";
import ReadProgress from "./ReadProgress";
import { getLastVisit, updateLastVisit } from "@/lib/storage";
import type { NewsItem, Source } from "@/types/news";

function todayLabel(): string {
  const now = new Date();
  const days = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
  return `${now.getMonth() + 1}월 ${now.getDate()}일 ${days[now.getDay()]}`;
}

function SkeletonHero() {
  return (
    <div className="bg-[#0f1623] border border-white/5 rounded-xl overflow-hidden animate-pulse">
      <div className="h-[2px] bg-white/5" />
      <div className="p-5 space-y-3">
        <div className="flex gap-2 items-center">
          <div className="h-6 w-7 bg-white/5 rounded" />
          <div className="h-5 w-14 bg-white/5 rounded-full" />
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-white/5 rounded w-full" />
          <div className="h-4 bg-white/5 rounded w-4/5" />
          <div className="h-4 bg-white/5 rounded w-3/5" />
        </div>
      </div>
      <div className="px-5 pb-4"><div className="h-3 bg-white/5 rounded w-1/3" /></div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-[#0f1623] border border-white/5 rounded-xl overflow-hidden animate-pulse">
      <div className="h-[2px] bg-white/5" />
      <div className="p-4 space-y-2.5">
        <div className="h-4 bg-white/5 rounded-full w-14" />
        <div className="space-y-1.5">
          <div className="h-3.5 bg-white/5 rounded w-full" />
          <div className="h-3.5 bg-white/5 rounded w-4/5" />
        </div>
        <div className="h-3 bg-white/5 rounded w-1/3" />
      </div>
    </div>
  );
}

export default function NewsList() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);
  const [sourceFilter, setSourceFilter] = useState<Source | "전체">("전체");
  const [newCount, setNewCount] = useState(0);
  const [showNewBanner, setShowNewBanner] = useState(false);

  const fetchNews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/news");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setItems(data.items);
      setFetchedAt(data.fetchedAt);

      // 지난 방문 이후 새 기사 카운트
      const lastVisit = getLastVisit();
      if (lastVisit) {
        const count = (data.items as NewsItem[]).filter(
          (i) => new Date(i.publishedAt).getTime() > new Date(lastVisit).getTime()
        ).length;
        if (count > 0) { setNewCount(count); setShowNewBanner(true); }
      }
      updateLastVisit();
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchNews(); }, [fetchNews]);

  useEffect(() => {
    const onFocus = () => {
      if (fetchedAt && (Date.now() - new Date(fetchedAt).getTime()) / 1000 > 300) {
        fetchNews();
      }
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [fetchedAt, fetchNews]);

  const filtered = sourceFilter === "전체" ? items : items.filter((i) => i.source === sourceFilter);
  const heroItems = filtered.slice(0, 3);
  const gridItems = filtered.slice(3, 24);

  const counts: Record<string, number> = {};
  items.forEach((i) => { counts[i.source] = (counts[i.source] || 0) + 1; });

  const lastUpdate = fetchedAt
    ? new Date(fetchedAt).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <div className="space-y-7">
      {/* 날짜 헤더 */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[11px] text-slate-600 font-mono mb-1 tracking-widest uppercase">Today</p>
          <h1 className="text-2xl font-bold text-white tracking-tight">{todayLabel()}</h1>
        </div>
        <div className="flex items-center gap-2">
          {lastUpdate && (
            <span className="text-xs text-slate-700 hidden sm:block font-mono">{lastUpdate}</span>
          )}
          <button
            onClick={fetchNews}
            disabled={loading}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-300 transition-all bg-white/[0.04] hover:bg-white/[0.08] disabled:opacity-30 border border-white/5"
            title="새로고침"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="none" viewBox="0 0 24 24"
              stroke="currentColor" strokeWidth="2.5" className={loading ? "animate-spin" : ""}>
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
          </button>
        </div>
      </div>

      {/* 새 기사 배너 */}
      {showNewBanner && !loading && (
        <div className="fade-enter flex items-center justify-between bg-violet-950/40 border border-violet-500/20 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2.5">
            <span className="hot-pulse inline-block w-2 h-2 rounded-full bg-violet-400" />
            <span className="text-sm text-violet-300 font-medium">
              지난 방문 이후 <span className="text-white font-bold">{newCount}개</span>의 새 기사가 있어요
            </span>
          </div>
          <button
            onClick={() => setShowNewBanner(false)}
            className="text-violet-500 hover:text-violet-300 text-lg leading-none transition-colors"
          >×</button>
        </div>
      )}

      {/* 소스 필터 */}
      <SourceFilter selected={sourceFilter} onChange={setSourceFilter} counts={counts} />

      {/* 에러 */}
      {error && (
        <div className="text-red-400 text-sm bg-red-950/40 border border-red-800/30 rounded-lg p-3">{error}</div>
      )}

      {/* 히어로 섹션 */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => <SkeletonHero key={i} />)}
        </div>
      ) : heroItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {heroItems.map((item, i) => (
            <HeroCard key={item.id} item={item} rank={i + 1} index={i} />
          ))}
        </div>
      ) : null}

      {/* 읽음 진행 */}
      {!loading && filtered.length > 0 && (
        <ReadProgress items={filtered.slice(0, 24)} />
      )}

      {/* 구분선 */}
      {!loading && gridItems.length > 0 && (
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-white/[0.04]" />
          <span className="text-[10px] text-slate-700 font-mono tracking-widest uppercase">More · {gridItems.length}</span>
          <div className="flex-1 h-px bg-white/[0.04]" />
        </div>
      )}

      {/* 카드 그리드 */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : gridItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {gridItems.map((item, i) => (
            <NewsCard key={item.id} item={item} index={i} />
          ))}
        </div>
      ) : !loading && filtered.length === 0 ? (
        <p className="text-slate-700 text-sm text-center py-16">뉴스를 불러올 수 없습니다.</p>
      ) : null}
    </div>
  );
}
