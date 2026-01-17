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
        background: "var(--background)",
        foreground: "var(--foreground)",
        pln: {
          primary: '#035B71',
          light: '#00A2B9',
          dark: '#024656',
          50: '#E6F4F7',
          100: '#CCE9EF',
          200: '#99D3DF',
          300: '#66BDCF',
          400: '#33A7BF',
          500: '#00A2B9',
          600: '#008294',
          700: '#00616F',
          800: '#00414A',
          900: '#002025',
        },
      },
    },
  },
  plugins: [],
};
export default config;
