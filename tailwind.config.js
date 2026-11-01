/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./client/index.html",
    "./client/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        washi: {
          50: '#FAF8F5',
          100: '#F4EFEA',
          200: '#E8DFD5',
          300: '#D9CCC0',
          400: '#C5B4A4',
        },
        matcha: {
          50: '#F1F6F2',
          100: '#DFECE1',
          200: '#BED9C2',
          500: '#4E7A55',
          600: '#3B6041',
          700: '#2C4931',
          800: '#1E3322',
        },
        hinoki: {
          50: '#FAF6F0',
          100: '#F3E9DD',
          200: '#E5D1BE',
          400: '#B89270',
          500: '#9B7452',
          600: '#7B593C',
          700: '#5E412A',
        },
        sumi: {
          50: '#F6F7F7',
          100: '#E2E5E4',
          300: '#A3ACA9',
          500: '#5E6663',
          700: '#323735',
          800: '#212524',
          900: '#141716',
        },
        sakura: {
          50: '#FDF5F3',
          100: '#F9E4E0',
          200: '#F2C6BE',
          500: '#DB6A57',
          600: '#BF4E3B',
        },
        aizome: {
          50: '#F2F5F8',
          100: '#DEE6ED',
          500: '#385A7C',
          600: '#274461',
        }
      },
      fontFamily: {
        sans: [
          '"Noto Sans JP"',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
        serif: [
          '"Noto Serif JP"',
          'Georgia',
          'serif',
        ],
        mono: [
          '"SF Mono"',
          'Menlo',
          'Consolas',
          'monospace',
        ],
      },
      boxShadow: {
        'zen': '0 4px 20px -2px rgba(20, 23, 22, 0.05), 0 2px 6px -1px rgba(20, 23, 22, 0.03)',
        'zen-lg': '0 10px 30px -4px rgba(20, 23, 22, 0.08), 0 4px 12px -2px rgba(20, 23, 22, 0.04)',
        'ticket': '0 8px 32px -4px rgba(62, 50, 40, 0.12), 0 2px 8px -2px rgba(62, 50, 40, 0.06)',
      },
      animation: {
        'slide-up': 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in': 'fadeIn 0.2s ease-out',
        'ticket-print': 'ticketPrint 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)',
        'pulse-subtle': 'pulseSubtle 2.5s infinite',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        ticketPrint: {
          '0%': { transform: 'translateY(-30px)', opacity: '0' },
          '60%': { transform: 'translateY(4px)', opacity: '0.95' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
    },
  },
  plugins: [],
}
