import { NextResponse } from "next/server";
import { fetchAllFeeds } from "@/lib/rss";
import type { NewsApiResponse } from "@/types/news";

export const runtime = "nodejs";
export const revalidate = 300; // 5분 캐싱

export async function GET() {
  try {
    const { items, errors } = await fetchAllFeeds();

    const response: NewsApiResponse = {
      items,
      fetchedAt: new Date().toISOString(),
      errors,
    };

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { items: [], fetchedAt: new Date().toISOString(), errors: [String(error)] },
      { status: 500 }
    );
  }
}
