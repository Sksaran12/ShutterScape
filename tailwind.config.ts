import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Obsidian studio palette
        background: {
          DEFAULT: "#08090C",
          secondary: "#0C0E12",
          tertiary: "#11141A",
          white: "#FFFFFF",
        },
        surface: {
          DEFAULT: "#0E1015",
          elevated: "#14171E",
          muted: "#191D26",
          hover: "#1F2430",
        },
        // Deep contrast layer used by the dark bands and footer
        ink: {
          DEFAULT: "#050608",
          soft: "#0A0C10",
          line: "rgba(255, 255, 255, 0.08)",
        },
        text: {
          primary: "#F4F2EA",
          secondary: "#A7A9A3",
          muted: "#71756F",
          invert: "#F4F2EA",
        },
        forest: {
          DEFAULT: "#6EE7B7",
          hover: "#A7F3D0",
          light: "rgba(110, 231, 183, 0.1)",
          border: "rgba(110, 231, 183, 0.3)",
        },
        terracotta: {
          DEFAULT: "#FB923C",
          hover: "#FDBA74",
          light: "rgba(251, 146, 60, 0.1)",
          border: "rgba(251, 146, 60, 0.3)",
        },
        border: {
          subtle: "rgba(255, 255, 255, 0.06)",
          DEFAULT: "rgba(255, 255, 255, 0.11)",
          active: "rgba(255, 255, 255, 0.24)",
        },
        status: {
          error: "#F87171",
          success: "#34D399",
          warning: "#FBBF24",
          info: "#60A5FA",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Sora", "system-ui", "sans-serif"],
        serif: ["var(--font-display)", "Sora", "system-ui", "sans-serif"],
        sans: ["var(--font-body)", "Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "ui-monospace", "monospace"],
      },
      borderRadius: {
        image: "10px",
        card: "18px",
        frame: "8px",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgba(0, 0, 0, 0.4)",
        editorial: "0 14px 44px -22px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(255, 255, 255, 0.03)",
        card: "0 22px 60px -26px rgba(0, 0, 0, 0.95), 0 0 0 1px rgba(255, 255, 255, 0.05)",
        hover:
          "0 32px 90px -34px rgba(0, 0, 0, 1), 0 0 48px -20px rgba(110, 231, 183, 0.22), 0 0 0 1px rgba(110, 231, 183, 0.16)",
        photo: "0 32px 70px -32px rgba(0, 0, 0, 0.95), 0 4px 14px -4px rgba(0, 0, 0, 0.6)",
        lift: "0 40px 100px -40px rgba(0, 0, 0, 1)",
        glow: "0 0 0 1px rgba(110, 231, 183, 0.38), 0 18px 60px -18px rgba(110, 231, 183, 0.35)",
        "glow-warm":
          "0 0 0 1px rgba(251, 146, 60, 0.38), 0 18px 60px -18px rgba(251, 146, 60, 0.35)",
      },
      transitionTimingFunction: {
        editorial: "cubic-bezier(0.16, 1, 0.3, 1)",
        soft: "cubic-bezier(0.33, 1, 0.68, 1)",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translate3d(0, 0, 0)" },
          "100%": { transform: "translate3d(-50%, 0, 0)" },
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(18px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "soft-float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "scroll-cue": {
          "0%": { opacity: "0", transform: "translateY(-6px)" },
          "40%": { opacity: "1" },
          "100%": { opacity: "0", transform: "translateY(10px)" },
        },
        aurora: {
          "0%": { transform: "translate3d(-8%, -4%, 0) scale(1)" },
          "50%": { transform: "translate3d(8%, 6%, 0) scale(1.12)" },
          "100%": { transform: "translate3d(-4%, 8%, 0) scale(1.04)" },
        },
        "gradient-pan": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        "border-spin": {
          "0%": { "--border-angle": "0deg" },
          "100%": { "--border-angle": "360deg" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.35", transform: "scale(1)" },
          "50%": { opacity: "0.75", transform: "scale(1.05)" },
        },
        "shiny-text": {
          "0%": { backgroundPosition: "200% center" },
          "100%": { backgroundPosition: "-200% center" },
        },
        "spin-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
      animation: {
        marquee: "marquee var(--marquee-duration, 42s) linear infinite",
        shimmer: "shimmer 1.8s ease-in-out infinite",
        "fade-up": "fade-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) both",
        "soft-float": "soft-float 7s ease-in-out infinite",
        "scroll-cue": "scroll-cue 1.8s ease-in-out infinite",
        aurora: "aurora 18s ease-in-out infinite alternate",
        "gradient-pan": "gradient-pan 7s ease infinite",
        "pulse-glow": "pulse-glow 6s ease-in-out infinite",
        "shiny-text": "shiny-text 5s linear infinite",
        "spin-slow": "spin-slow 14s linear infinite",
      },
      backgroundImage: {
        "paper-grain":
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='0.42'/%3E%3C/svg%3E\")",
        "dot-grid":
          "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.09) 1px, transparent 0)",
      },
    },
  },
  plugins: [],
};

export default config;
