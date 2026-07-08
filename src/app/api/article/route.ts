import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const runtime = "nodejs";
export const maxDuration = 30;

// ── HTML에서 본문 텍스트 추출 ──────────────────────────────────────────────
function extractContent(html: string): { title: string; text: string } {
  // 노이즈 제거
  const cleaned = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "")
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, "")
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "")
    .replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "");

  // 제목
  const titleMatch = cleaned.match(/<(?:h1|title)[^>]*>([\s\S]*?)<\/(?:h1|title)>/i);
  const title = titleMatch
    ? titleMatch[1].replace(/<[^>]+>/g, "").trim()
    : "";

  // 본문 우선순위: <article> > <main> > 전체
  const articleMatch =
    cleaned.match(/<article[^>]*>([\s\S]*?)<\/article>/i) ||
    cleaned.match(/<main[^>]*>([\s\S]*?)<\/main>/i) ||
    cleaned.match(/<div[^>]+(?:class|id)=["'][^"']*(?:content|article|post|entry|body)[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);

  const source = articleMatch ? articleMatch[1] : cleaned;

  // <p> 단락 추출
  const paragraphs: string[] = [];
  const pMatches = source.match(/<p[^>]*>([\s\S]*?)<\/p>/gi) || [];
  for (const p of pMatches) {
    const text = p.replace(/<[^>]+>/g, "").replace(/&[a-z#0-9]+;/gi, " ").trim();
    if (text.length > 40) paragraphs.push(text);
  }

  // <p>가 없으면 li도 활용
  if (paragraphs.length < 3) {
    const liMatches = source.match(/<li[^>]*>([\s\S]*?)<\/li>/gi) || [];
    for (const li of liMatches) {
      const text = li.replace(/<[^>]+>/g, "").replace(/&[a-z#0-9]+;/gi, " ").trim();
      if (text.length > 40) paragraphs.push(text);
    }
  }

  return { title, text: paragraphs.slice(0, 40).join("\n\n") };
}

// ── 언어 감지 (한국어 비중으로 판단) ────────────────────────────────────────
function isEnglish(text: string): boolean {
  const korean = (text.match(/[\uAC00-\uD7AF]/g) || []).length;
  const latin = (text.match(/[a-zA-Z]/g) || []).length;
  return korean < latin * 0.15;
}

// ── Claude 호출 ──────────────────────────────────────────────────────────────
async function processWithClaude(
  text: string,
  needsTranslation: boolean
): Promise<{ summary: string[]; translatedText: string | null }> {
  const client = new Anthropic();

  const prompt = needsTranslation
    ? `아래 영어 기사를 분석해줘.

---
${text.slice(0, 6000)}
---

다음 JSON 형식으로만 응답해 (다른 텍스트 없이):
{
  "summary": ["핵심 포인트 1 (한국어)", "핵심 포인트 2 (한국어)", "핵심 포인트 3 (한국어)"],
  "translation": "전체 기사 한국어 번역문 (자연스럽게, 마크다운 없이 단락 구분만)"
}`
    : `아래 기사를 분석해줘.

---
${text.slice(0, 6000)}
---

다음 JSON 형식으로만 응답해 (다른 텍스트 없이):
{
  "summary": ["핵심 포인트 1", "핵심 포인트 2", "핵심 포인트 3"],
  "translation": null
}`;

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
  });

  const raw = (message.content[0] as { text: string }).text.trim();
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("JSON 파싱 실패");

  const parsed = JSON.parse(jsonMatch[0]);
  return {
    summary: parsed.summary || [],
    translatedText: parsed.translation || null,
  };
}

// ── Route Handler ────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) return NextResponse.json({ error: "url 파라미터 필요" }, { status: 400 });

  // 1. 기사 HTML 가져오기
  let html = "";
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.8",
      },
      signal: AbortSignal.timeout(10000),
    });
    html = await res.text();
  } catch {
    return NextResponse.json({ error: "기사를 가져올 수 없습니다." }, { status: 502 });
  }

  // 2. 본문 추출
  const { title, text } = extractContent(html);
  if (!text || text.length < 100) {
    return NextResponse.json({ error: "본문을 추출할 수 없습니다." }, { status: 422 });
  }

  // 3. Claude API (키 없으면 스킵)
  const hasApiKey = !!process.env.ANTHROPIC_API_KEY;
  let summary: string[] = [];
  let translatedText: string | null = null;
  const needsTranslation = isEnglish(text);

  if (hasApiKey) {
    try {
      const result = await processWithClaude(text, needsTranslation);
      summary = result.summary;
      translatedText = result.translatedText;
    } catch (e) {
      console.error("Claude 오류:", e);
    }
  }

  return NextResponse.json({
    title,
    text: translatedText ?? text,
    originalText: needsTranslation ? text : null,
    summary,
    isTranslated: !!translatedText,
    hasAI: hasApiKey,
  });
}
