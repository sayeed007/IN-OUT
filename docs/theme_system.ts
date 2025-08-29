// src/theme/colors.ts
export const Colors = {
  // Primary Brand Colors - Modern Green Gradient
  primary: {
    50: '#F0FDF4',
    100: '#DCFCE7', 
    200: '#BBF7D0',
    300: '#86EFAC',
    400: '#4ADE80',
    500: '#22C55E', // Main brand green
    600: '#16A34A',
    700: '#15803D',
    800: '#166534',
    900: '#14532D',
  },

  // Secondary - Modern Purple/Indigo
  secondary: {
    50: '#EEF2FF',
    100: '#E0E7FF',
    200: '#C7D2FE',
    300: '#A5B4FC',
    400: '#818CF8',
    500: '#6366F1', // Main secondary
    600: '#4F46E5',
    700: '#4338CA',
    800: '#3730A3',
    900: '#312E81',
  },

  // Semantic Colors
  success: {
    50: '#F0FDF4',
    500: '#22C55E',
    600: '#16A34A',
    700: '#15803D',
  },

  warning: {
    50: '#FFFBEB',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
  },

  error: {
    50: '#FEF2F2',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
  },

  info: {
    50: '#EFF6FF',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
  },

  // Neutral Colors - Modern Gray Scale
  neutral: {
    0: '#FFFFFF',
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
    950: '#030712',
  },

  // Dark Mode Colors
  dark: {
    background: '#0A0A0B',
    surface: '#1A1A1B',
    surfaceVariant: '#2D2D30',
    border: '#3A3A3D',
    text: '#FFFFFF',
    textSecondary: '#A1A1AA',
    textTertiary: '#71717A',
  },

  // Income/Expense Specific
  income: {
    light: '#DCFCE7',
    main: '#22C55E',
    dark: '#15803D',
    gradient: ['#22C55E', '#16A34A'],
  },

  expense: {
    light: '#FEE2E2',
    main: '#EF4444',
    dark: '#B91C1C', 
    gradient: ['#EF4444', '#DC2626'],
  },

  transfer: {
    light: '#EFF6FF',
    main: '#3B82F6',
    dark: '#1D4ED8',
    gradient: ['#3B82F6', '#2563EB'],
  },

  // Chart Colors - Vibrant and Accessible
  chart: {
    1: '#22C55E', // Green
    2: '#3B82F6', // Blue  
    3: '#F59E0B', // Orange
    4: '#EF4444', // Red
    5: '#8B5CF6', // Purple
    6: '#06B6D4', // Cyan
    7: '#F97316', // Orange
    8: '#EC4899', // Pink
    9: '#84CC16', // Lime
    10: '#6366F1', // Indigo
  },
} as const;

// src/theme/typography.ts
export const Typography = {
  // Font Families
  families: {
    primary: 'System', // Will use SF Pro on iOS, Roboto on Android
    mono: 'Menlo', // For numbers and code
  },

  // Font Sizes (using 4px scale)
  sizes: {
    xs: 12,
    sm: 14, 
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
    '6xl': 60,
  },

  // Line Heights
  lineHeights: {
    tight: 1.25,
    normal: 1.5, 
    relaxed: 1.75,
  },

  // Font Weights
  weights: {
    light: '300' as const,
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },

  // Text Styles
  styles: {
    // Headers
    h1: {
      fontSize: 36,
      fontWeight: '700' as const,
      lineHeight: 1.25,
    },
    h2: {
      fontSize: 30,
      fontWeight: '700' as const,
      lineHeight: 1.25,
    },
    h3: {
      fontSize: 24,
      fontWeight: '600' as const,
      lineHeight: 1.25,
    },
    h4: {
      fontSize: 20,
      fontWeight: '600' as const,
      lineHeight: 1.25,
    },

    // Body Text
    bodyLarge: {
      fontSize: 18,
      fontWeight: '400' as const,
      lineHeight: 1.5,
    },
    body: {
      fontSize: 16,
      fontWeight: '400' as const,
      lineHeight: 1.5,
    },
    bodySmall: {
      fontSize: 14,
      fontWeight: '400' as const,
      lineHeight: 1.5,
    },

    // Labels
    labelLarge: {
      fontSize: 16,
      fontWeight: '500' as const,
      lineHeight: 1.25,
    },
    label: {
      fontSize: 14,
      fontWeight: '500' as const,
      lineHeight: 1.25,
    },
    labelSmall: {
      fontSize: 12,
      fontWeight: '500' as const,
      lineHeight: 1.25,
    },

    // Captions
    caption: {
      fontSize: 12,
      fontWeight: '400' as const,
      lineHeight: 1.25,
    },

    // Numbers (using monospace for alignment)
    currency: {
      fontSize: 24,
      fontWeight: '600' as const,
      fontFamily: 'System',
      lineHeight: 1.2,
    },
    amount: {
      fontSize: 18,
      fontWeight: '500' as const,
      fontFamily: 'System',
      lineHeight: 1.2,
    },
  },
} as const;

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

// src/theme/shadows.ts
export const Shadows = {
  // iOS-style shadows
  ios: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.18,
      shadowRadius: 1.0,
    },
    medium: {
      shadowColor: '#000', 
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.23,
      shadowRadius: 2.62,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.30,
      shadowRadius: 4.65,
    },
  },

  // Android-style elevation
  android: {
    small: { elevation: 2 },
    medium: { elevation: 4 },
    large: { elevation: 8 },
  },
} as const;

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