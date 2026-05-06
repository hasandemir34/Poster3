import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "off-white": "#F9F9F9",
        cream: "#F5F0E8",
        "pastel-rose": "#F2D5D5",
        "pastel-sage": "#D5E8D5",
        "pastel-sky": "#D5E2F2",
        charcoal: "#2C2C2C",
        muted: "#9B9B9B",
      },
      fontFamily: {
        sans: ["DM Sans", "sans-serif"],
      },
      spacing: {
        "18": "4.5rem",
        "88": "22rem",
        "128": "32rem",
      },
      borderRadius: {
        sm: "4px",
        DEFAULT: "8px",
        md: "10px",
        lg: "14px",
        xl: "20px",
        "2xl": "28px",
      },
      boxShadow: {
        card: "0 2px 12px rgba(44,44,44,0.07)",
        modal: "0 8px 40px rgba(44,44,44,0.18)",
        subtle: "0 1px 4px rgba(44,44,44,0.05)",
        lift: "0 4px 24px rgba(44,44,44,0.12)",
      },
    },
  },
  plugins: [],
};
export default config;
