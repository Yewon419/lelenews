"use client";

import { useEffect, useState } from "react";
import { getReadItems } from "@/lib/storage";
import type { NewsItem } from "@/types/news";

interface Props {
  items: NewsItem[];
}

export default function ReadProgress({ items }: Props) {
  const [readCount, setReadCount] = useState(0);
  const total = items.length;

  useEffect(() => {
    const readIds = getReadItems();
    const count = items.filter((i) => readIds.includes(i.id)).length;
    setReadCount(count);

    // 클릭 시 카운트 갱신 (storage 변경 감지)
    const onStorage = () => {
      const ids = getReadItems();
      setReadCount(items.filter((i) => ids.includes(i.id)).length);
    };
    window.addEventListener("click", onStorage);
    return () => window.removeEventListener("click", onStorage);
  }, [items]);

  if (total === 0) return null;

  const pct = Math.round((readCount / total) * 100);
  const done = readCount === total;

  return (
    <div className="fade-enter flex items-center gap-3">
      <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            background: done
              ? "linear-gradient(90deg, #22c55e, #16a34a)"
              : "linear-gradient(90deg, #6366f1, #8b5cf6)",
          }}
        />
      </div>
      <span className="text-[11px] font-mono text-slate-500 flex-shrink-0">
        {done ? (
          <span className="text-green-400 font-semibold">✓ 모두 읽음</span>
        ) : (
          <><span className="text-slate-300">{readCount}</span> / {total} 읽음</>
        )}
      </span>
    </div>
  );
}
