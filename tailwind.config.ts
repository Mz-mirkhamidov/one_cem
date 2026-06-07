import type { Config } from "tailwindcss";

// Tailwind v4 — ranglar @theme (globals.css) da sozlangan
// Bu fayl faqat content detection uchun saqlanadi
const config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
} satisfies Config;

export default config;
