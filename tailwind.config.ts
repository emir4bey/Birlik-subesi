import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        base: "#0B0F0D",
        panel: "#12160F",
        line: "#293325",
        olive: "#5C6B47",
        olivebright: "#7C8F5A",
        signal: "#D98E2B",
        ink: "#E9E7DC",
        mute: "#8A9180",
        danger: "#B5443B",
      },
      fontFamily: {
        display: ["var(--font-oswald)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
