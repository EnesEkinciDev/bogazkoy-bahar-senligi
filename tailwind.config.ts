import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        club: {
          red: "#b52729",
          dark: "#7a1a1c",
          soft: "#fce8e8",
          paper: "#fdfcf7",
          cream: "#fbf7ea",
          green: "#247143",
          ink: "#16181a",
          muted: "#5a5a5a",
          line: "#e8e2d1",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Arial Narrow", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        poster: "0 20px 44px -24px rgba(122, 26, 28, 0.65)",
      },
    },
  },
  plugins: [],
};

export default config;
