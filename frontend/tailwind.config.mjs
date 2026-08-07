/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        sena: {
          primary: {
            DEFAULT: '#39A900',
            light: '#5BC200',
            dark: '#2F8F00',
          },
          secondary: {
            DEFAULT: '#007832',
            light: '#1C9A45',
            dark: '#005F28',
          },
          dark: {
            DEFAULT: '#00304D',
            light: '#1A4F6C',
            dark: '#001F33',
          },
          info: {
            DEFAULT: '#50E5F9',
            light: '#7FF0FF',
            dark: '#2CCBDF',
          },
          warning: {
            DEFAULT: '#FDC300',
            light: '#FFD54F',
            dark: '#E6AA00',
          },
          accent: {
            DEFAULT: '#71277A',
            light: '#8E3C97',
            dark: '#541B5C',
          },
          error: {
            DEFAULT: '#D32F2F',
            light: '#E57373',
          },
          destructive: {
            DEFAULT: '#93000A',
            light: '#B71C1C',
            dark: '#6D0007',
          },
          neutral: {
            white: '#FFFFFF',
            100: '#F6F6F6',
            200: '#DCDCDC',
            300: '#BDBDBD',
            500: '#6B7280',
            black: '#000000',
          },
        },
      },
      fontFamily: {
        sans: ['Work Sans', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-login': 'linear-gradient(45deg, #2F8F00, #0E3201)',
        'gradient-primary': 'linear-gradient(135deg, #39A900, #5BC200)',
        'gradient-secondary': 'linear-gradient(135deg, #007832, #1C9A45)',
        'gradient-dark': 'linear-gradient(135deg, #00304D, #1A4F6C)',
      },
    },
  },
  plugins: [],
}
