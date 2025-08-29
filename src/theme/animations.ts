// src/theme/animations.ts
export const Animations = {
  // Timing
  timing: {
    fast: 200,
    normal: 300,
    slow: 500,
  },

  // Easing curves
  easing: {
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    // Custom bezier curves
    smooth: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },

  // Spring configurations
  spring: {
    gentle: {
      tension: 120,
      friction: 8,
    },
    wobbly: {
      tension: 180,
      friction: 12,
    },
    stiff: {
      tension: 210,
      friction: 20,
    },
  },

  // Scale animations
  scale: {
    press: 0.95,
    hover: 1.02,
    focus: 1.05,
  },
} as const;