/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        notion: {
          bg: '#ffffff',
          sidebar: '#f7f6f3',
          hover: '#efefef',
          border: '#e3e3e0',
          text: '#37352f',
          'text-secondary': '#6b7280',
          accent: '#2383e2',
          'accent-hover': '#1b6ec2',
        },
      },
      fontFamily: {
        sans: [
          'ui-sans-serif', '-apple-system', 'BlinkMacSystemFont',
          'Segoe UI', 'Helvetica', 'Apple Color Emoji', 'Arial',
          'sans-serif', 'Segoe UI Emoji', 'Segoe UI Symbol',
        ],
        mono: ['SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
      fontSize: {
        'page-title': ['2.5rem', { lineHeight: '1.2', fontWeight: '700' }],
      },
    },
  },
  plugins: [],
};
