/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        notion: {
          bg: 'var(--bg, #ffffff)',
          sidebar: 'var(--sidebar, #f7f6f3)',
          hover: 'var(--hover, #efefef)',
          border: 'var(--border, #e3e3e0)',
          text: 'var(--text, #37352f)',
          'text-secondary': 'var(--text-secondary, #6b7280)',
          accent: 'var(--accent, #2383e2)',
          'accent-hover': 'var(--accent-hover, #1b6ec2)',
        },
      },
      fontFamily: {
        sans: [
          'ui-sans-serif', '-apple-system', 'BlinkMacSystemFont',
          'Segoe UI', 'Helvetica', 'Apple Color Emoji', 'Arial',
          'sans-serif', 'Segoe UI Emoji', 'Segoe UI Symbol',
        ],
        mono: ['SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
        serif: ['Lyon-Text', 'Georgia', 'ui-serif', 'serif'],
      },
    },
  },
  plugins: [],
};
