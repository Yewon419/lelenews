# LeLeNews 개발 진행 기록

> 최종 업데이트: 2026-03-20

---

## 프로젝트 개요

개인용 IT/개발 뉴스 대시보드. 매일 아침 보고 싶은 뉴스 허브를 목표로 개발.
나중에 더 큰 워크 대시보드의 뉴스 위젯으로 편입될 수 있도록 모듈형 구조.

**경로**: `C:\Users\windg\Desktop\PROJECT\LeLeNews`
**스택**: Next.js 14 (App Router) + TypeScript + TailwindCSS
**패키지 매니저**: npm

---

## 뉴스 소스

| 이름 | URL |
|------|-----|
| GeekNews | https://feeds.feedburner.com/geeknews-feed |
| Hacker News | https://news.ycombinator.com/rss |
| 44BITS | https://www.44bits.io/ko/feed |
| CIO Korea | https://www.ciokorea.com/rss/index.html |
| ZDNet Korea | https://www.zdnet.co.kr/rss/index.xml |

---

## 구현 완료 기능

### ✅ 뉴스 피드
- RSS 5개 소스 서버사이드 병렬 파싱 (`/api/news`)
- 한 소스 실패해도 나머지 정상 표시 (graceful skip)
- 최신순 정렬, 소스별 탭 필터 (건수 표시)
- 키워드 기반 카테고리 자동 분류: AI / 보안 / 개발 / 클라우드 / 스타트업 / 기타
- 페이지 포커스 복귀 시 5분 이상 지나면 자동 갱신

### ✅ UI/UX 디자인
- 다크 테마 (`#0a0e17` 기반, GitHub 다크 계열)
- 폰트: Pretendard (한글) + JetBrains Mono (코드/숫자)
- 카테고리별 컬러 시스템 (AI=보라, 보안=빨강, 개발=파랑, 클라우드=청록, 스타트업=초록)
- 모바일 반응형

### ✅ 히어로 + 카드 레이아웃
- **히어로 섹션**: 최신 3개를 크고 임팩트 있게 (카테고리 그라디언트 + 글로우 테두리)
  - `01 / 02 / 03` 랭킹 번호 표시
  - RSS에서 추출한 실제 이미지 표시 (없으면 그라디언트 fallback)
  - 이미지 위 그라디언트 페이드 처리
- **카드 그리드**: 나머지 최대 21개, 3열 반응형 그리드
  - 카테고리별 상단 3px 컬러 액센트 바
  - 썸네일 이미지 지원

### ✅ 도파민 요소
- **카드 순차 등장 애니메이션** (stagger slide-up, CSS keyframe)
- **HOT 배지**: 2시간 이내 기사에 주황색 펄싱 점 + "HOT" 텍스트
- **새 기사 배너**: 재방문 시 "지난 방문 이후 N개 새 기사" 보라색 알림
- **읽음 진행 바**: 히어로 아래 보라→초록 그라디언트, 완료 시 "✓ 모두 읽음"
- 날짜 헤더: "3월 20일 목요일 — 오늘의 IT"
- 카드 hover 시 살짝 위로 뜨는 효과

### ✅ 읽음 처리 & 북마크
- 클릭한 기사 읽음 표시 (localStorage), 읽은 기사 투명도 낮게
- 북마크 토글 (localStorage), `/bookmarks` 페이지 별도
- 마지막 방문 시각 저장 → 새 기사 카운트에 활용

### ✅ 인앱 리더 (`/article/[id]`)
- 카드 클릭 시 외부 링크 대신 인앱 리더로 이동
- 서버사이드 기사 HTML 스크래핑 + 본문 추출
- **Claude Haiku API**로 핵심 3포인트 요약 생성
- 영어 기사 자동 감지 → 한국어 번역
- 번역본 / 원문(English) 토글
- 원문 보기 버튼 항상 제공
- API 키 없으면 원문 텍스트만 표시 + 안내 메시지

### ✅ 모바일 접속
- `--hostname 0.0.0.0`으로 모든 네트워크 인터페이스 바인딩
- 헤더 📱 모바일 버튼 → QR코드 팝업
  - **🌐 외부 탭**: 공인 IP (api.ipify.org 조회) QR코드 — 포트포워딩 후 어디서든 접속
  - **📶 로컬 탭**: 로컬 IP QR코드 — 같은 와이파이에서 즉시 접속
  - 포트포워딩 설정 가이드 인라인 표시
- `setup_firewall.bat`: Windows 방화벽 자동 설정 스크립트 (관리자 권한 실행)

### ✅ Daily Digest 이메일
- **Resend** 이용 (무료 3,000건/월)
- Top 5 선정 알고리즘: 최신성 + 소스 다양성 + 카테고리 다양성
- HTML 이메일 템플릿 (다크 테마, 카테고리 컬러 배지)
- 헤더 📬 Daily 버튼으로 수동 즉시 발송
- Vercel 배포 시 **매일 오전 8시(KST)** 자동 발송 (`vercel.json` cron)

---

## 환경변수 (.env.local)

```env
ANTHROPIC_API_KEY=...     # 인앱 리더 AI 요약/번역
RESEND_API_KEY=...        # 이메일 발송
DIGEST_EMAIL=...          # 수신 이메일 주소
CRON_SECRET=...           # (선택) Vercel cron 보안
```

---

## 파일 구조

```
src/
├── app/
│   ├── page.tsx                    # 메인 피드
│   ├── layout.tsx                  # 헤더 + 공통 레이아웃
│   ├── globals.css                 # 애니메이션 + 다크 테마
│   ├── bookmarks/page.tsx          # 북마크 목록
│   ├── article/[id]/page.tsx       # 인앱 리더
│   └── api/
│       ├── news/route.ts           # RSS 파싱 (서버)
│       ├── article/route.ts        # 기사 스크래핑 + AI 처리
│       ├── local-ip/route.ts       # 로컬/공인 IP 조회
│       └── send-digest/route.ts    # 이메일 발송 (GET=cron, POST=수동)
├── components/
│   ├── NewsList.tsx                # 피드 메인 (히어로+그리드+필터+배너)
│   ├── HeroCard.tsx                # 상단 3개 대형 카드
│   ├── NewsCard.tsx                # 그리드 카드
│   ├── SourceFilter.tsx            # 소스 탭 필터
│   ├── CategoryTag.tsx             # 카테고리 배지 + 컬러 정의
│   ├── BookmarkButton.tsx          # 북마크 토글
│   ├── ReadProgress.tsx            # 읽음 진행 바
│   ├── MobileAccess.tsx            # QR코드 모바일 접속 팝업
│   └── DigestButton.tsx            # 수동 이메일 발송 버튼
├── lib/
│   ├── rss.ts                      # RSS 파싱 + 이미지 추출
│   ├── categorize.ts               # 키워드 기반 카테고리 분류
│   ├── storage.ts                  # localStorage (읽음/북마크/lastVisit)
│   ├── digest.ts                   # Top 5 선정 알고리즘
│   └── emailTemplate.ts            # HTML 이메일 템플릿
└── types/
    └── news.ts                     # NewsItem, Source, Category 타입
```

---

## 남은 작업 / 개선 아이디어

- [ ] Vercel 배포 (vercel.json cron 활성화)
- [ ] Resend 커스텀 도메인 설정 (현재 `onboarding@resend.dev` 발신)
- [ ] 기사 스크래핑 실패 소스 개선 (JS 렌더링 필요한 사이트)
- [ ] 카테고리 필터 (소스 필터 외에 카테고리별 필터 추가)
- [ ] 더 큰 워크 대시보드 위젯으로 편입 시 props/API 인터페이스 정의
