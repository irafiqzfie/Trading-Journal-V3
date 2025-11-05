import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-bg': 'rgb(var(--color-brand-bg) / <alpha-value>)',
        'brand-surface': 'rgb(var(--color-brand-surface) / <alpha-value>)',
        'brand-primary': 'rgb(var(--color-brand-primary) / <alpha-value>)',
        'brand-secondary': 'rgb(var(--color-brand-secondary) / <alpha-value>)',
        'brand-accent': 'rgb(var(--color-brand-accent) / <alpha-value>)',
        'brand-text': 'rgb(var(--color-brand-text) / <alpha-value>)',
        'brand-text-secondary': 'rgb(var(--color-brand-text-secondary) / <alpha-value>)',
        'brand-profit': 'rgb(var(--color-brand-profit) / <alpha-value>)',
        'brand-loss': 'rgb(var(--color-brand-loss) / <alpha-value>)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-in-up': {
           '0%': { opacity: '0', transform: 'translateY(20px)' },
           '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-up-fade': {
          '0%': { opacity: '0', transform: 'translateY(1rem)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
         'value-flash': {
          '0%, 100%': { 'background-color': 'transparent' },
          '50%': { 'background-color': 'rgb(var(--color-brand-accent) / 0.2)' },
        },
        'pulse-glow': {
          '0%, 100%': { 
            transform: 'scale(1)',
            'box-shadow': '0 0 8px rgb(var(--color-brand-primary) / 0.6), 0 0 15px rgb(var(--color-brand-primary) / 0.5)'
          },
          '50%': { 
            transform: 'scale(1.05)',
            'box-shadow': '0 0 15px rgb(var(--color-brand-primary) / 0.7), 0 0 25px rgb(var(--color-brand-primary) / 0.6), 0 0 40px rgb(var(--color-brand-primary) / 0.2)'
          }
        },
         'background-pan': {
          '0%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
          '100%': { 'background-position': '0% 50%' },
         },
         'tooltip-pop': {
          '0%': { opacity: '0', transform: 'scale(0.95) translateY(var(--tooltip-translate-y))' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
         }
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out forwards',
        'fade-in-up': 'fade-in-up 0.6s ease-out forwards',
        'slide-up-fade': 'slide-up-fade 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
        'value-flash': 'value-flash 0.5s ease-in-out forwards',
        'pulse-glow': 'pulse-glow 2s infinite ease-in-out',
        'background-pan': 'background-pan 15s ease infinite',
        'tooltip-pop': 'tooltip-pop 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }
    },
  },
  plugins: [],
};
export default config;