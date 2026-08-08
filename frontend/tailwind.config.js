/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: "#f8faf9",
        "surface-dim": "#d8dad9",
        "surface-container-low": "#f2f4f3",
        "on-surface": "#191c1c",
        "on-surface-variant": "#4d463e",
        outline: "#7e766d",
        primary: "#463929",
        "primary-container": "#5e503f",
        "on-primary-container": "#d6c3ad",
        secondary: "#904952",
        "on-secondary": "#ffffff",
        "secondary-container": "#fca3ad",
        "on-secondary-container": "#783640",
        background: "#f8faf9",
        "on-background": "#191c1c",
        "primary-fixed": "#f4dfc9",
        "primary-fixed-dim": "#d7c3ae",
      },
      fontFamily: {
        headline: ['"Playfair Display"', "serif"],
        body: ['"Source Sans 3"', "sans-serif"],
      },
      spacing: {
        "margin-mobile": "16px",
        "margin-desktop": "64px",
        gutter: "24px",
      },
      borderRadius: {
        sm: "0.125rem",
        DEFAULT: "0.25rem",
        md: "0.375rem",
        lg: "0.5rem",
        xl: "0.75rem",
      },
    },
  },
  plugins: [],
};
