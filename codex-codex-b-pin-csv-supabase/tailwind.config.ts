import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#183028",
        leaf: "#176b4d",
        court: "#f2b84b",
        clay: "#d96c3b",
        mist: "#f3f7f2"
      },
      boxShadow: {
        soft: "0 16px 45px rgba(24, 48, 40, 0.10)"
      }
    }
  },
  plugins: []
};

export default config;
