/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#4da3ff',
          DEFAULT: '#0078ff',
          dark: '#0057b8',
        },
        secondary: {
          light: '#8b92a5',
          DEFAULT: '#64748b',
          dark: '#475569',
        },
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        background: {
          light: '#f8fafc',
          dark: '#0f172a',
        },
        editor: {
          light: '#f1f5f9',
          dark: '#1e293b',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
    },
  },
  darkMode: 'class',
  plugins: [],
}