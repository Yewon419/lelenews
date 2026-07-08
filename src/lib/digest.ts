import type { NewsItem, Category } from "@/types/news";

/**
 * 뉴스 목록에서 오늘의 TOP 5 선정
 * 기준: 최신성 + 소스 다양성 + 카테고리 다양성
 */
export function pickTop5(items: NewsItem[]): NewsItem[] {
  const now = Date.now();
  const DAY = 24 * 60 * 60 * 1000;

  // 24시간 이내 기사만 후보로 (없으면 48시간)
  let candidates = items.filter(
    (i) => now - new Date(i.publishedAt).getTime() < DAY
  );
  if (candidates.length < 10) {
    candidates = items.filter(
      (i) => now - new Date(i.publishedAt).getTime() < DAY * 2
    );
  }

  // 점수 계산
  const scored = candidates.map((item) => {
    const ageHours = (now - new Date(item.publishedAt).getTime()) / 3_600_000;
    const recencyScore = Math.max(0, 10 - ageHours * 0.4); // 최신일수록 높음
    const hasSummary = item.summary ? 1 : 0;
    const isHot = ageHours < 2 ? 2 : 0;
    return { item, score: recencyScore + hasSummary + isHot };
  });

  scored.sort((a, b) => b.score - a.score);

  // 소스/카테고리 다양성 보장하며 5개 선택
  const picked: NewsItem[] = [];
  const usedSources = new Set<string>();
  const usedCategories = new Set<Category>();

  // 1차: 소스/카테고리 겹치지 않게
  for (const { item } of scored) {
    if (picked.length >= 5) break;
    if (!usedSources.has(item.source) || !usedCategories.has(item.category)) {
      picked.push(item);
      usedSources.add(item.source);
      usedCategories.add(item.category);
    }
  }

  // 2차: 부족하면 점수 순으로 채우기
  for (const { item } of scored) {
    if (picked.length >= 5) break;
    if (!picked.includes(item)) picked.push(item);
  }

  return picked.slice(0, 5);
}
