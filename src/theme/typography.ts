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