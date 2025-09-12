import dayjs from 'dayjs';
import { useMemo } from 'react';
import { useTheme } from '../../../app/providers/ThemeProvider';
import { Transaction, Category } from '../../../types/global';
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
}

export const useReportData = ({
    periodTransactions,
    categories,
    dateRange,
    selectedPeriod,
    customPeriod,
    transactions,
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
        };
    }, [periodTransactions, categories, dateRange.start.valueOf(), dateRange.end.valueOf(), selectedPeriod, customPeriod, transactions, theme]);
};