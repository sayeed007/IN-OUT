// src/screens/dashboard/DashboardScreen.tsx
import { useNavigation } from '@react-navigation/native';
import dayjs from 'dayjs';
import React, { useMemo, useState } from 'react';
import {
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useTheme } from '../../app/providers/ThemeProvider';
import { SafeContainer } from '../../components/layout/SafeContainer';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useGetAccountsQuery, useGetBudgetsQuery, useGetCategoriesQuery, useGetTransactionsQuery } from '../../state/api';
import { KPICards } from './components/KPICards';
import MiniCharts from './components/MiniCharts';
import { MonthSelector } from './components/MonthSelector';
import QuickActions from './components/QuickActions';
import BottomSpacing from '../../components/ui/BottomSpacing';


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

    // Helper function to get meaningful transaction description
    const getTransactionDescription = (transaction: any) => {
        if (transaction.note) {
            return transaction.note;
        }

        if (transaction.categoryId) {
            const category = categories.find(cat => cat.id === transaction.categoryId);
            if (category) {
                return category.name;
            }
        }

        if (transaction.type === 'transfer') {
            const fromAccount = accounts.find(acc => acc.id === transaction.accountId);
            const toAccount = accounts.find(acc => acc.id === transaction.accountIdTo);
            if (fromAccount && toAccount) {
                return `Transfer: ${fromAccount.name} → ${toAccount.name}`;
            }
        }

        return `${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}`;
    };

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
                navigation.navigate('Budget');
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

    console.log(transactions);


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
                {/* Header */}
                <View style={styles.header}>
                    <Text style={[styles.title, { color: theme.colors.text }]}>
                        Dashboard
                    </Text>
                    <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                        Financial Overview
                    </Text>
                </View>

                {/* Month Selector */}
                <MonthSelector
                    selectedMonth={selectedMonth}
                    onMonthChange={setSelectedMonth}
                />

                {/* KPI Cards */}
                <KPICards
                    income={kpis.income}
                    expense={kpis.expense}
                    net={kpis.net}
                    budgetUsed={kpis.budgetUsed}
                    totalBudget={kpis.totalBudget}
                    budgetPercentage={kpis.budgetPercentage}
                />

                {/* Quick Actions */}
                <QuickActions onAction={handleQuickAction} />

                {/* Mini Charts */}
                {transactions.length > 0 ? (
                    <MiniCharts
                        trendData={chartData}
                        categoryData={categoryData}
                        accounts={accounts}
                        categories={categories}
                    />
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
                {transactions.length > 0 && (
                    <Card style={styles.recentTransactionsCard}>
                        <View style={styles.sectionHeader}>
                            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                                Recent Transactions
                            </Text>
                            <TouchableOpacity
                                onPress={() => navigation.navigate('Transactions', {})}
                                activeOpacity={0.7}
                            >
                                <Text style={[styles.seeAllText, { color: theme.colors.primary[500] }]}>
                                    See All
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {transactions.slice(0, 3).map((transaction) => (
                            <View key={transaction.id} style={styles.transactionItem}>
                                <View style={styles.transactionInfo}>
                                    <Text style={[styles.transactionNote, { color: theme.colors.text }]}>
                                        {getTransactionDescription(transaction)}
                                    </Text>
                                    <Text style={[styles.transactionDate, { color: theme.colors.textSecondary }]}>
                                        {dayjs(transaction.date).format('MMM D')}
                                    </Text>
                                </View>
                                <Text style={[
                                    styles.transactionAmount,
                                    {
                                        color: transaction.type === 'income'
                                            ? theme.colors.success[500]
                                            : transaction.type === 'expense'
                                                ? theme.colors.error[500]
                                                : theme.colors.text
                                    }
                                ]}>
                                    {transaction.type === 'income' ? '+' : transaction.type === 'expense' ? '-' : ''}
                                    ${transaction.amount.toFixed(2)}
                                </Text>
                            </View>
                        ))}
                    </Card>
                )}

                {/* Bottom spacing for tab bar */}
                <BottomSpacing />
            </ScrollView>
        </SafeContainer>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
    },
    header: {
        paddingHorizontal: 10,
        paddingBottom: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 16,
    },
    emptyCard: {
        marginVertical: 8,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    recentTransactionsCard: {
        marginVertical: 8,
    },
    seeAllText: {
        fontSize: 14,
        fontWeight: '500',
    },
    transactionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#E5E5E5',
    },
    transactionInfo: {
        flex: 1,
    },
    transactionNote: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 2,
    },
    transactionDate: {
        fontSize: 14,
    },
    transactionAmount: {
        fontSize: 16,
        fontWeight: '600',
    },
});