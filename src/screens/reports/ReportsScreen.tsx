// src/screens/reports/ReportsScreen.tsx
import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
} from 'react-native';
import { SafeContainer } from '../../components/layout/SafeContainer';
import { Card } from '../../components/ui/Card';
import { Chip } from '../../components/ui/Chip';
import { useGetTransactionsQuery, useGetCategoriesQuery } from '../../state/api';
import {
    calculateMonthlyTotals,
    formatCurrency,
    getCategoryBreakdown,
    calculateDailyTotals,
} from '../../features/transactions/utils/transactionUtils';
import { Spacing } from '../../theme';

type ReportPeriod = 'month' | 'quarter' | 'year';

export const ReportsScreen: React.FC = () => {
    const [selectedPeriod, setSelectedPeriod] = useState<ReportPeriod>('month');
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [refreshing, setRefreshing] = useState(false);

    // Data queries
    const { data: transactions = [], refetch: refetchTransactions } = useGetTransactionsQuery();
    const { data: categories = [] } = useGetCategoriesQuery();

    // Calculate report data based on selected period
    const reportData = useMemo(() => {
        const startDate = new Date(selectedYear, selectedMonth - 1, 1).toISOString().split('T')[0];
        const endDate = new Date(selectedYear, selectedMonth, 0).toISOString().split('T')[0];

        const periodTransactions = transactions.filter(transaction => {
            const transactionDate = transaction.date.split('T')[0];
            return transactionDate >= startDate && transactionDate <= endDate;
        });

        const totals = calculateMonthlyTotals(transactions, selectedYear, selectedMonth);
        const categoryBreakdown = getCategoryBreakdown(transactions, categories, startDate, endDate);
        const dailyTotals = calculateDailyTotals(periodTransactions);

        return {
            totals,
            categoryBreakdown,
            dailyTotals,
            transactionCount: periodTransactions.length,
        };
    }, [transactions, categories, selectedYear, selectedMonth]);

    // Handle refresh
    const handleRefresh = async () => {
        setRefreshing(true);
        await refetchTransactions();
        setRefreshing(false);
    };

    // Handle period change
    const handlePeriodChange = (period: ReportPeriod) => {
        setSelectedPeriod(period);
    };

    // Handle month change
    const handleMonthChange = (direction: 'prev' | 'next') => {
        setSelectedMonth(prev => {
            let newMonth = prev + (direction === 'next' ? 1 : -1);
            let newYear = selectedYear;

            if (newMonth > 12) {
                newMonth = 1;
                newYear++;
            } else if (newMonth < 1) {
                newMonth = 12;
                newYear--;
            }

            setSelectedYear(newYear);
            return newMonth;
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

    // Period options
    const periodOptions = [
        { value: 'month' as const, label: 'Monthly' },
        { value: 'quarter' as const, label: 'Quarterly' },
        { value: 'year' as const, label: 'Yearly' },
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
                    <Text style={styles.title}>Reports</Text>
                    <Text style={styles.subtitle}>Financial insights and analytics</Text>
                </View>

                {/* Period Selector */}
                <Card style={styles.periodSelector}>
                    <View style={styles.periodTabs}>
                        {periodOptions.map((option) => (
                            <Chip
                                key={option.value}
                                label={option.label}
                                selected={selectedPeriod === option.value}
                                onPress={() => handlePeriodChange(option.value)}
                                style={styles.periodTab}
                            />
                        ))}
                    </View>
                </Card>

                {/* Date Selector */}
                <Card style={styles.dateSelector}>
                    <View style={styles.dateSelectorContent}>
                        <TouchableOpacity
                            style={styles.dateButton}
                            onPress={() => handleMonthChange('prev')}
                        >
                            <Text style={styles.dateButtonText}>‹</Text>
                        </TouchableOpacity>

                        <Text style={styles.dateText}>
                            {getMonthName(selectedMonth)} {selectedYear}
                        </Text>

                        <TouchableOpacity
                            style={styles.dateButton}
                            onPress={() => handleMonthChange('next')}
                        >
                            <Text style={styles.dateButtonText}>›</Text>
                        </TouchableOpacity>
                    </View>
                </Card>

                {/* Summary Cards */}
                <View style={styles.summaryContainer}>
                    <Card style={[styles.summaryCard, styles.incomeCard]}>
                        <Text style={styles.summaryLabel}>Total Income</Text>
                        <Text style={styles.summaryAmount}>{formatCurrency(reportData.totals.income)}</Text>
                        <Text style={styles.summarySubtext}>
                            {reportData.transactionCount} transactions
                        </Text>
                    </Card>

                    <Card style={[styles.summaryCard, styles.expenseCard]}>
                        <Text style={styles.summaryLabel}>Total Expenses</Text>
                        <Text style={styles.summaryAmount}>{formatCurrency(reportData.totals.expense)}</Text>
                        <Text style={styles.summarySubtext}>
                            {reportData.transactionCount} transactions
                        </Text>
                    </Card>

                    <Card style={[styles.summaryCard, styles.netCard]}>
                        <Text style={styles.summaryLabel}>Net Amount</Text>
                        <Text style={[
                            styles.summaryAmount,
                            { color: reportData.totals.net >= 0 ? '#10B981' : '#EF4444' }
                        ]}>
                            {formatCurrency(reportData.totals.net)}
                        </Text>
                        <Text style={styles.summarySubtext}>
                            {reportData.totals.net >= 0 ? 'Positive' : 'Negative'}
                        </Text>
                    </Card>
                </View>

                {/* Category Breakdown */}
                <Card style={styles.categoryCard}>
                    <Text style={styles.sectionTitle}>Category Breakdown</Text>

                    {reportData.categoryBreakdown.length > 0 ? (
                        reportData.categoryBreakdown.map((item, index) => (
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
                        ))
                    ) : (
                        <Text style={styles.emptyText}>No transactions in this period</Text>
                    )}
                </Card>

                {/* Daily Trend Placeholder */}
                <Card style={styles.chartCard}>
                    <Text style={styles.sectionTitle}>Daily Trend</Text>
                    <View style={styles.chartPlaceholder}>
                        <Text style={styles.chartPlaceholderText}>📊</Text>
                        <Text style={styles.chartPlaceholderTitle}>Chart Coming Soon</Text>
                        <Text style={styles.chartPlaceholderSubtitle}>
                            Daily income vs expense trend will be displayed here
                        </Text>
                    </View>
                </Card>

                {/* Monthly Comparison Placeholder */}
                <Card style={styles.chartCard}>
                    <Text style={styles.sectionTitle}>Monthly Comparison</Text>
                    <View style={styles.chartPlaceholder}>
                        <Text style={styles.chartPlaceholderText}>📈</Text>
                        <Text style={styles.chartPlaceholderTitle}>Chart Coming Soon</Text>
                        <Text style={styles.chartPlaceholderSubtitle}>
                            Monthly comparison with previous periods will be displayed here
                        </Text>
                    </View>
                </Card>

                {/* Export Options */}
                <Card style={styles.exportCard}>
                    <Text style={styles.sectionTitle}>Export Options</Text>
                    <View style={styles.exportButtons}>
                        <TouchableOpacity style={styles.exportButton}>
                            <Text style={styles.exportButtonText}>📄 Export CSV</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.exportButton}>
                            <Text style={styles.exportButtonText}>📊 Export PDF</Text>
                        </TouchableOpacity>
                    </View>
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
    periodSelector: {
        marginHorizontal: Spacing.lg,
        marginBottom: Spacing.md,
    },
    periodTabs: {
        flexDirection: 'row',
        gap: Spacing.sm,
    },
    periodTab: {
        flex: 1,
    },
    dateSelector: {
        marginHorizontal: Spacing.lg,
        marginBottom: Spacing.lg,
    },
    dateSelectorContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: Spacing.md,
    },
    dateButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    dateButtonText: {
        fontSize: 20,
        fontWeight: '600',
        color: '#374151',
    },
    dateText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
    },
    summaryContainer: {
        flexDirection: 'row',
        paddingHorizontal: Spacing.lg,
        marginBottom: Spacing.lg,
        gap: Spacing.sm,
    },
    summaryCard: {
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
    summaryLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
        marginBottom: Spacing.xs,
    },
    summaryAmount: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        marginBottom: Spacing.xs,
    },
    summarySubtext: {
        fontSize: 12,
        color: '#6B7280',
    },
    categoryCard: {
        marginHorizontal: Spacing.lg,
        marginBottom: Spacing.lg,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
        marginBottom: Spacing.md,
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
    emptyText: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        paddingVertical: Spacing.lg,
    },
    chartCard: {
        marginHorizontal: Spacing.lg,
        marginBottom: Spacing.lg,
    },
    chartPlaceholder: {
        alignItems: 'center',
        paddingVertical: Spacing.xl,
    },
    chartPlaceholderText: {
        fontSize: 48,
        marginBottom: Spacing.md,
    },
    chartPlaceholderTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
        marginBottom: Spacing.xs,
    },
    chartPlaceholderSubtitle: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
    },
    exportCard: {
        marginHorizontal: Spacing.lg,
        marginBottom: Spacing.xl,
    },
    exportButtons: {
        flexDirection: 'row',
        gap: Spacing.md,
    },
    exportButton: {
        flex: 1,
        backgroundColor: '#F3F4F6',
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.lg,
        borderRadius: 8,
        alignItems: 'center',
    },
    exportButtonText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#374151',
    },
});


