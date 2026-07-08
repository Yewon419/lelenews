"use client";

import { useState, useEffect } from "react";
import { toggleBookmark, isBookmarked } from "@/lib/storage";

interface Props {
  id: string;
}

export default function BookmarkButton({ id }: Props) {
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    setBookmarked(isBookmarked(id));
  }, [id]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const next = toggleBookmark(id);
    setBookmarked(next);
  };

  return (
    <button
      onClick={handleClick}
      className={`p-1 rounded transition-all ${
        bookmarked
          ? "text-amber-400 hover:text-amber-300"
          : "text-slate-600 hover:text-slate-400"
      }`}
      title={bookmarked ? "북마크 해제" : "북마크"}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill={bookmarked ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
    </button>
  );
}
