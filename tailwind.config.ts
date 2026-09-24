import type { Config } from "tailwindcss";

/** Colours are CSS variables (space-separated RGB channels) so the admin theme can change them. */
const themed = (name: string) => `rgb(var(--color-${name}) / <alpha-value>)`;

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
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
          DEFAULT: themed("navy"),
          50: themed("navy-50"),
          100: themed("navy-100"),
          400: themed("navy-400"),
          600: themed("navy-600"),
          900: themed("navy-900"),
        },
        ink: themed("ink"),
        gold: {
          DEFAULT: themed("gold"),
          light: themed("gold-light"),
          dark: themed("gold-dark"),
        },
        brown: {
          DEFAULT: themed("brown"),
          light: themed("brown-light"),
        },
        paper: themed("paper"),
        section: themed("section"),
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
        ui: ["var(--font-ui)", "sans-serif"],
      },
      borderRadius: {
        // Cards and buttons follow the appearance settings.
        "2xl": "var(--radius-card)",
        btn: "var(--radius-btn)",
      },
      backgroundImage: {
        "gold-fade":
          "linear-gradient(135deg, rgb(var(--color-gold)) 0%, rgb(var(--color-gold-light)) 50%, rgb(var(--color-gold-dark)) 100%)",
        "navy-fade":
          "linear-gradient(160deg, rgb(var(--color-navy)) 0%, rgb(var(--color-navy-600)) 60%, rgb(var(--color-navy-900)) 100%)",
      },
      boxShadow: {
        soft: "0 10px 40px -12px rgb(var(--color-navy) / 0.18)",
        gold: "0 8px 30px -8px rgb(var(--color-gold) / 0.35)",
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
