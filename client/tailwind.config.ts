import { colors } from "./src/styles/generated/colors";

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],

  theme: {
    extend: {
      colors,
      boxShadow: {
        custom: "0 4px 8px rgba(0,0,0,0.1)",
      },
    },
  },

  plugins: [
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require("tailwind-scrollbar")({ nocompatible: true }),
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require("tailwindcss-animate"),
  ],
};
