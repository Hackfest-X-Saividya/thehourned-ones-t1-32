/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        theme: {
          bg: '#0B1120',
          panel: '#111B2B',
          surface: '#172337',
          border: '#29374B',
          'text-primary': '#E5EDF7',
          'text-secondary': '#A2B1C5',
          'text-muted': '#77879D',
          blue: '#60A5FA',
          teal: '#2DD4BF',
          success: '#34D399',
          warning: '#FBBF24',
          error: '#F87171'
        },
        navy: {
          950: '#0B1120',
          900: '#111B2B',
          850: '#141F32',
          800: '#172337',
          700: '#203049',
          600: '#29374B'
        },
        forensic: {
          cyan: '#60A5FA',
          blue: '#3B82F6',
          dark: '#1D4ED8',
          accent: '#60A5FA',
          teal: '#2DD4BF',
          alert: '#F87171',
          warning: '#FBBF24',
          success: '#34D399',
          surface: '#111B2B',
          card: '#172337'
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif']
      }
    },
  },
  plugins: [],
};

