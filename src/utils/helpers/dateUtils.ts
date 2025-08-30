// src/utils/helpers/dateUtils.ts

/**
 * Date utilities for the expense tracker app
 */

export type DateFormat = 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';

/**
 * Format a date according to user preference
 */
export const formatDate = (date: string | Date, format: DateFormat = 'MM/DD/YYYY'): string => {
  const d = new Date(date);
  
  if (isNaN(d.getTime())) {
    return 'Invalid Date';
  }

  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();

  switch (format) {
    case 'DD/MM/YYYY':
      return `${day}/${month}/${year}`;
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`;
    case 'MM/DD/YYYY':
    default:
      return `${month}/${day}/${year}`;
  }
};

/**
 * Format a date for display (e.g., "Today", "Yesterday", or formatted date)
 */
export const formatDisplayDate = (date: string | Date, format: DateFormat = 'MM/DD/YYYY'): string => {
  const d = new Date(date);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Check if same day
  const isSameDay = (date1: Date, date2: Date) => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  };

  if (isSameDay(d, today)) {
    return 'Today';
  }
  
  if (isSameDay(d, yesterday)) {
    return 'Yesterday';
  }

  return formatDate(d, format);
};

/**
 * Format time from date
 */
export const formatTime = (date: string | Date, use24Hour: boolean = false): string => {
  const d = new Date(date);
  
  if (isNaN(d.getTime())) {
    return 'Invalid Time';
  }

  if (use24Hour) {
    return d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
  }
  
  return d.toLocaleTimeString('en-US', { hour12: true, hour: 'numeric', minute: '2-digit' });
};

/**
 * Get start of month
 */
export const getStartOfMonth = (date: Date | string = new Date()): Date => {
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth(), 1);
};

/**
 * Get end of month
 */
export const getEndOfMonth = (date: Date | string = new Date()): Date => {
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
};

/**
 * Get start of year
 */
export const getStartOfYear = (date: Date | string = new Date()): Date => {
  const d = new Date(date);
  return new Date(d.getFullYear(), 0, 1);
};

/**
 * Get end of year
 */
export const getEndOfYear = (date: Date | string = new Date()): Date => {
  const d = new Date(date);
  return new Date(d.getFullYear(), 11, 31, 23, 59, 59, 999);
};

/**
 * Get month name
 */
export const getMonthName = (monthIndex: number, short: boolean = false): string => {
  const months = short 
    ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
  return months[monthIndex] || 'Invalid Month';
};

/**
 * Get month and year string (e.g., "2025-01")
 */
export const getMonthYear = (date: Date | string = new Date()): string => {
  const d = new Date(date);
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  return `${year}-${month}`;
};

/**
 * Parse month-year string to date
 */
export const parseMonthYear = (monthYear: string): Date => {
  const [year, month] = monthYear.split('-').map(Number);
  return new Date(year, month - 1, 1);
};

/**
 * Get days in month
 */
export const getDaysInMonth = (date: Date | string = new Date()): number => {
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
};

/**
 * Add months to date
 */
export const addMonths = (date: Date | string, months: number): Date => {
  const d = new Date(date);
  const newMonth = d.getMonth() + months;
  return new Date(d.getFullYear(), newMonth, d.getDate());
};

/**
 * Subtract months from date
 */
export const subtractMonths = (date: Date | string, months: number): Date => {
  return addMonths(date, -months);
};

/**
 * Get date range for last N months (including current)
 */
export const getLastNMonthsRange = (months: number = 12): { start: Date; end: Date } => {
  const today = new Date();
  const start = subtractMonths(getStartOfMonth(today), months - 1);
  const end = getEndOfMonth(today);
  
  return { start, end };
};

/**
 * Get relative time string (e.g., "2 hours ago", "3 days ago")
 */
export const getRelativeTime = (date: string | Date): string => {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;
  
  return `${Math.floor(diffDays / 365)} year${Math.floor(diffDays / 365) > 1 ? 's' : ''} ago`;
};

/**
 * Check if date is today
 */
export const isToday = (date: string | Date): boolean => {
  const d = new Date(date);
  const today = new Date();
  return d.getFullYear() === today.getFullYear() &&
         d.getMonth() === today.getMonth() &&
         d.getDate() === today.getDate();
};

/**
 * Check if date is this week
 */
export const isThisWeek = (date: string | Date, firstDayOfWeek: number = 0): boolean => {
  const d = new Date(date);
  const today = new Date();
  
  // Get start of week
  const startOfWeek = new Date(today);
  const dayOfWeek = (today.getDay() + (7 - firstDayOfWeek)) % 7;
  startOfWeek.setDate(today.getDate() - dayOfWeek);
  startOfWeek.setHours(0, 0, 0, 0);
  
  // Get end of week
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  
  return d >= startOfWeek && d <= endOfWeek;
};

/**
 * Check if date is this month
 */
export const isThisMonth = (date: string | Date): boolean => {
  const d = new Date(date);
  const today = new Date();
  return d.getFullYear() === today.getFullYear() &&
         d.getMonth() === today.getMonth();
};
