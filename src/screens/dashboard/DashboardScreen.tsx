// src/screens/dashboard/DashboardScreen.tsx
import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeContainer } from '../../components/layout/SafeContainer';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Chip } from '../../components/ui/Chip';
import { useGetTransactionsQuery, useGetAccountsQuery, useGetCategoriesQuery } from '../../state/api';
import { calculateMonthlyTotals, formatCurrency, getCategoryBreakdown } from '../../features/transactions/utils/transactionUtils';
import { Spacing } from '../../theme';

export const DashboardScreen: React.FC = () => {
    const navigation = useNavigation();
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const now = new Date();
        return { year: now.getFullYear(), month: now.getMonth() + 1 };
    });
    const [refreshing, setRefreshing] = useState(false);

    // Data queries
    const { data: transactions = [], refetch: refetchTransactions } = useGetTransactionsQuery();
    const { data: accounts = [] } = useGetAccountsQuery();
    const { data: categories = [] } = useGetCategoriesQuery();

    // Calculate monthly totals
    const monthlyTotals = useMemo(() => {
        return calculateMonthlyTotals(transactions, selectedMonth.year, selectedMonth.month);
    }, [transactions, selectedMonth]);

    // Calculate account balances
    const accountBalances = useMemo(() => {
        return accounts.map(account => {
            const accountTransactions = transactions.filter(t =>
                t.accountId === account.id || t.accountIdTo === account.id
            );

            let balance = account.openingBalance;
            accountTransactions.forEach(transaction => {
                if (transaction.accountId === account.id) {
                    if (transaction.type === 'income') balance += transaction.amount;
                    else if (transaction.type === 'expense') balance -= transaction.amount;
                    else if (transaction.type === 'transfer') balance -= transaction.amount;
                }
                if (transaction.type === 'transfer' && transaction.accountIdTo === account.id) {
                    balance += transaction.amount;
                }
            });

            return {
                ...account,
                currentBalance: balance,
            };
        });
    }, [accounts, transactions]);

    // Get category breakdown
    const categoryBreakdown = useMemo(() => {
        const startDate = new Date(selectedMonth.year, selectedMonth.month - 1, 1).toISOString().split('T')[0];
        const endDate = new Date(selectedMonth.year, selectedMonth.month, 0).toISOString().split('T')[0];

        return getCategoryBreakdown(transactions, categories, startDate, endDate);
    }, [transactions, categories, selectedMonth]);

    // Handle refresh
    const handleRefresh = async () => {
        setRefreshing(true);
        await refetchTransactions();
        setRefreshing(false);
    };

    // Handle month change
    const handleMonthChange = (direction: 'prev' | 'next') => {
        setSelectedMonth(prev => {
            let newMonth = prev.month + (direction === 'next' ? 1 : -1);
            let newYear = prev.year;

            if (newMonth > 12) {
                newMonth = 1;
                newYear++;
            } else if (newMonth < 1) {
                newMonth = 12;
                newYear--;
            }

            return { year: newYear, month: newMonth };
        });
    };

    // Get month name
    const getMonthName = (month: number) => {
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        return months[month - 1];
    };

    // Quick action buttons
    const quickActions = [
        {
            title: 'Add Expense',
            icon: 'remove-circle',
            color: '#EF4444',
            onPress: () => navigation.navigate('AddTransaction' as never),
        },
        {
            title: 'Add Income',
            icon: 'add-circle',
            color: '#10B981',
            onPress: () => navigation.navigate('AddTransaction' as never),
        },
        {
            title: 'View Reports',
            icon: 'bar-chart',
            color: '#6366F1',
            onPress: () => navigation.navigate('Reports' as never),
        },
        {
            title: 'Manage Accounts',
            icon: 'wallet',
            color: '#F59E0B',
            onPress: () => navigation.navigate('Settings' as never),
        },
    ];

    return (
        <SafeContainer>
            <ScrollView
                style={styles.container}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                }
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Dashboard</Text>
                    <Text style={styles.subtitle}>Your financial overview</Text>
                </View>

                {/* Month Selector */}
                <Card style={styles.monthSelector}>
                    <View style={styles.monthSelectorContent}>
                        <TouchableOpacity
                            style={styles.monthButton}
                            onPress={() => handleMonthChange('prev')}
                        >
                            <Text style={styles.monthButtonText}>‹</Text>
                        </TouchableOpacity>

                        <Text style={styles.monthText}>
                            {getMonthName(selectedMonth.month)} {selectedMonth.year}
                        </Text>

                        <TouchableOpacity
                            style={styles.monthButton}
                            onPress={() => handleMonthChange('next')}
                        >
                            <Text style={styles.monthButtonText}>›</Text>
                        </TouchableOpacity>
                    </View>
                </Card>

                {/* KPI Cards */}
                <View style={styles.kpiContainer}>
                    <Card style={[styles.kpiCard, styles.incomeCard]}>
                        <View style={styles.kpiHeader}>
                            <Text style={styles.kpiLabel}>Income</Text>
                            <Text style={styles.kpiIcon}>📈</Text>
                        </View>
                        <Text style={styles.kpiAmount}>{formatCurrency(monthlyTotals.income)}</Text>
                        <Text style={styles.kpiSubtext}>This month</Text>
                    </Card>

                    <Card style={[styles.kpiCard, styles.expenseCard]}>
                        <View style={styles.kpiHeader}>
                            <Text style={styles.kpiLabel}>Expenses</Text>
                            <Text style={styles.kpiIcon}>📉</Text>
                        </View>
                        <Text style={styles.kpiAmount}>{formatCurrency(monthlyTotals.expense)}</Text>
                        <Text style={styles.kpiSubtext}>This month</Text>
                    </Card>

                    <Card style={[styles.kpiCard, styles.netCard]}>
                        <View style={styles.kpiHeader}>
                            <Text style={styles.kpiLabel}>Net</Text>
                            <Text style={styles.kpiIcon}>💰</Text>
                        </View>
                        <Text style={[
                            styles.kpiAmount,
                            { color: monthlyTotals.net >= 0 ? '#10B981' : '#EF4444' }
                        ]}>
                            {formatCurrency(monthlyTotals.net)}
                        </Text>
                        <Text style={styles.kpiSubtext}>This month</Text>
                    </Card>
                </View>

                {/* Quick Actions */}
                <Card style={styles.quickActionsCard}>
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                    <View style={styles.quickActionsGrid}>
                        {quickActions.map((action, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.quickActionButton}
                                onPress={action.onPress}
                            >
                                <View style={[styles.quickActionIcon, { backgroundColor: action.color }]}>
                                    <Text style={styles.quickActionIconText}>{action.icon}</Text>
                                </View>
                                <Text style={styles.quickActionTitle}>{action.title}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </Card>

                {/* Account Balances */}
                <Card style={styles.accountsCard}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Account Balances</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Settings' as never)}>
                            <Text style={styles.seeAllText}>See All</Text>
                        </TouchableOpacity>
                    </View>

                    {accountBalances.slice(0, 3).map((account) => (
                        <View key={account.id} style={styles.accountItem}>
                            <View style={styles.accountInfo}>
                                <Text style={styles.accountName}>{account.name}</Text>
                                <Text style={styles.accountType}>{account.type}</Text>
                            </View>
                            <Text style={[
                                styles.accountBalance,
                                { color: account.currentBalance >= 0 ? '#10B981' : '#EF4444' }
                            ]}>
                                {formatCurrency(account.currentBalance)}
                            </Text>
                        </View>
                    ))}
                </Card>

                {/* Category Breakdown */}
                <Card style={styles.categoriesCard}>
                    <Text style={styles.sectionTitle}>Top Categories</Text>

                    {categoryBreakdown.slice(0, 5).map((item, index) => (
                        <View key={item.category.id} style={styles.categoryItem}>
                            <View style={styles.categoryInfo}>
                                <View style={[styles.categoryColor, { backgroundColor: item.category.color }]} />
                                <Text style={styles.categoryName}>{item.category.name}</Text>
                            </View>
                            <View style={styles.categoryAmount}>
                                <Text style={styles.categoryAmountText}>
                                    {formatCurrency(item.amount)}
                                </Text>
                                <Text style={styles.categoryPercentage}>
                                    {item.percentage.toFixed(1)}%
                                </Text>
                            </View>
                        </View>
                    ))}
                </Card>

                {/* Recent Transactions */}
                <Card style={styles.recentTransactionsCard}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Recent Transactions</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Transactions' as never)}>
                            <Text style={styles.seeAllText}>See All</Text>
                        </TouchableOpacity>
                    </View>

                    {transactions.slice(0, 3).map((transaction) => (
                        <View key={transaction.id} style={styles.transactionItem}>
                            <View style={styles.transactionInfo}>
                                <Text style={styles.transactionNote}>
                                    {transaction.note || 'No note'}
                                </Text>
                                <Text style={styles.transactionDate}>
                                    {new Date(transaction.date).toLocaleDateString()}
                                </Text>
                            </View>
                            <Text style={[
                                styles.transactionAmount,
                                { color: transaction.type === 'income' ? '#10B981' : '#EF4444' }
                            ]}>
                                {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                            </Text>
                        </View>
                    ))}
                </Card>
            </ScrollView>
        </SafeContainer>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.xl,
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        color: '#111827',
        marginBottom: Spacing.xs,
    },
    subtitle: {
        fontSize: 16,
        color: '#6B7280',
    },
    monthSelector: {
        marginHorizontal: Spacing.lg,
        marginBottom: Spacing.lg,
    },
    monthSelectorContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: Spacing.md,
    },
    monthButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    monthButtonText: {
        fontSize: 20,
        fontWeight: '600',
        color: '#374151',
    },
    monthText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
    },
    kpiContainer: {
        flexDirection: 'row',
        paddingHorizontal: Spacing.lg,
        marginBottom: Spacing.lg,
        gap: Spacing.sm,
    },
    kpiCard: {
        flex: 1,
        padding: Spacing.md,
    },
    incomeCard: {
        backgroundColor: '#F0FDF4',
    },
    expenseCard: {
        backgroundColor: '#FEF2F2',
    },
    netCard: {
        backgroundColor: '#F0F9FF',
    },
    kpiHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    kpiLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
    },
    kpiIcon: {
        fontSize: 16,
    },
    kpiAmount: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
        marginBottom: Spacing.xs,
    },
    kpiSubtext: {
        fontSize: 12,
        color: '#6B7280',
    },
    quickActionsCard: {
        marginHorizontal: Spacing.lg,
        marginBottom: Spacing.lg,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
        marginBottom: Spacing.md,
    },
    quickActionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.md,
    },
    quickActionButton: {
        width: '48%',
        alignItems: 'center',
        paddingVertical: Spacing.md,
    },
    quickActionIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.sm,
    },
    quickActionIconText: {
        fontSize: 24,
        color: '#FFFFFF',
    },
    quickActionTitle: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
        textAlign: 'center',
    },
    accountsCard: {
        marginHorizontal: Spacing.lg,
        marginBottom: Spacing.lg,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    seeAllText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#6366F1',
    },
    accountItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: Spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    accountInfo: {
        flex: 1,
    },
    accountName: {
        fontSize: 16,
        fontWeight: '500',
        color: '#111827',
    },
    accountType: {
        fontSize: 14,
        color: '#6B7280',
    },
    accountBalance: {
        fontSize: 16,
        fontWeight: '600',
    },
    categoriesCard: {
        marginHorizontal: Spacing.lg,
        marginBottom: Spacing.lg,
    },
    categoryItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: Spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    categoryInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    categoryColor: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: Spacing.sm,
    },
    categoryName: {
        fontSize: 16,
        fontWeight: '500',
        color: '#111827',
    },
    categoryAmount: {
        alignItems: 'flex-end',
    },
    categoryAmountText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
    },
    categoryPercentage: {
        fontSize: 12,
        color: '#6B7280',
    },
    recentTransactionsCard: {
        marginHorizontal: Spacing.lg,
        marginBottom: Spacing.xl,
    },
    transactionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: Spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    transactionInfo: {
        flex: 1,
    },
    transactionNote: {
        fontSize: 16,
        fontWeight: '500',
        color: '#111827',
    },
    transactionDate: {
        fontSize: 14,
        color: '#6B7280',
    },
    transactionAmount: {
        fontSize: 16,
        fontWeight: '600',
    },
});


