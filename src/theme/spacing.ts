// src/theme/spacing.ts  
export const Spacing = {
  // Base unit: 4px
  xs: 4,
  sm: 8,
  base: 12,
  md: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
  '4xl': 64,
  '5xl': 80,
  '6xl': 96,

  // Semantic spacing
  component: {
    padding: {
      xs: 8,
      sm: 12,
      base: 16,
      lg: 20,
      xl: 24,
    },
    margin: {
      xs: 4,
      sm: 8,
      base: 12,
      lg: 16,
      xl: 20,
    },
  },

  // Screen padding
  screen: {
    horizontal: 16,
    vertical: 20,
  },

  // Component spacing
  card: {
    padding: 16,
    margin: 12,
  },

  list: {
    itemSpacing: 8,
    sectionSpacing: 20,
  },
} as const;