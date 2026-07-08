import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        pretendard: ["Pretendard", "sans-serif"],
        mono: ["JetBrains Mono", "IBM Plex Mono", "monospace"],
      },
      colors: {
        gh: {
          bg: "#0d1117",
          surface: "#161b22",
          border: "#30363d",
          text: "#e6edf3",
          muted: "#8b949e",
          accent: "#58a6ff",
          green: "#3fb950",
          yellow: "#d29922",
          red: "#f85149",
          purple: "#bc8cff",
          orange: "#f0883e",
        },
      },
    },
  },
  plugins: [],
};

export default config;
