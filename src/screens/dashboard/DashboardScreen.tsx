// src/screens/dashboard/DashboardScreen.tsx
import { useNavigation } from '@react-navigation/native';
import dayjs from 'dayjs';
import React, { useMemo, useState } from 'react';
import {
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { useTheme } from '../../app/providers/ThemeProvider';
import { SafeContainer } from '../../components/layout/SafeContainer';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { SpacerVertical } from '../../components/ui/Spacer';
import { useGetAccountsQuery, useGetBudgetsQuery, useGetCategoriesQuery, useGetTransactionsQuery } from '../../state/api';
import AccountOverview from './components/AccountOverview';
import { BalanceOverview } from './components/BalanceOverview';
import CategoryBreakdown from './components/CategoryBreakdown';
import { CompactQuickActions } from './components/CompactQuickActions';
import { MonthSelector } from './components/MonthSelector';
import RecentTransactions from './components/RecentTransactions';
import TrendChart from './components/TrendChart';


export const DashboardScreen: React.FC = () => {
    const navigation = useNavigation();
    const { theme } = useTheme();
    const [selectedMonth, setSelectedMonth] = useState(dayjs().format('YYYY-MM'));
    const [refreshing, setRefreshing] = useState(false);

    // Calculate date range for selected month
    const startDate = useMemo(() => dayjs(selectedMonth).startOf('month').toISOString(), [selectedMonth]);
    const endDate = useMemo(() => dayjs(selectedMonth).endOf('month').toISOString(), [selectedMonth]);

    // API queries
    const {
        data: transactions = [],
        isLoading: loadingTransactions,
        refetch: refetchTransactions
    } = useGetTransactionsQuery({ start: startDate, end: endDate });

    const {
        data: accounts = [],
        isLoading: loadingAccounts,
        refetch: refetchAccounts
    } = useGetAccountsQuery();

    const {
        data: budgets = [],
        isLoading: loadingBudgets,
        refetch: refetchBudgets
    } = useGetBudgetsQuery({ month: selectedMonth });

    const {
        data: categories = [],
    } = useGetCategoriesQuery();

    const isLoading = loadingTransactions || loadingAccounts || loadingBudgets;

    // Calculate total balance from all active accounts
    const totalBalance = useMemo(() => {
        return accounts
            .filter(account => !account.isArchived)
            .reduce((sum, account) => sum + account.openingBalance, 0);
    }, [accounts]);

    // Calculate KPIs for selected month
    const kpis = useMemo(() => {
        const income = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        const expense = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
        const budgetUsed = expense;
        const budgetPercentage = totalBudget > 0 ? (budgetUsed / totalBudget) * 100 : 0;

        return {
            income,
            expense,
            net: income - expense,
            budgetUsed,
            totalBudget,
            budgetPercentage,
        };
    }, [transactions, budgets]);

    // Get daily breakdown for the selected month
    const chartData = useMemo(() => {
        const selectedMonthObj = dayjs(selectedMonth);
        const daysInMonth = selectedMonthObj.daysInMonth();

        // Group transactions by day
        const dailyData: { [key: string]: { income: number; expense: number } } = {};

        transactions.forEach(transaction => {
            const transactionDate = dayjs(transaction.date);
            const dayKey = transactionDate.format('D');

            if (!dailyData[dayKey]) {
                dailyData[dayKey] = { income: 0, expense: 0 };
            }

            if (transaction.type === 'income') {
                dailyData[dayKey].income += transaction.amount;
            } else if (transaction.type === 'expense') {
                dailyData[dayKey].expense += transaction.amount;
            }
        });

        // Create array for each day of the month
        return Array.from({ length: Math.min(daysInMonth, 30) }, (_, i) => {
            const day = i + 1;
            const dayKey = day.toString();
            const data = dailyData[dayKey] || { income: 0, expense: 0 };

            return {
                month: day.toString(),
                fullMonth: selectedMonthObj.date(day).format('YYYY-MM-DD'),
                income: data.income,
                expense: data.expense,
            };
        });
    }, [transactions, selectedMonth]);

    // Category breakdown separated by income and expense
    const categoryData = useMemo(() => {
        const incomeCategories = transactions
            .filter(t => t.type === 'income' && t.categoryId)
            .reduce((acc, t) => {
                const categoryId = t.categoryId!;
                acc[categoryId] = (acc[categoryId] || 0) + t.amount;
                return acc;
            }, {} as Record<string, number>);

        const expenseCategories = transactions
            .filter(t => t.type === 'expense' && t.categoryId)
            .reduce((acc, t) => {
                const categoryId = t.categoryId!;
                acc[categoryId] = (acc[categoryId] || 0) + t.amount;
                return acc;
            }, {} as Record<string, number>);

        const income = Object.entries(incomeCategories)
            .map(([categoryId, amount]) => ({ categoryId, amount, type: 'income' as const }))
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 3);

        const expense = Object.entries(expenseCategories)
            .map(([categoryId, amount]) => ({ categoryId, amount, type: 'expense' as const }))
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 3);

        return { income, expense };
    }, [transactions]);


    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            await Promise.all([
                refetchTransactions(),
                refetchAccounts(),
                refetchBudgets(),
            ]);
        } finally {
            setRefreshing(false);
        }
    };

    const handleQuickAction = (action: string) => {
        switch (action) {
            case 'add-income':
                navigation.navigate('Add', { type: 'income' });
                break;
            case 'add-expense':
                navigation.navigate('Add', { type: 'expense' });
                break;
            case 'transfer':
                navigation.navigate('Add', { type: 'transfer' });
                break;
            case 'view-budget':
                navigation.navigate('ModalStack', { screen: 'Budget' });
                break;
            default:
                break;
        }
    };

    if (isLoading && transactions.length === 0) {
        return (
            <SafeContainer>
                <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
                    <LoadingSpinner size="large" />
                    <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
                        Loading dashboard...
                    </Text>
                </View>
            </SafeContainer>
        );
    }

    return (
        <SafeContainer>
            <ScrollView
                style={[styles.container, { backgroundColor: theme.colors.background }]}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={[theme.colors.primary[500]]}
                        tintColor={theme.colors.primary[500]}
                    />
                }
            >
                {/* Month Selector */}
                <MonthSelector
                    selectedMonth={selectedMonth}
                    onMonthChange={setSelectedMonth}
                />

                {/* Balance Overview - 2x2 Grid: Total, Net, Income, Expense */}
                <BalanceOverview
                    totalBalance={totalBalance}
                    net={kpis.net}
                    income={kpis.income}
                    expense={kpis.expense}
                    onIncomePress={() => navigation.navigate('Transactions', { filter: { type: 'income' } })}
                    onExpensePress={() => navigation.navigate('Transactions', { filter: { type: 'expense' } })}
                />

                {/* Compact Quick Actions - 4 Actions in One Row */}
                <CompactQuickActions onAction={handleQuickAction} />

                {/* Mini Charts */}
                {transactions.length > 0 ? (
                    <>
                        {/* Income vs Expense Trend */}
                        <TrendChart trendData={chartData} />

                        {/* Account Overview & Category Breakdown Row */}
                        <View style={styles.row}>
                            <AccountOverview accounts={accounts} />
                            <CategoryBreakdown categoryData={categoryData} categories={categories} />
                        </View>
                    </>

                ) : (
                    <Card style={styles.emptyCard}>
                        <EmptyState
                            title="No transactions yet"
                            description="Start by adding your first income or expense"
                            actionLabel="Add Transaction"
                            onActionPress={() => navigation.navigate('Add', {})}
                        />
                    </Card>
                )}

                {/* Recent Transactions Preview */}
                <RecentTransactions
                    transactions={transactions}
                    categories={categories}
                    accounts={accounts}
                    onSeeAll={() => navigation.navigate('Transactions', {})}
                    maxItems={3}
                />

                {/* Bottom spacing */}
                <SpacerVertical.XXL />
            </ScrollView>
        </SafeContainer>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginHorizontal: 4,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 14,
    },
    emptyCard: {
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8,
        marginBottom: 12,
    },
});
