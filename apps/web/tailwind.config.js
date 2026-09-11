/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#06090F',
          900: '#090D16',
          850: '#0F172A',
          800: '#1E293B',
          700: '#334155',
          600: '#475569',
        },
        brand: {
          500: '#3B82F6',
          600: '#2563EB',
          400: '#60A5FA',
        },
        emerald: {
          500: '#10B981',
          400: '#34D399',
        },
        crimson: {
          500: '#EF4444',
          400: '#F87171',
        },
        amber: {
          500: '#F59E0B',
          400: '#FBBF24',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      }
    },
  },
  plugins: [],
}
