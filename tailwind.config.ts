import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: { "2xl": "1280px" },
    },
    extend: {
      colors: {
        navy: {
          DEFAULT: "#0B1F3A",
          50: "#EAF0F8",
          100: "#CFDCED",
          400: "#274870",
          600: "#122A4C",
          900: "#081426",
        },
        ink: "#111111",
        gold: {
          DEFAULT: "#D4AF37",
          light: "#E7CA6C",
          dark: "#A9852A",
        },
        brown: {
          DEFAULT: "#6F4E37",
          light: "#8C6A4E",
        },
        paper: "#FFFFFF",
        section: "#F8F8F8",
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
        ui: ["var(--font-ui)", "sans-serif"],
      },
      backgroundImage: {
        "gold-fade": "linear-gradient(135deg, #D4AF37 0%, #E7CA6C 50%, #A9852A 100%)",
        "navy-fade": "linear-gradient(160deg, #0B1F3A 0%, #122A4C 60%, #081426 100%)",
      },
      boxShadow: {
        soft: "0 10px 40px -12px rgba(11,31,58,0.18)",
        gold: "0 8px 30px -8px rgba(212,175,55,0.35)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-14px)" },
        },
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.8s ease forwards",
        float: "float 6s ease-in-out infinite",
        marquee: "marquee 30s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
