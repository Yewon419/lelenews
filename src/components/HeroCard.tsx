"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CategoryTag, { CATEGORY_ACCENT } from "./CategoryTag";
import BookmarkButton from "./BookmarkButton";
import { markAsRead, isRead } from "@/lib/storage";
import type { NewsItem } from "@/types/news";

function timeAgo(isoDate: string): string {
  const diff = (Date.now() - new Date(isoDate).getTime()) / 1000;
  if (diff < 60) return "방금 전";
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  return `${Math.floor(diff / 86400)}일 전`;
}

const SOURCE_ICON: Record<string, string> = {
  "GeekNews": "GN", "Hacker News": "HN",
  "44BITS": "44", "CIO Korea": "CI", "ZDNet Korea": "ZD",
};

interface Props { item: NewsItem; rank: number; index: number; }

export default function HeroCard({ item, rank, index }: Props) {
  const [read, setRead] = useState(false);
  const [imgError, setImgError] = useState(false);
  const router = useRouter();
  const accent = CATEGORY_ACCENT[item.category];
  const isHot = (Date.now() - new Date(item.publishedAt).getTime()) < 2 * 60 * 60 * 1000;
  const showImage = !!item.imageUrl && !imgError;

  useEffect(() => { setRead(isRead(item.id)); }, [item.id]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    markAsRead(item.id);
    setRead(true);
    const params = new URLSearchParams({
      url: item.link,
      source: item.source,
      category: item.category,
      title: item.title,
    });
    router.push(`/article/${item.id}?${params}`);
  };

  return (
    <div
      onClick={handleClick}
      className={`card-enter group relative flex flex-col rounded-xl overflow-hidden border cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] ${read ? "opacity-35" : ""}`}
      style={{
        animationDelay: `${index * 80}ms`,
        borderColor: read ? "#1e293b" : `${accent}33`,
        background: `linear-gradient(160deg, ${accent}0a 0%, #0f1623 60%)`,
        boxShadow: read ? "none" : `0 0 0 1px ${accent}22, 0 12px 40px ${accent}12`,
      }}
    >
      {showImage ? (
        <div className="relative w-full h-40 overflow-hidden bg-[#0a0e17]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.imageUrl} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" onError={() => setImgError(true)} />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f1623] via-transparent to-transparent" />
          <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${accent}ee, ${accent}22, transparent)` }} />
        </div>
      ) : (
        <div className="h-[2px] w-full" style={{ background: `linear-gradient(90deg, ${accent}ee, ${accent}22, transparent)` }} />
      )}

      <div className="p-5 flex flex-col gap-3 flex-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold font-mono leading-none select-none" style={{ color: `${accent}35` }}>
              {String(rank).padStart(2, "0")}
            </span>
            <CategoryTag category={item.category} size="xs" />
            {isHot && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-orange-400">
                <span className="hot-pulse inline-block w-1.5 h-1.5 rounded-full bg-orange-400" />HOT
              </span>
            )}
          </div>
          <BookmarkButton id={item.id} />
        </div>
        <h2 className="text-[15px] font-semibold text-slate-100 leading-snug line-clamp-3 group-hover:text-white transition-colors">
          {item.title}
        </h2>
        {!showImage && item.summary && (
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{item.summary}</p>
        )}
      </div>

      <div className="px-5 pb-4 flex items-center gap-2">
        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded" style={{ color: accent, background: `${accent}18` }}>
          {SOURCE_ICON[item.source] ?? item.source.slice(0, 2).toUpperCase()}
        </span>
        <span className="text-[11px] text-slate-400">{item.source}</span>
        <span className="text-slate-700 text-[11px]">·</span>
        <span className="text-[11px] text-slate-500">{timeAgo(item.publishedAt)}</span>
      </div>
    </div>
  );
}
