import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#6366f1",
          secondary: "#8b5cf6",
          accent: "#06b6d4",
        },
        success: "#10b981",
        warning: "#f59e0b",
        danger: "#ef4444",
        bg: {
          base: "#0f0f12",
          card: "#1a1a23",
          elevated: "#22222f",
        },
        text: {
          primary: "#f1f5f9",
          secondary: "#94a3b8",
        },
        border: "#2d2d3d",
      },
      fontFamily: {
        display: ["Sora", "sans-serif"],
        body: ["DM Sans", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.375rem",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "gauge-fill": {
          "0%": { strokeDashoffset: "283" },
          "100%": { strokeDashoffset: "var(--gauge-offset)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.3s ease-out",
        "slide-in-right": "slide-in-right 0.3s ease-out",
        "gauge-fill": "gauge-fill 1s ease-out forwards",
      },
    },
  },
  plugins: [],
};

export default config;
