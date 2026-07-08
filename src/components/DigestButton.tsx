"use client";

import { useState } from "react";

export default function DigestButton() {
  const [state, setState] = useState<"idle" | "loading" | "ok" | "err">("idle");

  const send = async () => {
    setState("loading");
    try {
      const res = await fetch("/api/send-digest", { method: "POST" });
      const data = await res.json();
      setState(data.ok ? "ok" : "err");
    } catch {
      setState("err");
    }
    setTimeout(() => setState("idle"), 3000);
  };

  const label = {
    idle:    "📬 Daily",
    loading: "발송 중...",
    ok:      "✓ 전송됨",
    err:     "✗ 실패",
  }[state];

  return (
    <button
      onClick={send}
      disabled={state === "loading"}
      className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all ${
        state === "ok"  ? "border-green-500/30 text-green-400 bg-green-500/10" :
        state === "err" ? "border-red-500/30 text-red-400 bg-red-500/10" :
        "border-white/5 text-slate-500 hover:text-slate-300 hover:border-white/15"
      } disabled:opacity-50`}
    >
      {label}
    </button>
  );
}
