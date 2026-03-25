/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Inter', 'SF Pro Display', 'system-ui', 'sans-serif'],
        body:    ['Inter', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      /* Clean, spec-compliant sizes */
      fontSize: {
        'xs':   ['12px', { lineHeight: '1.5' }],
        'sm':   ['14px', { lineHeight: '1.5' }],
        'base': ['16px', { lineHeight: '1.6' }],
        'lg':   ['18px', { lineHeight: '1.6' }],
        'xl':   ['20px', { lineHeight: '1.5' }],
        '2xl':  ['24px', { lineHeight: '1.4' }],
        '3xl':  ['30px', { lineHeight: '1.3' }],
        '4xl':  ['36px', { lineHeight: '1.2' }],
        '5xl':  ['48px', { lineHeight: '1.1' }],
      },
      letterSpacing: {
        tight:  '-0.02em',
        tighter:'-0.03em',
      },
      colors: {
        /* Primary palette — matches spec exactly */
        brand: {
          blue:   '#3B82F6',
          violet: '#8B5CF6',
          green:  '#10B981',
          red:    '#EF4444',
          yellow: '#F59E0B',
          /* legacy aliases so existing components still resolve */
          cyan:   '#3B82F6',
          purple: '#8B5CF6',
        },
        /* Backgrounds */
        bg: {
          DEFAULT: '#000000',
          1:       '#0A0A0A',
          2:       '#111111',
        },
        /* Text */
        tx: {
          primary: '#F9FAFB',
          muted:   '#9CA3AF',
          label:   '#D1D5DB',
        },
        /* Structural */
        divider: '#1F2937',
        surface: {
          1: 'rgba(255,255,255,0.03)',
          2: 'rgba(255,255,255,0.06)',
          3: 'rgba(255,255,255,0.09)',
        },
      },
      animation: {
        'spin-slow':  'spin 8s linear infinite',
        'pulse-slow': 'pulse 4s ease-in-out infinite',
        'float':      'float 6s ease-in-out infinite',
        'glow':       'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%':     { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%':   { boxShadow: '0 0 6px rgba(59,130,246,0.3)' },
          '100%': { boxShadow: '0 0 24px rgba(59,130,246,0.6)' },
        },
      },
      backdropBlur: { xs: '4px', sm: '8px', md: '14px', lg: '20px' },
      boxShadow: {
        glass:  '0 8px 32px rgba(0,0,0,0.6)',
        glow:   '0 0 28px rgba(59,130,246,0.4)',
        'glow-lg': '0 0 50px rgba(59,130,246,0.4), 0 0 80px rgba(139,92,246,0.2)',
      },
      borderColor: {
        DEFAULT: 'rgba(255,255,255,0.08)',
      },
      maxWidth: {
        content: '1100px',
      },
    },
  },
  plugins: [],
}
