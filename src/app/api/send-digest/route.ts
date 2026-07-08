import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { fetchAllFeeds } from "@/lib/rss";
import { pickTop5 } from "@/lib/digest";
import { buildDigestEmail } from "@/lib/emailTemplate";

export const runtime = "nodejs";
export const maxDuration = 30;

async function handler(req: NextRequest) {
  // Cron 또는 수동 트리거 — CRON_SECRET으로 보호 (없으면 로컬 전용)
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const resendKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.DIGEST_EMAIL;

  if (!resendKey || !toEmail) {
    return NextResponse.json(
      { error: "RESEND_API_KEY 또는 DIGEST_EMAIL 환경변수 누락" },
      { status: 500 }
    );
  }

  // 뉴스 fetch + top 5 선정
  const { items, errors } = await fetchAllFeeds();
  if (items.length === 0) {
    return NextResponse.json({ error: "뉴스를 가져올 수 없습니다", details: errors }, { status: 502 });
  }

  const top5 = pickTop5(items);
  const { subject, html } = buildDigestEmail(top5);

  // 발송
  const resend = new Resend(resendKey);
  const { data, error } = await resend.emails.send({
    from: "LeLeNews <onboarding@resend.dev>",
    to: toEmail,
    subject,
    html,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    emailId: data?.id,
    sentTo: toEmail,
    articles: top5.map((i) => i.title),
  });
}

// Vercel Cron → GET / 수동 트리거 → POST
export const GET = handler;
export const POST = handler;
