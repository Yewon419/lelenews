import type { NewsItem } from "@/types/news";

const CATEGORY_COLOR: Record<string, string> = {
  AI: "#8b5cf6",
  보안: "#ef4444",
  개발: "#3b82f6",
  클라우드: "#14b8a6",
  스타트업: "#22c55e",
  기타: "#64748b",
};

function timeAgo(isoDate: string): string {
  const diff = (Date.now() - new Date(isoDate).getTime()) / 1000;
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  return `${Math.floor(diff / 86400)}일 전`;
}

export function buildDigestEmail(items: NewsItem[]): { subject: string; html: string } {
  const today = new Date().toLocaleDateString("ko-KR", {
    month: "long", day: "numeric", weekday: "long",
  });

  const cardsHtml = items
    .map(
      (item, i) => {
        const color = CATEGORY_COLOR[item.category] ?? "#64748b";
        return `
        <tr>
          <td style="padding: 0 0 16px 0;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#161b22; border-radius:12px; overflow:hidden; border:1px solid #21262d;">
              <tr>
                <td style="height:3px; background:linear-gradient(90deg,${color},transparent); font-size:0;">&nbsp;</td>
              </tr>
              <tr>
                <td style="padding:18px 20px 14px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="padding-bottom:10px;">
                        <span style="font-size:11px; font-weight:700; color:#0d1117; background:${color}; padding:3px 8px; border-radius:999px;">${item.category}</span>
                        <span style="font-size:11px; color:#8b949e; margin-left:8px;">${item.source} · ${timeAgo(item.publishedAt)}</span>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <span style="font-size:11px; font-weight:700; color:${color}; font-family:monospace; opacity:0.5;">${String(i + 1).padStart(2, "0")}</span>
                        <a href="${item.link}" style="display:block; font-size:15px; font-weight:600; color:#e6edf3; text-decoration:none; line-height:1.5; margin-top:4px;">
                          ${item.title}
                        </a>
                      </td>
                    </tr>
                    ${item.summary ? `
                    <tr>
                      <td style="padding-top:8px;">
                        <p style="font-size:12px; color:#8b949e; margin:0; line-height:1.6;">${item.summary}</p>
                      </td>
                    </tr>` : ""}
                    <tr>
                      <td style="padding-top:12px;">
                        <a href="${item.link}" style="font-size:12px; color:${color}; text-decoration:none;">기사 읽기 →</a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>`;
      }
    )
    .join("");

  const html = `
<!DOCTYPE html>
<html lang="ko">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0; padding:0; background:#0d1117; font-family:'Apple SD Gothic Neo','Malgun Gothic',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d1117; padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%;">

          <!-- 헤더 -->
          <tr>
            <td style="padding-bottom:28px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <span style="font-size:18px; font-weight:700; color:#58a6ff; font-family:monospace;">◈ LeLeNews</span>
                  </td>
                  <td align="right">
                    <span style="font-size:12px; color:#8b949e;">${today}</span>
                  </td>
                </tr>
              </table>
              <div style="margin-top:12px; height:1px; background:linear-gradient(90deg,#58a6ff33,transparent);"></div>
            </td>
          </tr>

          <!-- 타이틀 -->
          <tr>
            <td style="padding-bottom:24px;">
              <p style="margin:0 0 4px; font-size:11px; color:#8b949e; letter-spacing:2px; text-transform:uppercase; font-family:monospace;">오늘의 IT</p>
              <h1 style="margin:0; font-size:24px; font-weight:700; color:#e6edf3;">오늘 꼭 읽어야 할 뉴스 TOP 5</h1>
            </td>
          </tr>

          <!-- 카드 목록 -->
          <tr>
            <td>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${cardsHtml}
              </table>
            </td>
          </tr>

          <!-- 푸터 -->
          <tr>
            <td style="padding-top:16px; border-top:1px solid #21262d;">
              <p style="margin:0; font-size:11px; color:#30363d; text-align:center;">
                LeLeNews Daily Digest · 자동 발송
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return {
    subject: `[LeLeNews] ${today} IT 뉴스 TOP 5`,
    html,
  };
}
