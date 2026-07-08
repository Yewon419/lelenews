"use client";

import { useState, useEffect } from "react";
import { getBookmarks } from "@/lib/storage";
import NewsCard from "@/components/NewsCard";
import type { NewsItem } from "@/types/news";

export default function BookmarksPage() {
  const [bookmarkedItems, setBookmarkedItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const ids = getBookmarks();
      if (ids.length === 0) { setLoading(false); return; }
      try {
        const res = await fetch("/api/news");
        const data = await res.json();
        const filtered: NewsItem[] = data.items.filter((item: NewsItem) =>
          ids.includes(item.id)
        );
        setBookmarkedItems(filtered);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div>
      <div className="mb-8">
        <p className="text-xs text-slate-500 font-mono mb-1">저장한 기사</p>
        <h1 className="text-2xl font-bold text-white">북마크</h1>
      </div>

      {loading ? (
        <div className="text-slate-600 text-sm text-center py-12 animate-pulse">불러오는 중...</div>
      ) : bookmarkedItems.length === 0 ? (
        <div className="text-center py-20 space-y-2">
          <p className="text-slate-500 text-sm">저장된 북마크가 없습니다.</p>
          <p className="text-slate-700 text-xs">카드의 ★ 버튼을 눌러 북마크하세요.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {bookmarkedItems.map((item) => (
            <NewsCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
