// src/utils/constants/categories.ts
import type { Category } from '../../types/global';

export const CATEGORY_TYPES = [
  {
    value: 'income' as const,
    label: 'Income',
    icon: 'trending-up',
    description: 'Money coming in'
  },
  {
    value: 'expense' as const,
    label: 'Expense',
    icon: 'trending-down',
    description: 'Money going out'
  },
] as const;

export const CATEGORY_COLORS = [
  '#22C55E', // Green
  '#3B82F6', // Blue
  '#F59E0B', // Orange
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#F97316', // Deep Orange
  '#EC4899', // Pink
  '#84CC16', // Lime
  '#6366F1', // Indigo
  '#14B8A6', // Teal
  '#F43F5E', // Rose
] as const;

export const CATEGORY_ICONS = {
  income: [
    'trending-up',
    'briefcase-outline',
    'trophy-outline',
    'cash-outline',
    'stats-chart-outline',
    'card-outline',
    'gift-outline',
    'diamond-outline',
    'star-outline',
    'medal-outline'
  ],
  expense: [
    'restaurant-outline',
    'car-outline',
    'home-outline',
    'bag-outline',
    'flash-outline',
    'balloon-outline',
    'medical-outline',
    'library-outline',
    'airplane-outline',
    'film-outline',
    'fitness-outline',
    'school-outline',
    'shirt-outline',
    'game-controller-outline'
  ],
} as const;

export type CategoryTypeInfo = typeof CATEGORY_TYPES[number];
export type CategoryType = Category['type'];