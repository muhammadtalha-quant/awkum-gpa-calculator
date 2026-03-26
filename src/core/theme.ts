export const THEME = {
  colors: {
    primary: '#8b5cf6', // violet-500
    primaryMuted: 'rgba(139, 92, 246, 0.1)',
    bgSurface: '#121215',
    bgSurfaceLowest: '#0c0c0f',
    error: '#ef4444',
    errorMuted: 'rgba(239, 68, 68, 0.1)',
    warning: '#f59e0b',
    textMain: '#ffffff',
    textMuted: '#71717a',
    borderMuted: 'rgba(255, 255, 255, 0.05)',
  },
  spacing: {
    sectionGap: 'gap-8',
    cardPadding: 'p-4 sm:p-6',
    inputPadding: 'px-4 py-2',
  },
  radius: {
    card: 'rounded-3xl',
    input: 'rounded-xl',
    button: 'rounded-2xl',
  },
  shadows: {
    card: 'shadow-2xl',
    glow: 'shadow-glow',
    inner: 'shadow-inner-glow',
  },
  animation: {
    in: 'animate-in fade-in duration-500',
    zoom: 'animate-zoom-in',
  },
} as const;
