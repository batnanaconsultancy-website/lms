/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-body)', 'sans-serif'],
        display: ['var(--font-display)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      colors: {
        brand: {
          50:  '#f0f4ff',
          100: '#e0eaff',
          500: '#4f6ef7',
          600: '#3b55e6',
          700: '#2d43cc',
          900: '#1a2a8a',
        },
        surface: {
          50:  '#f8f9fc',
          100: '#f0f2f9',
          800: '#1c1f2e',
          900: '#13151f',
          950: '#0c0e17',
        },
      },
      animation: {
        'fade-in': 'fadeIn .35s ease both',
        'slide-up': 'slideUp .4s cubic-bezier(.16,1,.3,1) both',
      },
      keyframes: {
        fadeIn:  { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'none' } },
      },
    },
  },
  plugins: [],
};
