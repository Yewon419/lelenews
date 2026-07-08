"use client";

import type { Source } from "@/types/news";

const ALL_SOURCES: (Source | "전체")[] = [
  "전체", "GeekNews", "Hacker News", "44BITS", "CIO Korea", "ZDNet Korea",
];

interface Props {
  selected: Source | "전체";
  onChange: (source: Source | "전체") => void;
  counts: Record<string, number>;
}

export default function SourceFilter({ selected, onChange, counts }: Props) {
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-hide">
      {ALL_SOURCES.map((source) => {
        const count = source === "전체" ? total : (counts[source] || 0);
        const active = selected === source;
        return (
          <button
            key={source}
            onClick={() => onChange(source)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
              active
                ? "bg-white/10 text-white"
                : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
            }`}
          >
            {source}
            {count > 0 && (
              <span className={`ml-1.5 text-[10px] font-mono ${active ? "text-slate-400" : "text-slate-600"}`}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
