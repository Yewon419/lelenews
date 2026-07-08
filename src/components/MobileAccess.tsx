"use client";

import { useState, useEffect } from "react";

interface IpInfo {
  localUrl: string;
  publicUrl: string | null;
  publicIp: string | null;
  port: string;
}

function QRPanel({ url, label, note }: { url: string; label: string; note: string }) {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=176x176&data=${encodeURIComponent(url)}&bgcolor=0f1623&color=e2e8f0&margin=8`;
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="rounded-xl overflow-hidden bg-[#0a0e17] p-1 border border-white/5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={qrUrl} alt="QR Code" width={176} height={176} />
      </div>
      <div className="text-center space-y-1 w-full">
        <p className="text-[11px] text-slate-500">{note}</p>
        <p className="text-xs text-slate-300 font-mono bg-white/5 px-3 py-1.5 rounded-lg break-all">{url}</p>
      </div>
    </div>
  );
}

export default function MobileAccess() {
  const [show, setShow] = useState(false);
  const [info, setInfo] = useState<IpInfo | null>(null);
  const [tab, setTab] = useState<"local" | "public">("public");

  useEffect(() => {
    fetch("/api/local-ip")
      .then((r) => r.json())
      .then((d) => setInfo(d))
      .catch(() => {});
  }, []);

  if (!info) return null;

  return (
    <>
      <button
        onClick={() => setShow(true)}
        className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors border border-white/5 hover:border-white/15 rounded-lg px-2.5 py-1.5"
        title="모바일로 열기"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
          <line x1="12" y1="18" x2="12.01" y2="18" />
        </svg>
        <span className="hidden sm:inline">모바일</span>
      </button>

      {show && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setShow(false)}
        >
          <div
            className="bg-[#0f1623] border border-white/10 rounded-2xl p-5 flex flex-col gap-4 w-72"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 헤더 */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-white">모바일로 열기</span>
              <button onClick={() => setShow(false)} className="text-slate-500 hover:text-white text-xl leading-none">×</button>
            </div>

            {/* 탭 */}
            <div className="flex bg-white/[0.04] rounded-lg p-0.5 gap-0.5">
              {(["public", "local"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex-1 text-xs py-1.5 rounded-md transition-all ${
                    tab === t ? "bg-white/10 text-white font-medium" : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {t === "public" ? "🌐 외부 (어디서나)" : "📶 로컬 (같은 와이파이)"}
                </button>
              ))}
            </div>

            {/* QR 패널 */}
            {tab === "public" ? (
              info.publicUrl ? (
                <QRPanel
                  url={info.publicUrl}
                  label="외부 접속"
                  note="포트포워딩 설정 후 어디서든 접속 가능"
                />
              ) : (
                <div className="text-center py-4 space-y-2">
                  <p className="text-slate-500 text-xs">공인 IP 조회 실패</p>
                  <a href="https://ifconfig.me" target="_blank" rel="noopener noreferrer"
                    className="text-xs text-blue-400 hover:text-blue-300">ifconfig.me 에서 확인 →</a>
                </div>
              )
            ) : (
              <QRPanel
                url={info.localUrl}
                label="로컬 접속"
                note="같은 와이파이에서만 접속 가능"
              />
            )}

            {/* 포트포워딩 안내 */}
            {tab === "public" && info.publicUrl && (
              <div className="text-[10px] text-slate-600 bg-white/[0.02] border border-white/5 rounded-lg px-3 py-2 leading-relaxed">
                ⚙️ 공유기 설정 → 포트포워딩 → 외부 <span className="text-slate-400">{info.port}</span> → 내부 <span className="text-slate-400">{info.localUrl.split(":")[1].replace("//","")}</span>:{info.port}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
