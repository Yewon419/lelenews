import Parser from "rss-parser";
import { categorize } from "./categorize";
import type { FeedSource, NewsItem } from "@/types/news";
import { createHash } from "crypto";

const parser = new Parser({
  timeout: 8000,
  customFields: {
    item: [
      "enclosure",
      "description",
      "summary",
      "content:encoded",
    ],
  },
});

export const FEED_SOURCES: FeedSource[] = [
  { name: "GeekNews", url: "https://feeds.feedburner.com/geeknews-feed" },
  { name: "Hacker News", url: "https://news.ycombinator.com/rss" },
  { name: "44BITS", url: "https://www.44bits.io/ko/feed" },
  { name: "CIO Korea", url: "https://www.ciokorea.com/rss/index.html" },
  { name: "ZDNet Korea", url: "https://www.zdnet.co.kr/rss/index.xml" },
];

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/&[a-z]+;/gi, " ").trim();
}

function generateId(link: string, title: string): string {
  return createHash("md5").update(link + title).digest("hex").slice(0, 12);
}

function extractImgFromHtml(html: string): string | undefined {
  const m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return m?.[1];
}

function isValidImageUrl(url: unknown): url is string {
  if (typeof url !== "string" || !url) return false;
  return /^https?:\/\/.+\.(jpe?g|png|webp|gif|avif)(\?.*)?$/i.test(url);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractImage(item: any): string | undefined {
  // 1. enclosure
  if (isValidImageUrl(item.enclosure?.url)) return item.enclosure.url;

  // 2. media:content (네임스페이스 콜론 때문에 대괄호 접근)
  const mc = item["media:content"];
  if (mc) {
    const arr = Array.isArray(mc) ? mc : [mc];
    for (const m of arr) {
      if (isValidImageUrl(m?.$?.url)) return m.$.url;
    }
  }

  // 3. media:thumbnail
  const mt = item["media:thumbnail"];
  if (isValidImageUrl(mt?.$?.url)) return mt.$.url;

  // 4. 본문 HTML 안 첫 번째 <img>
  const html =
    (item["content:encoded"] as string | undefined) ||
    (item.description as string | undefined) ||
    (item.content as string | undefined) || "";
  if (html) {
    const fromHtml = extractImgFromHtml(html);
    if (isValidImageUrl(fromHtml)) return fromHtml;
  }

  return undefined;
}

async function parseFeed(source: FeedSource): Promise<NewsItem[]> {
  const feed = await parser.parseURL(source.url);

  return (feed.items || []).slice(0, 30).map((item) => {
    const rawSummary =
      item.contentSnippet ||
      item.summary ||
      (item as unknown as Record<string, string>)["content:encoded"] ||
      item.content || "";

    const summary = stripHtml(String(rawSummary)).slice(0, 200) || undefined;
    const title = item.title?.trim() || "(제목 없음)";
    const link = item.link || "#";
    const imageUrl = extractImage(item);

    return {
      id: generateId(link, title),
      title,
      link,
      source: source.name,
      publishedAt: item.isoDate || new Date().toISOString(),
      summary: summary || undefined,
      imageUrl,
      category: categorize(title),
    };
  });
}

export async function fetchAllFeeds(): Promise<{ items: NewsItem[]; errors: string[] }> {
  const results = await Promise.allSettled(FEED_SOURCES.map((s) => parseFeed(s)));

  const items: NewsItem[] = [];
  const errors: string[] = [];

  results.forEach((result, i) => {
    if (result.status === "fulfilled") {
      items.push(...result.value);
    } else {
      errors.push(`${FEED_SOURCES[i].name}: ${result.reason?.message || "파싱 실패"}`);
    }
  });

  items.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  return { items, errors };
}
