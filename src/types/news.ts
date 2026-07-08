export type Category =
  | "AI"
  | "보안"
  | "개발"
  | "클라우드"
  | "스타트업"
  | "기타";

export type Source =
  | "GeekNews"
  | "Hacker News"
  | "44BITS"
  | "CIO Korea"
  | "ZDNet Korea";

export interface NewsItem {
  id: string;
  title: string;
  link: string;
  source: Source;
  publishedAt: string; // ISO 8601
  summary?: string;
  imageUrl?: string;
  category: Category;
}

export interface FeedSource {
  name: Source;
  url: string;
}

export interface NewsApiResponse {
  items: NewsItem[];
  fetchedAt: string;
  errors: string[];
}
