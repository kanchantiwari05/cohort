/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy:    { DEFAULT: '#1B3A6B', light: '#2E5299', dark: '#0F2347' },
        teal:    { DEFAULT: '#028090', light: '#03A0B0', dark: '#016E7A' },
        amber:   { DEFAULT: '#E6A817', light: '#F0BC3D', dark: '#C48E0E' },
        success: { DEFAULT: '#2E7D32', light: '#43A047', dark: '#1B5E20' },
        warning: { DEFAULT: '#C17900', light: '#E8920A', dark: '#9A6000' },
        danger:  { DEFAULT: '#BF360C', light: '#D84315', dark: '#8D1F04' },
        surface:   '#F4F8FF',
        card:      '#FFFFFF',
        primary:   '#1A237E',
        secondary: '#546E7A',
        border:    '#D0DCF0',
        // backward compat aliases
        action:        '#028090',
        accent:        '#E6A817',
        bg:            '#F4F8FF',
        textPrimary:   '#1A237E',
        textSecondary: '#546E7A',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        card:   '12px',
        button: '8px',
      },
      boxShadow: {
        card:  '0 2px 8px rgba(27,58,107,0.08)',
        modal: '0 8px 32px rgba(27,58,107,0.16)',
        otp:   '0 0 0 3px rgba(2,128,144,0.18)',
      },
      fontSize: {
        '2xs': ['11px', { lineHeight: '1.4' }],
      },
    },
  },
  plugins: [],
}
