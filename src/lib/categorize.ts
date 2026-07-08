import type { Category } from "@/types/news";

const CATEGORY_KEYWORDS: Record<Category, string[]> = {
  AI: [
    "ai", "인공지능", "llm", "gpt", "claude", "gemini", "머신러닝", "딥러닝",
    "neural", "machine learning", "deep learning", "openai", "anthropic",
    "chatgpt", "copilot", "model", "transformer", "embedding", "rag",
  ],
  보안: [
    "보안", "해킹", "취약점", "vulnerability", "exploit", "cve", "security",
    "malware", "ransomware", "phishing", "zero-day", "patch", "침해", "공격",
    "사이버", "cyber", "암호화", "encryption", "인증", "auth",
  ],
  클라우드: [
    "aws", "azure", "gcp", "cloud", "클라우드", "kubernetes", "k8s", "docker",
    "container", "serverless", "lambda", "terraform", "devops", "infra",
    "인프라", "서버리스", "microservice", "마이크로서비스",
  ],
  개발: [
    "개발", "프로그래밍", "코드", "code", "framework", "library", "api",
    "javascript", "typescript", "python", "rust", "go", "java", "c++",
    "react", "vue", "next", "node", "github", "git", "open source", "오픈소스",
    "ide", "vscode", "debugging", "testing", "ci/cd", "deploy",
  ],
  스타트업: [
    "스타트업", "startup", "창업", "투자", "funding", "vc", "series",
    "유니콘", "unicorn", "인수", "acquisition", "ipo", "exit", "pivot",
    "founder", "창업자",
  ],
  기타: [],
};

export function categorize(title: string): Category {
  const lower = title.toLowerCase();

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (category === "기타") continue;
    if (keywords.some((kw) => lower.includes(kw))) {
      return category as Category;
    }
  }

  return "기타";
}
