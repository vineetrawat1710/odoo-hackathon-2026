/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#4f46e5',
          600: '#4338ca',
          700: '#3730a3',
          800: '#312e81',
          900: '#1e1b4b',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        'xl': '14px',
      },
      boxShadow: {
        'crystal': '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)',
        'crystal-hover': '0 4px 16px rgba(79,70,229,0.08), 0 8px 24px rgba(0,0,0,0.06)',
        'crystal-btn': '0 1px 2px rgba(79,70,229,0.3)',
        'crystal-btn-hover': '0 4px 12px rgba(79,70,229,0.25)',
      },
    },
  },
  plugins: [],
}
