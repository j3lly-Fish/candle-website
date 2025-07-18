import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary color palette based on requirements
        primary: {
          DEFAULT: '#8B4513', // Saddle Brown - warm, candle-like color
          50: '#FDF8F3',
          100: '#F9E8D3',
          200: '#F2D1A7',
          300: '#E8B474',
          400: '#D89441',
          500: '#C17817',
          600: '#A85F12',
          700: '#8B4513', // Main primary color
          800: '#6B3410',
          900: '#4A240B',
        },
        secondary: '#FF0000', // Red
        accent: '#800000', // Maroon
        
        // Neutral colors
        'neutral-light': '#F5F5F5', // Light Gray
        'neutral-dark': '#333333', // Dark Gray
        
        // Status colors
        success: '#4CAF50', // Green
        error: '#F44336', // Bright Red
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)'],
        mono: ['var(--font-geist-mono)'],
      },
      boxShadow: {
        'custom': '0 4px 6px rgba(0, 0, 0, 0.1)',
        'custom-hover': '0 10px 15px rgba(0, 0, 0, 0.2)',
      },
      opacity: {
        '85': '0.85',
        '95': '0.95',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      // Responsive breakpoints based on design document
      screens: {
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      // Custom transition timing
      transitionTimingFunction: {
        'custom-ease': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      // Custom transition durations
      transitionDuration: {
        '300': '300ms',
        '500': '500ms',
      },
    },
  },
  plugins: [],
};

export default config;