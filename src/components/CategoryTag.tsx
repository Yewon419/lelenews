import type { Category } from "@/types/news";

export const CATEGORY_CONFIG: Record<
  Category,
  { color: string; bg: string; border: string; glow: string; heroFrom: string }
> = {
  AI:    { color: "text-violet-300", bg: "bg-violet-500/10", border: "border-violet-500/40", glow: "glow-ai",       heroFrom: "from-violet-950/70" },
  보안:  { color: "text-red-300",    bg: "bg-red-500/10",    border: "border-red-500/40",    glow: "glow-security", heroFrom: "from-red-950/70" },
  개발:  { color: "text-blue-300",   bg: "bg-blue-500/10",   border: "border-blue-500/40",   glow: "glow-dev",      heroFrom: "from-blue-950/70" },
  클라우드: { color: "text-teal-300",bg: "bg-teal-500/10",   border: "border-teal-500/40",   glow: "glow-cloud",    heroFrom: "from-teal-950/70" },
  스타트업: { color: "text-green-300",bg:"bg-green-500/10",  border: "border-green-500/40",  glow: "glow-startup",  heroFrom: "from-green-950/70" },
  기타:  { color: "text-slate-400",  bg: "bg-slate-500/10",  border: "border-slate-500/30",  glow: "",              heroFrom: "from-slate-900/70" },
};

export const CATEGORY_ACCENT: Record<Category, string> = {
  AI:      "#8b5cf6",
  보안:    "#ef4444",
  개발:    "#3b82f6",
  클라우드:"#14b8a6",
  스타트업:"#22c55e",
  기타:    "#64748b",
};

interface Props {
  category: Category;
  size?: "sm" | "xs";
}

export default function CategoryTag({ category, size = "xs" }: Props) {
  const cfg = CATEGORY_CONFIG[category];
  return (
    <span className={`inline-flex items-center font-medium border rounded-full ${cfg.bg} ${cfg.color} ${cfg.border} ${
      size === "xs" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-0.5 text-xs"
    }`}>
      {category}
    </span>
  );
}
