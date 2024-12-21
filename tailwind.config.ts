import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        gold: {
          100: '#FFF1C1',
          200: '#FFE49B',
          300: '#FFD875',
          400: '#FFCC4F',
          500: '#FFBF29',
          600: '#D9A31F',
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
