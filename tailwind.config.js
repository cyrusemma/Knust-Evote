export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy:    { DEFAULT: 'var(--color-navy)', dark: 'var(--color-navy-dark)', light: 'var(--color-navy-light)' },
        gold:    { DEFAULT: 'var(--color-gold)', light: 'var(--color-gold-light)' },
        surface: 'var(--color-surface)',
        bg:      'var(--color-bg)',
        border:  'var(--color-border)',
        success: 'var(--color-success)',
        danger:  'var(--color-danger)',
        warning: 'var(--color-warning)',
        muted:   'var(--color-muted)',
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
