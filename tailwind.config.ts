import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#07060B',
        'bg-elev': '#0E0B16',
        'bg-card': 'rgba(255,255,255,0.03)',
        'neon-pink': '#FF2D87',
        'neon-cyan': '#00E5FF',
        'neon-lime': '#C6FF3D',
        'neon-magenta': '#C026FF',
        'neon-violet': '#7A5CFF',
        'neon-amber': '#FFB020',
        'neon-orange': '#FF6B35',
        'glass-stroke': 'rgba(255,255,255,0.08)',
      },
      fontFamily: {
        lato: ['var(--font-lato)', 'sans-serif'],
      },
      backgroundImage: {
        'chrome-text': 'linear-gradient(180deg, #FFFFFF 0%, #A8A8C0 100%)',
        'neon-pink-glow': 'radial-gradient(ellipse at center, rgba(255,45,135,0.3) 0%, transparent 70%)',
        'neon-cyan-glow': 'radial-gradient(ellipse at center, rgba(0,229,255,0.3) 0%, transparent 70%)',
        'neon-violet-glow': 'radial-gradient(ellipse at center, rgba(122,92,255,0.3) 0%, transparent 70%)',
      },
      animation: {
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
        'halo-drift': 'halo-drift 12s ease-in-out infinite alternate',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'halo-drift': {
          '0%': { transform: 'translate(-20px, -20px) scale(1)' },
          '100%': { transform: 'translate(20px, 20px) scale(1.1)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'neon-pink': '0 0 0 1px rgba(255,45,135,0.2), 0 8px 40px rgba(255,45,135,0.15)',
        'neon-cyan': '0 0 0 1px rgba(0,229,255,0.2), 0 8px 40px rgba(0,229,255,0.15)',
        'neon-lime': '0 0 0 1px rgba(198,255,61,0.2), 0 8px 40px rgba(198,255,61,0.15)',
        'neon-magenta': '0 0 0 1px rgba(192,38,255,0.2), 0 8px 40px rgba(192,38,255,0.15)',
        'neon-violet': '0 0 0 1px rgba(122,92,255,0.2), 0 8px 40px rgba(122,92,255,0.15)',
        'neon-amber': '0 0 0 1px rgba(255,176,32,0.2), 0 8px 40px rgba(255,176,32,0.15)',
        'glass': '0 1px 0 0 rgba(255,255,255,0.08) inset, 0 -1px 0 0 rgba(0,0,0,0.4) inset',
      },
    },
  },
  plugins: [],
}

export default config
