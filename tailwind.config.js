export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy:    { DEFAULT: '#1A3A6B', dark: '#112850', light: '#E8EDF5' },
        gold:    { DEFAULT: '#B8860B', light: '#FDF6E3' },
        surface: '#FFFFFF',
        bg:      '#F4F6FA',
        border:  '#DDE2ED',
      },
      fontFamily: {
        display: ['"IBM Plex Sans"', 'sans-serif'],
        body:    ['Inter', 'sans-serif'],
        mono:    ['"IBM Plex Mono"', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '0px',
        sm:      '2px',
        md:      '4px',
        lg:      '8px',
        full:    '9999px',
      },
    },
  },
  plugins: [],
}
