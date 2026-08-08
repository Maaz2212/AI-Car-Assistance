/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        showroom: {
          bg: '#0B0C10',
          indigo: '#14182B',
          amber: '#FFB020',
          teal: '#33D6A6',
          ink: '#F4F3EF',
        },
      },
      fontFamily: {
        heading: ['Space Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backdropBlur: {
        glass: '20px',
      },
      boxShadow: {
        'amber-glow': '0 0 25px rgba(255, 176, 32, 0.3)',
        'teal-glow': '0 0 25px rgba(51, 214, 166, 0.35)',
        'glass-card': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
    },
  },
  plugins: [],
};
