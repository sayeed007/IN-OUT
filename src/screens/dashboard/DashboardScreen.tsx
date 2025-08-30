// src/screens/dashboard/DashboardScreen.tsx
import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    RefreshControl,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { SafeContainer } from '../../components/layout/SafeContainer';
import { Card } from '../../components/ui/Card';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { useGetTransactionsQuery, useGetAccountsQuery, useGetBudgetsQuery } from '../../state/api';
import { KPICards } from './components/KPICards';
import { MonthSelector } from './components/MonthSelector';
import { MiniCharts } from './components/MiniCharts';
import { QuickActions } from './components/QuickActions';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../app/providers/ThemeProvider';
import dayjs from 'dayjs';

const { width } = Dimensions.get('window');

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

    // Get last 12 months data for mini charts
    const chartData = useMemo(() => {
        const last12Months = Array.from({ length: 12 }, (_, i) => {
            const month = dayjs().subtract(11 - i, 'months');
            return {
                month: month.format('MMM'),
                fullMonth: month.format('YYYY-MM'),
                income: 0,
                expense: 0,
            };
        });

        // This would need actual data from the last 12 months
        // For now, we'll use current month data for the selected month
        const currentMonthIndex = last12Months.findIndex(
            m => m.fullMonth === selectedMonth
        );

        if (currentMonthIndex >= 0) {
            last12Months[currentMonthIndex] = {
                ...last12Months[currentMonthIndex],
                income: kpis.income,
                expense: kpis.expense,
            };
        }

        return last12Months;
    }, [kpis, selectedMonth]);

    // Category breakdown for pie chart
    const categoryData = useMemo(() => {
        const categoryTotals = transactions
            .filter(t => t.type === 'expense' && t.categoryId)
            .reduce((acc, t) => {
                const categoryId = t.categoryId!;
                acc[categoryId] = (acc[categoryId] || 0) + t.amount;
                return acc;
            }, {} as Record<string, number>);

        return Object.entries(categoryTotals)
            .map(([categoryId, amount]) => ({ categoryId, amount }))
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 6); // Top 6 categories
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
                navigation.navigate('AddTransaction', { type: 'income' });
                break;
            case 'add-expense':
                navigation.navigate('AddTransaction', { type: 'expense' });
                break;
            case 'transfer':
                navigation.navigate('AddTransaction', { type: 'transfer' });
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

    return (
        <SafeContainer>
            <ScrollView
                style={[styles.container, { backgroundColor: theme.colors.background }]}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={[theme.colors.primary]}
                        tintColor={theme.colors.primary}
                    />
                }
            >
                {/* Header */}
                <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
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
                    />
                ) : (
                    <Card style={styles.emptyCard}>
                        <EmptyState
                            title="No transactions yet"
                            message="Start by adding your first income or expense"
                            actionLabel="Add Transaction"
                            onAction={() => navigation.navigate('AddTransaction')}
                        />
                    </Card>
                )}

                {/* Recent Transactions Preview */}
                {transactions.length > 0 && (
                    <Card style={styles.recentCard}>
                        <View style={styles.sectionHeader}>
                            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                                Recent Transactions
                            </Text>
                            <TouchableOpacity
                                onPress={() => navigation.navigate('TransactionList')}
                                activeOpacity={0.7}
                            >
                                <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>
                                    See All
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {transactions.slice(0, 3).map((transaction, index) => (
                            <View key={transaction.id} style={styles.transactionItem}>
                                <View style={styles.transactionInfo}>
                                    <Text style={[styles.transactionNote, { color: theme.colors.text }]}>
                                        {transaction.note || `${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}`}
                                    </Text>
                                    <Text style={[styles.transactionDate, { color: theme.colors.textSecondary }]}>
                                        {dayjs(transaction.date).format('MMM D')}
                                    </Text>
                                </View>
                                <Text style={[
                                    styles.transactionAmount,
                                    {
                                        color: transaction.type === 'income'
                                            ? theme.colors.success
                                            : transaction.type === 'expense'
                                                ? theme.colors.error
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
                <View style={styles.bottomSpacing} />
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
        padding: 20,
        paddingTop: 10,
        paddingBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 16,
    },
    emptyCard: {
        margin: 16,
        marginTop: 8,
    },
    recentCard: {
        margin: 16,
        marginTop: 8,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
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
        fontSize: 16,
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
    bottomSpacing: {
        height: 100, // Space for tab bar
    },
});