// src/utils/helpers/budgetMigration.ts

import type { Budget } from '../../types/global';

/**
 * Migrate legacy budget from YYYY-MM format to YYYY-MM-DD format
 * @param budget - Budget with legacy 'month' field
 * @param periodStartDay - User's configured period start day (1-28)
 * @returns Migrated budget with periodId and periodStartDay fields
 */
export const migrateLegacyBudget = (
  budget: Budget,
  periodStartDay: number
): Budget => {
  // If already migrated (has periodId), return as-is
  if (budget.periodId && !budget.month) {
    return budget;
  }

  // If has legacy month field, convert it
  if (budget.month) {
    const [year, month] = budget.month.split('-');
    const day = periodStartDay.toString().padStart(2, '0');
    const periodId = `${year}-${month}-${day}`;

    return {
      ...budget,
      periodId,
      periodStartDay,
      // Keep month field for now for backward compatibility
      month: budget.month,
    };
  }

  // Should not reach here, but handle it gracefully
  return budget;
};

/**
 * Check if a budget needs migration
 * @param budget - Budget to check
 * @returns True if budget needs migration
 */
export const needsMigration = (budget: Budget): boolean => {
  // Needs migration if it has 'month' but no 'periodId' or 'periodStartDay'
  return !!budget.month && (!budget.periodId || !budget.periodStartDay);
};

/**
 * Migrate an array of budgets
 * @param budgets - Array of budgets to migrate
 * @param periodStartDay - User's configured period start day (1-28)
 * @returns Array of migrated budgets
 */
export const migrateBudgets = (
  budgets: Budget[],
  periodStartDay: number
): Budget[] => {
  return budgets.map(budget => migrateLegacyBudget(budget, periodStartDay));
};

/**
 * Get period ID from budget (handles both new and legacy formats)
 * @param budget - Budget in either format
 * @param fallbackPeriodStartDay - Fallback period start day if not stored in budget
 * @returns Period ID in YYYY-MM-DD format
 */
export const getBudgetPeriodId = (
  budget: Budget,
  fallbackPeriodStartDay: number = 1
): string => {
  // If budget has periodId, use it
  if (budget.periodId) {
    return budget.periodId;
  }

  // Otherwise, construct from legacy month field
  if (budget.month) {
    const [year, month] = budget.month.split('-');
    const day = (budget.periodStartDay || fallbackPeriodStartDay).toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Should not reach here
  throw new Error('Budget has neither periodId nor month field');
};
