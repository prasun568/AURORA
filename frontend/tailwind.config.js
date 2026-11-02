/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Cinzel"', '"Cormorant Garamond"', 'Georgia', 'serif'],
        display: ['"Cinzel"', 'serif'],
        academic: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        academia: {
          bg: '#24090F',        // Primary Deep Burgundy
          wine: '#350E18',      // Secondary Dark Wine
          card: '#401923',      // Card Background
          gold: '#C69B48',      // Antique Gold
          'gold-light': '#E5C477', // Highlight Gold
          parchment: '#F0E3C6', // Parchment
          muted: '#C8B99F',     // Muted Text
          text: '#F6EBD5',      // Main Text
          border: '#75502F',    // Borders
          'border-gold': '#C69B48',
        },
        // Backward-compatible aliases for existing classes
        aurora: {
          50: '#F0E3C6',
          100: '#E5C477',
          200: '#C69B48',
          300: '#C69B48',
          400: '#E5C477',
          500: '#C69B48',
          600: '#C69B48',
          700: '#75502F',
          800: '#401923',
          900: '#350E18',
          dark: '#24090F',
          card: '#401923',
          border: '#75502F',
        },
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        candleGlow: {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '0.85', transform: 'scale(1.04)' },
        },
        goldShimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        float: 'float 5s ease-in-out infinite',
        'candle-glow': 'candleGlow 4s ease-in-out infinite',
        'gold-shimmer': 'goldShimmer 6s linear infinite',
      },
    },
  },
  plugins: [],
}
