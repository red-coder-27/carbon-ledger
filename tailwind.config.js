/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#1B3A2B',
          light: '#2d5440',
          dark: '#102219',
        },
        paper: {
          DEFAULT: '#FAF6EE',
          dark: '#F3EDE0',
        },
        moss: {
          DEFAULT: '#6B8E7F',
          light: '#8faea0',
          dark: '#4c6c5e',
        },
        clay: {
          DEFAULT: '#C75D3A',
          light: '#d67c5e',
          dark: '#9d4325',
        },
        leaf: {
          DEFAULT: '#4F8A5B',
          light: '#6fa579',
          dark: '#386542',
        },
        graphite: {
          DEFAULT: '#4A4A45',
          light: '#72726b',
          dark: '#2d2d2a',
        },
      },
      fontFamily: {
        serif: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Inter', 'Source Sans 3', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
