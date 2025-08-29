// src/theme/index.ts
import { Colors } from './colors';
import { Typography } from './typography';
import { Spacing } from './spacing';
import { Shadows } from './shadows';
import { Animations } from './animations';

export interface Theme {
  colors: typeof Colors;
  typography: typeof Typography;
  spacing: typeof Spacing;
  shadows: typeof Shadows;
  animations: typeof Animations;
  mode: 'light' | 'dark';
}

// Light theme
export const lightTheme: Theme = {
  colors: {
    ...Colors,
    background: Colors.neutral[0],
    surface: Colors.neutral[50],
    surfaceVariant: Colors.neutral[100],
    border: Colors.neutral[200],
    text: Colors.neutral[900],
    textSecondary: Colors.neutral[600],
    textTertiary: Colors.neutral[500],
  },
  typography: Typography,
  spacing: Spacing,
  shadows: Shadows,
  animations: Animations,
  mode: 'light',
};

// Dark theme  
export const darkTheme: Theme = {
  colors: {
    ...Colors,
    background: Colors.dark.background,
    surface: Colors.dark.surface,
    surfaceVariant: Colors.dark.surfaceVariant,
    border: Colors.dark.border,
    text: Colors.dark.text,
    textSecondary: Colors.dark.textSecondary,
    textTertiary: Colors.dark.textTertiary,
  },
  typography: Typography,
  spacing: Spacing,
  shadows: Shadows,
  animations: Animations,
  mode: 'dark',
};

export { Colors, Typography, Spacing, Shadows, Animations };

// Export commonly used theme utilities
export const getTheme = (mode: 'light' | 'dark'): Theme => {
  return mode === 'dark' ? darkTheme : lightTheme;
};

export type ColorKey = keyof typeof Colors;
export type SpacingKey = keyof typeof Spacing;
export type TypographyStyleKey = keyof typeof Typography.styles;