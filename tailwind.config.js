/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,tsx,ts,jsx}",
    "./components/**/*.{js,tsx,ts,jsx}",
    "./providers/**/*.{js,tsx,ts,jsx}",
    "./ui/**/*.{js,tsx,ts,jsx}",
  ],
  // Màu (bg-card, text-title, bg-primary/10...) lấy từ UI kit: ui/tailwind.preset.js
  presets: [require("nativewind/preset"), require("./ui/tailwind.preset")],
  theme: { extend: {} },
  plugins: [],
};
