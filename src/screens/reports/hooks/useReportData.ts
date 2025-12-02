import dayjs from 'dayjs';
import { useMemo } from 'react';
import { useTheme } from '../../../app/providers/ThemeProvider';
import { Transaction, Category, Budget } from '../../../types/global';
import { CustomPeriodState } from '../components/CustomComparison';
import { ReportPeriod } from '../components/PeriodSelector';

interface UseReportDataProps {
    periodTransactions: Transaction[];
    categories: Category[];
    dateRange: {
        start: dayjs.Dayjs;
        end: dayjs.Dayjs;
        label: string;
    };
    selectedPeriod: ReportPeriod;
    customPeriod: CustomPeriodState;
    transactions: Transaction[];
    budgets?: Budget[];
}

export interface ReportData {
    totals: {
        income: number;
        expense: number;
        net: number;
    };
    transactionCounts: {
        income: number;
        expense: number;
        total: number;
    };
    incomeCategoryData: Array<{
        category: Category;
        amount: number;
        type: 'income';
    }>;
    expenseCategoryData: Array<{
        category: Category;
        amount: number;
        type: 'expense';
    }>;
    trendData: Array<{
        date: string;
        income: number;
        expense: number;
        net: number;
    }>;
    incomePieData: Array<{
        label: string;
        value: number;
        color: string;
    }>;
    expensePieData: Array<{
        label: string;
        value: number;
        color: string;
    }>;
    topExpenseBarData: Array<{
        label: string;
        value: number;
        color: string;
        icon: string;
        percentage: number;
    }>;
    budgetProgressData: Array<{
        categoryName: string;
        categoryIcon: string;
        categoryColor: string;
        budgetAmount: number;
        spentAmount: number;
        remaining: number;
        percentage: number;
        isOverBudget: boolean;
    }>;
    keyMetrics: {
        avgDailySpending: number;
        savingsRate: number;
        topCategory: { name: string; amount: number; icon: string; color: string };
        transactionFrequency: number;
        spendingTrend: 'up' | 'down' | 'stable';
        trendPercentage: number;
        totalTransactions: number;
        avgTransactionSize: number;
    };
    categoryTrendData: Array<{
        period: string;
        categories: Array<{
            name: string;
            value: number;
            color: string;
            icon: string;
        }>;
        total: number;
    }>;
    heatmapData: Array<{
        date: string;
        amount: number;
        transactionCount: number;
    }>;
}

export const useReportData = ({
    periodTransactions,
    categories,
    dateRange,
    selectedPeriod,
    customPeriod,
    transactions,
    budgets = [],
}: UseReportDataProps): ReportData => {
    const { theme } = useTheme();

    return useMemo(() => {
        const incomeTransactions = periodTransactions.filter(t => t.type === 'income');
        const expenseTransactions = periodTransactions.filter(t => t.type === 'expense');

        const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
        const totalExpense = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
        const netAmount = totalIncome - totalExpense;

        // Category breakdown
        const incomeCategoryData = categories
            .map(category => {
                const categoryTransactions = incomeTransactions.filter(t => t.categoryId === category.id);
                const amount = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);
                return { category, amount, type: 'income' as const };
            })
            .filter(item => item.amount > 0)
            .sort((a, b) => b.amount - a.amount);

        const expenseCategoryData = categories
            .map(category => {
                const categoryTransactions = expenseTransactions.filter(t => t.categoryId === category.id);
                const amount = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);
                return { category, amount, type: 'expense' as const };
            })
            .filter(item => item.amount > 0)
            .sort((a, b) => b.amount - a.amount);

        // Trend data
        let trendData: { date: string; income: number; expense: number; net: number }[] = [];

        if (selectedPeriod === 'custom' && customPeriod.items.length > 0) {
            trendData = customPeriod.items.map(item => {
                const itemTransactions = transactions.filter(t => {
                    const transactionDate = dayjs(t.date);
                    return transactionDate.isAfter(item.start.subtract(1, 'day')) &&
                        transactionDate.isBefore(item.end.add(1, 'day'));
                });

                const itemIncome = itemTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
                const itemExpense = itemTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

                return {
                    date: item.label,
                    income: itemIncome,
                    expense: itemExpense,
                    net: itemIncome - itemExpense
                };
            });
        } else {
            let currentDay = dateRange.start.clone();

            while (currentDay.isBefore(dateRange.end.add(1, 'day'))) {
                let endDay: dayjs.Dayjs;
                let label: string;

                if (selectedPeriod === 'daily') {
                    endDay = currentDay;
                    label = currentDay.format('MMM D');
                } else if (selectedPeriod === 'monthly') {
                    endDay = currentDay.add(6, 'day').isAfter(dateRange.end) ? dateRange.end : currentDay.add(6, 'day');
                    label = currentDay.format('MMM D');
                } else {
                    endDay = currentDay.add(29, 'day').isAfter(dateRange.end) ? dateRange.end : currentDay.add(29, 'day');
                    label = currentDay.format('MMM');
                }

                const dayTransactions = periodTransactions.filter(t => {
                    const transactionDate = dayjs(t.date);
                    return transactionDate.isAfter(currentDay.subtract(1, 'day')) &&
                        transactionDate.isBefore(endDay.add(1, 'day'));
                });

                const dayIncome = dayTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
                const dayExpense = dayTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

                trendData.push({
                    date: label,
                    income: dayIncome,
                    expense: dayExpense,
                    net: dayIncome - dayExpense
                });

                if (selectedPeriod === 'daily') {
                    currentDay = currentDay.add(1, 'day');
                } else if (selectedPeriod === 'monthly') {
                    currentDay = currentDay.add(7, 'day');
                } else {
                    currentDay = currentDay.add(30, 'day');
                }
            }
        }

        // Pie chart data
        const incomeChartColors = [theme.colors.income.main, '#059669', '#047857', '#065F46', '#064E3B'];
        const expenseChartColors = [theme.colors.expense.main, '#DC2626', '#B91C1C', '#991B1B', '#7F1D1D'];

        const incomePieData = incomeCategoryData.slice(0, 5).map((item, index) => ({
            label: item.category.name,
            value: item.amount,
            color: incomeChartColors[index] || theme.colors.income.main
        }));

        const expensePieData = expenseCategoryData.slice(0, 5).map((item, index) => ({
            label: item.category.name,
            value: item.amount,
            color: expenseChartColors[index] || theme.colors.expense.main
        }));

        // Top expense bar chart data
        const topExpenseBarData = expenseCategoryData.slice(0, 10).map(item => ({
            label: item.category.name,
            value: item.amount,
            color: item.category.color || theme.colors.expense.main,
            icon: item.category.icon || 'pricetag-outline',
            percentage: (item.amount / totalExpense) * 100
        }));

        // Budget progress data
        const budgetProgressData = budgets.map(budget => {
            const category = categories.find(c => c.id === budget.categoryId);
            const spentAmount = expenseTransactions
                .filter(t => t.categoryId === budget.categoryId)
                .reduce((sum, t) => sum + t.amount, 0);
            const remaining = budget.amount - spentAmount;
            const percentage = budget.amount > 0 ? (spentAmount / budget.amount) * 100 : 0;

            return {
                categoryName: category?.name || 'Unknown',
                categoryIcon: category?.icon || 'pricetag-outline',
                categoryColor: category?.color || theme.colors.primary[500],
                budgetAmount: budget.amount,
                spentAmount,
                remaining,
                percentage,
                isOverBudget: spentAmount > budget.amount,
            };
        }).filter(b => b.budgetAmount > 0);

        // Key metrics
        const dayCount = dateRange.end.diff(dateRange.start, 'day') + 1;
        const avgDailySpending = dayCount > 0 ? totalExpense / dayCount : 0;
        const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;

        const topExpenseCategory = expenseCategoryData[0];
        const topCategory = topExpenseCategory ? {
            name: topExpenseCategory.category.name,
            amount: topExpenseCategory.amount,
            icon: topExpenseCategory.category.icon || 'pricetag-outline',
            color: topExpenseCategory.category.color || theme.colors.expense.main,
        } : {
            name: 'No expenses',
            amount: 0,
            icon: 'pricetag-outline',
            color: theme.colors.expense.main,
        };

        const transactionFrequency = dayCount > 0 ? periodTransactions.length / dayCount : 0;
        const avgTransactionSize = periodTransactions.length > 0 ? (totalIncome + totalExpense) / periodTransactions.length : 0;

        // Calculate spending trend (compare first half vs second half)
        const midPoint = dateRange.start.add(dayCount / 2, 'day');
        const firstHalfExpense = expenseTransactions
            .filter(t => dayjs(t.date).isBefore(midPoint))
            .reduce((sum, t) => sum + t.amount, 0);
        const secondHalfExpense = expenseTransactions
            .filter(t => dayjs(t.date).isAfter(midPoint) || dayjs(t.date).isSame(midPoint))
            .reduce((sum, t) => sum + t.amount, 0);

        let spendingTrend: 'up' | 'down' | 'stable' = 'stable';
        let trendPercentage = 0;

        if (firstHalfExpense > 0) {
            const change = ((secondHalfExpense - firstHalfExpense) / firstHalfExpense) * 100;
            trendPercentage = Math.abs(change);
            if (change > 5) spendingTrend = 'up';
            else if (change < -5) spendingTrend = 'down';
        }

        // Category trend data (weekly or monthly breakdown)
        const categoryTrendData: Array<{
            period: string;
            categories: Array<{ name: string; value: number; color: string; icon: string }>;
            total: number;
        }> = [];

        if (selectedPeriod === 'yearly') {
            // Show monthly breakdown for yearly view
            for (let i = 0; i < 12; i++) {
                const monthStart = dateRange.start.month(i).startOf('month');
                const monthEnd = monthStart.endOf('month');

                const monthTransactions = periodTransactions.filter(t => {
                    const td = dayjs(t.date);
                    return td.isAfter(monthStart.subtract(1, 'day')) && td.isBefore(monthEnd.add(1, 'day'));
                });

                const monthCategories = expenseCategoryData
                    .slice(0, 5)
                    .map(item => {
                        const catTransactions = monthTransactions.filter(t =>
                            t.type === 'expense' && t.categoryId === item.category.id
                        );
                        return {
                            name: item.category.name,
                            value: catTransactions.reduce((sum, t) => sum + t.amount, 0),
                            color: item.category.color || theme.colors.expense.main,
                            icon: item.category.icon || 'pricetag-outline',
                        };
                    })
                    .filter(c => c.value > 0);

                if (monthCategories.length > 0) {
                    categoryTrendData.push({
                        period: monthStart.format('MMM'),
                        categories: monthCategories,
                        total: monthCategories.reduce((sum, c) => sum + c.value, 0),
                    });
                }
            }
        } else if (selectedPeriod === 'monthly') {
            // Show weekly breakdown for monthly view
            let weekStart = dateRange.start.clone();
            let weekNum = 1;

            while (weekStart.isBefore(dateRange.end)) {
                const weekEnd = weekStart.add(6, 'day').isAfter(dateRange.end) ? dateRange.end : weekStart.add(6, 'day');

                const weekTransactions = periodTransactions.filter(t => {
                    const td = dayjs(t.date);
                    return td.isAfter(weekStart.subtract(1, 'day')) && td.isBefore(weekEnd.add(1, 'day'));
                });

                const weekCategories = expenseCategoryData
                    .slice(0, 5)
                    .map(item => {
                        const catTransactions = weekTransactions.filter(t =>
                            t.type === 'expense' && t.categoryId === item.category.id
                        );
                        return {
                            name: item.category.name,
                            value: catTransactions.reduce((sum, t) => sum + t.amount, 0),
                            color: item.category.color || theme.colors.expense.main,
                            icon: item.category.icon || 'pricetag-outline',
                        };
                    })
                    .filter(c => c.value > 0);

                if (weekCategories.length > 0) {
                    categoryTrendData.push({
                        period: `W${weekNum}`,
                        categories: weekCategories,
                        total: weekCategories.reduce((sum, c) => sum + c.value, 0),
                    });
                }

                weekStart = weekStart.add(7, 'day');
                weekNum++;
            }
        }

        // Heatmap data (daily spending)
        const heatmapData: Array<{ date: string; amount: number; transactionCount: number }> = [];
        let currentDay = dateRange.start.clone();

        while (currentDay.isBefore(dateRange.end.add(1, 'day'))) {
            const dateStr = currentDay.format('YYYY-MM-DD');
            const dayTransactions = expenseTransactions.filter(t =>
                dayjs(t.date).format('YYYY-MM-DD') === dateStr
            );

            heatmapData.push({
                date: dateStr,
                amount: dayTransactions.reduce((sum, t) => sum + t.amount, 0),
                transactionCount: dayTransactions.length,
            });

            currentDay = currentDay.add(1, 'day');
        }

        return {
            totals: { income: totalIncome, expense: totalExpense, net: netAmount },
            transactionCounts: {
                income: incomeTransactions.length,
                expense: expenseTransactions.length,
                total: periodTransactions.length
            },
            incomeCategoryData,
            expenseCategoryData,
            trendData,
            incomePieData,
            expensePieData,
            topExpenseBarData,
            budgetProgressData,
            keyMetrics: {
                avgDailySpending,
                savingsRate,
                topCategory,
                transactionFrequency,
                spendingTrend,
                trendPercentage,
                totalTransactions: periodTransactions.length,
                avgTransactionSize,
            },
            categoryTrendData,
            heatmapData,
        };
    }, [periodTransactions, categories, dateRange.start.valueOf(), dateRange.end.valueOf(), selectedPeriod, customPeriod, transactions, budgets, theme]);
};