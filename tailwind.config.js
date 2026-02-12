/** @type {import('tailwindcss').Config} */
const { heroui } = require("@heroui/react");
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",

    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        'crash': "url('/assets/images/bg/bg_main.png')",
      },
      colors: {
        'primary': {
          DEFAULT: '#8A0000',
          '50': '#FFCDC3',
          '100': '#FF907F',
          '200': '#A3140D',
          '300': '#A10F09',
          '400': '#850000',
          '500': '#710000',
          '600': '#5E0000',
          '700': '#4B0000',
          '800': '#380000',
          '900': '#250000',
          '950': '#120000',
        }
      },
      keyframes: {
        rotateXForever: {
          '0%': { transform: 'rotateY(0deg)' },
          '100%': { transform: 'rotateY(360deg)' },
        },
        flipCoin: {
          '0%': { transform: 'rotateY(0deg) scaleX(1)' },
          '25%': { transform: 'rotateY(90deg) scaleX(0)' },
          '50%': { transform: 'rotateY(180deg) scaleX(1)' },
          '75%': { transform: 'rotateY(270deg) scaleX(0)' },
          '100%': { transform: 'rotateY(360deg) scaleX(1)' },
        },
        floatCloud: {
          '0%': { transform: 'translate(0, 0)' },
          '25%': { transform: 'translate(-10px, -5px)' },
          '50%': { transform: 'translate(10px, -10px)' },
          '75%': { transform: 'translate(-10px, -15px)' },
          '100%': { transform: 'translate(0, 0)' },
        },
        'pulse-win': {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.05)', opacity: '0.9' },
        },
        'shake-loss': {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-4px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(4px)' },
        },
        'glow-neon': {
          '0%, 100%': { boxShadow: '0 0 5px #8A0000, 0 0 20px #8A000050' },
          '50%': { boxShadow: '0 0 20px #8A0000, 0 0 40px #8A000080' },
        },
        'count-up': {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        'rotate-x-forever': 'rotateXForever 4s linear infinite',
        'flip-coin': 'flipCoin 4s linear infinite',
        'float-cloud': 'floatCloud 12s ease-in-out infinite',
        'pulse-win': 'pulse-win 0.6s ease-in-out infinite',
        'shake-loss': 'shake-loss 0.5s ease-in-out',
        'glow-neon': 'glow-neon 2s ease-in-out infinite',
        'count-up': 'count-up 0.3s ease-out',
      },
    },
  },
  darkMode: "class",
  plugins: [
    require("tailwindcss-animation-delay"),
    heroui({
      defaultTheme: "dark",
      defaultExtendTheme: "dark"
    })
  ],
}

