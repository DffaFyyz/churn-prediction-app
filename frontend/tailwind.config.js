/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: {
          50: '#f6f7f9',
          100: '#eceef2',
          200: '#d5dae3',
          300: '#b0b9c9',
          400: '#8493aa',
          500: '#637490',
          600: '#4d5b76',
          700: '#3f4a60',
          800: '#373f51',
          900: '#1f2533',
          950: '#0d1018',
        },
        accent: {
          DEFAULT: '#00d4a8',
          hover: '#00b894',
        },
      },
      boxShadow: {
        'inset-border': 'inset 0 0 0 1px rgb(255 255 255 / 0.08)',
      },
    },
  },
  plugins: [],
};
