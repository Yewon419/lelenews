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

interface Props { item: NewsItem; index?: number; }

export default function NewsCard({ item, index = 0 }: Props) {
  const [read, setRead] = useState(false);
  const [imgError, setImgError] = useState(false);
  const router = useRouter();
  const accent = CATEGORY_ACCENT[item.category];
  const isHot = (Date.now() - new Date(item.publishedAt).getTime()) < 2 * 60 * 60 * 1000;
  const showImage = !!item.imageUrl && !imgError;

  useEffect(() => { setRead(isRead(item.id)); }, [item.id]);

  const handleClick = () => {
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
      className={`card-enter group bg-[#0f1623] border border-white/[0.06] rounded-xl overflow-hidden hover:border-white/[0.12] cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${read ? "opacity-30" : ""}`}
      style={{ animationDelay: `${240 + index * 50}ms` }}
    >
      {showImage ? (
        <div className="relative w-full h-36 overflow-hidden bg-[#0a0e17]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.imageUrl} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" onError={() => setImgError(true)} />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f1623]/80 via-transparent to-transparent" />
          <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${accent}cc, ${accent}11)` }} />
        </div>
      ) : (
        <div className="h-[2px]" style={{ background: `linear-gradient(90deg, ${accent}bb, ${accent}11)` }} />
      )}

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <CategoryTag category={item.category} />
            {isHot && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-orange-400">
                <span className="hot-pulse inline-block w-1.5 h-1.5 rounded-full bg-orange-400" />HOT
              </span>
            )}
          </div>
          <BookmarkButton id={item.id} />
        </div>
        <p className="text-slate-200 group-hover:text-white text-sm font-medium leading-snug line-clamp-3 transition-colors mb-3">
          {item.title}
        </p>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
          <span className="font-mono font-medium" style={{ color: `${accent}88` }}>{item.source}</span>
          <span>·</span>
          <span>{timeAgo(item.publishedAt)}</span>
        </div>
      </div>
    </div>
  );
}
