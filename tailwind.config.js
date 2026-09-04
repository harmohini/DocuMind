/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        warm: {
          50: '#FAF8F5',
          100: '#F8F6F1', // Primary BG
          200: '#F1EDE5', // Secondary BG
          300: '#E8E0D2', // Warm beige accent
          400: '#E4DED4', // Border
          500: '#8B7355', // Primary Accent
          600: '#5F4B35', // Dark accent
          700: '#6F6A62', // Secondary text
          800: '#242321', // Dark charcoal text
          900: '#1A1918',
        },
        mutedText: '#9A948A',
        successWarm: '#58745A',
        warningWarm: '#A4773C',
        dangerWarm: '#9A4F45',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'warm-sm': '0 1px 2px 0 rgba(36, 35, 33, 0.04)',
        'warm-md': '0 4px 12px -2px rgba(36, 35, 33, 0.06), 0 2px 6px -1px rgba(36, 35, 33, 0.04)',
        'warm-lg': '0 10px 25px -3px rgba(36, 35, 33, 0.08), 0 4px 10px -2px rgba(36, 35, 33, 0.04)',
      },
      borderRadius: {
        'warm': '12px',
        'warm-lg': '14px',
        'warm-sm': '8px',
      }
    },
  },
  plugins: [],
}
