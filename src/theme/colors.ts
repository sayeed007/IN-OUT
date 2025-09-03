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
    background: '#000000',
    surface: '#1F1F23',
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