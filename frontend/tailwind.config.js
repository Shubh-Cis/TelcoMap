/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        noc: {
          bg: '#0f172a',       // Slate 900
          card: '#1e293b',     // Slate 800
          border: '#334155',   // Slate 700
          muted: '#94a3b8',    // Slate 400
          highlight: '#38bdf8',// Sky 400
        },
      },
    },
  },
  plugins: [],
};
