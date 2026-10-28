/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#060A12',
          900: '#0B0F19',
          850: '#0F1626',
          800: '#151E32',
          700: '#1E2B45',
        },
        forensic: {
          cyan: '#38BDF8',
          blue: '#0284C7',
          dark: '#0369A1',
          accent: '#0EA5E9',
          alert: '#F43F5E',
          warning: '#F59E0B',
          success: '#10B981',
          surface: '#111827',
          card: '#1F2937'
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
