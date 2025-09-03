// src/screens/reports/ReportsScreen.tsx
import { useFont } from '@shopify/react-native-skia';
import React, { useMemo, useState } from 'react';
import {
    Dimensions,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Area, CartesianChart } from 'victory-native';
import { useTheme } from '../../app/providers/ThemeProvider';
import { SafeContainer } from '../../components/layout/SafeContainer';
import Card from '../../components/ui/Card';
import Chip from '../../components/ui/Chip';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import {
    calculateDailyTotals,
    calculateMonthlyTotals,
    formatCurrency,
    getCategoryBreakdown,
} from '../../features/transactions/utils/transactionUtils';
import { useGetCategoriesQuery, useGetTransactionsQuery } from '../../state/api';

type ReportPeriod = 'month' | 'quarter' | 'year';

const { width: screenWidth } = Dimensions.get('window');

// Simple Pie Chart Component (extracted to avoid ESLint warning)
const SimplePieChart: React.FC<{ data: Array<{ category: string; amount: number; color: string }> }> = ({ data }) => {
    const { theme } = useTheme();

    if (data.length === 0) return null;

    const total = data.reduce((sum, item) => sum + item.amount, 0);
    let currentAngle = 0;
    const radius = 80;
    const centerX = screenWidth / 2 - 32;
    const centerY = 120;

    return (
        <View style={styles.pieChartContainer}>
            <View style={styles.simplePieChart}>
                {data.map((item, index) => {
                    const percentage = item.amount / total;
                    const angle = percentage * 360;
                    const startAngle = currentAngle;
                    currentAngle += angle;

                    return (
                        <View
                            key={index}
                            style={[
                                styles.pieSlice,
                                {
                                    backgroundColor: item.color,
                                    transform: [
                                        { translateX: centerX - radius },
                                        { translateY: centerY - radius },
                                        { rotate: `${startAngle}deg` },
                                    ],
                                },
                            ]}
                        />
                    );
                })}
            </View>

            {/* Legend */}
            <View style={styles.pieChartLegend}>
                {data.map((item, index) => (
                    <View key={index} style={styles.legendItem}>
                        <View
                            style={[
                                styles.legendColor,
                                { backgroundColor: item.color }
                            ]}
                        />
                        <Text style={[styles.legendText, { color: theme.colors.text }]}>
                            {item.category}
                        </Text>
                        <Text style={[styles.legendAmount, { color: theme.colors.textSecondary }]}>
                            {formatCurrency(item.amount)}
                        </Text>
                    </View>
                ))}
            </View>
        </View>
    );
};

export const ReportsScreen: React.FC = () => {
    const { theme } = useTheme();
    const [selectedPeriod, setSelectedPeriod] = useState<ReportPeriod>('month');
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [refreshing, setRefreshing] = useState(false);

    // Try to load a font for the charts (optional)
    const font = useFont(require('../../assets/fonts/Roboto-Regular.ttf'), 12);

    // Data queries
    const { data: transactions = [], isLoading, refetch: refetchTransactions } = useGetTransactionsQuery({
        // Get all transactions for reports - no filtering needed
    });
    const { data: categories = [], isLoading: categoriesLoading } = useGetCategoriesQuery();

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

        // Prepare chart data for Victory Native 41+
        const dailyChartData = Object.entries(dailyTotals)
            .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
            .map(([date, day], index) => ({
                day: index + 1,
                net: day.income - day.expense,
                income: day.income,
                expense: day.expense,
                date: date,
            }));

        const categoryPieData = categoryBreakdown
            .filter(item => item.amount > 0)
            .slice(0, 6) // Top 6 categories
            .map((item, index) => ({
                category: item.category.name,
                amount: item.amount,
                color: item.category.color || (theme.colors.chart as any)?.[index + 1] || `hsl(${index * 60}, 70%, 50%)`,
            }));

        return {
            totals,
            categoryBreakdown,
            dailyTotals,
            dailyChartData,
            categoryPieData,
            transactionCount: periodTransactions.length,
        };
    }, [transactions, categories, selectedYear, selectedMonth, theme]);

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

    // Dynamic styles
    const dynamicStyles = {
        exportButtonText: {
            color: theme.colors.text,
            opacity: isLoading || categoriesLoading ? 0.5 : 1
        }
    };

    if (isLoading && transactions.length === 0) {
        return (
            <SafeContainer>
                <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
                    <LoadingSpinner size="large" />
                    <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
                        Loading reports...
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
                        tintColor={theme.colors.primary[500]}
                        colors={[theme.colors.primary[500]]}
                    />
                }
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={[styles.title, { color: theme.colors.text }]}>Reports</Text>
                    <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                        Financial insights and analytics
                    </Text>
                </View>

                {/* Period Selector */}
                <Card>
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
                            <Icon name="chevron-back" size={20} color={theme.colors.text} />
                        </TouchableOpacity>

                        <Text style={styles.dateText}>
                            {getMonthName(selectedMonth)} {selectedYear}
                        </Text>

                        <TouchableOpacity
                            style={styles.dateButton}
                            onPress={() => handleMonthChange('next')}
                        >
                            <Icon name="chevron-forward" size={20} color={theme.colors.text} />
                        </TouchableOpacity>
                    </View>
                </Card>

                {/* Summary Cards */}
                <View style={styles.summaryContainer}>
                    <Card style={StyleSheet.flatten([styles.summaryCard, styles.incomeCard])} variant='normal'>
                        <Text style={styles.summaryLabel}>Total Income</Text>
                        <Text style={styles.summaryAmount}>{formatCurrency(reportData.totals.income)}</Text>
                        <Text style={styles.summarySubtext}>
                            {reportData.transactionCount} transactions
                        </Text>
                    </Card>

                    <Card style={StyleSheet.flatten([styles.summaryCard, styles.expenseCard])} variant='normal'>
                        <Text style={styles.summaryLabel}>Total Expenses</Text>
                        <Text style={styles.summaryAmount}>{formatCurrency(reportData.totals.expense)}</Text>
                        <Text style={styles.summarySubtext}>
                            {reportData.transactionCount} transactions
                        </Text>
                    </Card>

                    <Card style={StyleSheet.flatten([styles.summaryCard, styles.netCard])} variant='normal'>
                        <Text style={styles.summaryLabel}>Net Amount</Text>
                        <Text style={[
                            styles.summaryAmount,
                            reportData.totals.net >= 0 ? styles.positiveAmount : styles.negativeAmount
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
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                        Category Breakdown
                    </Text>

                    {reportData.categoryBreakdown.length > 0 ? (
                        <View>
                            {reportData.categoryBreakdown.slice(0, 8).map((item) => (
                                <View key={item.category.id} style={styles.categoryItem}>
                                    <View style={styles.categoryInfo}>
                                        <View style={[styles.categoryColor, { backgroundColor: item.category.color }]} />
                                        <View style={styles.categoryNameContainer}>
                                            <Text style={[styles.categoryName, { color: theme.colors.text }]}>
                                                {item.category.name}
                                            </Text>
                                            {/* Progress Bar */}
                                            <View style={[styles.progressBarContainer, { backgroundColor: theme.colors.border }]}>
                                                <View
                                                    style={[
                                                        styles.progressBar,
                                                        {
                                                            width: `${Math.min(item.percentage, 100)}%`,
                                                            backgroundColor: item.category.color
                                                        }
                                                    ]}
                                                />
                                            </View>
                                        </View>
                                    </View>
                                    <View style={styles.categoryAmount}>
                                        <Text style={[styles.categoryAmountText, { color: theme.colors.text }]}>
                                            {formatCurrency(item.amount)}
                                        </Text>
                                        <Text style={[styles.categoryPercentage, { color: theme.colors.textSecondary }]}>
                                            {item.percentage.toFixed(1)}%
                                        </Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    ) : (
                        <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                            No transactions in this period
                        </Text>
                    )}
                </Card>

                {/* Daily Trend Chart */}
                <Card style={styles.chartCard}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Daily Trend</Text>
                    {reportData.dailyChartData.length > 0 ? (
                        <View style={styles.chartContainer}>
                            <CartesianChart
                                data={reportData.dailyChartData}
                                xKey="day"
                                yKeys={["net"]}
                                axisOptions={{
                                    font,
                                    tickCount: 5,
                                    labelOffset: { x: -2, y: 0 },
                                    labelColor: theme.colors.textSecondary,
                                    formatYLabel: (v) => formatCurrency(v).replace('$', ''),
                                    formatXLabel: (v) => `${v}`,
                                }}
                                chartPressState={undefined}
                            >
                                {({ points }) => (
                                    <Area
                                        points={points.net}
                                        y0={0}
                                        color={reportData.totals.net >= 0 ? theme.colors.income?.main || '#10B981' : theme.colors.expense?.main || '#EF4444'}
                                        opacity={0.6}
                                    />
                                )}
                            </CartesianChart>
                        </View>
                    ) : (
                        <View style={styles.emptyChart}>
                            <Text style={[styles.emptyChartText, { color: theme.colors.textSecondary }]}>
                                No data available for selected period
                            </Text>
                        </View>
                    )}
                </Card>

                {/* Category Distribution */}
                <Card style={styles.chartCard}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Category Distribution</Text>
                    {reportData.categoryPieData.length > 0 ? (
                        <SimplePieChart data={reportData.categoryPieData} />
                    ) : (
                        <View style={styles.emptyChart}>
                            <Text style={[styles.emptyChartText, { color: theme.colors.textSecondary }]}>
                                No category data available
                            </Text>
                        </View>
                    )}
                </Card>

                {/* Export Options */}
                <Card style={styles.exportCard}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Export Options</Text>
                    <View style={styles.exportButtons}>
                        <TouchableOpacity
                            style={[
                                styles.exportButton,
                                { backgroundColor: theme.colors.surfaceVariant }
                            ]}
                            disabled={isLoading || categoriesLoading}
                        >
                            <Text style={[styles.exportButtonText, dynamicStyles.exportButtonText]}>
                                📄 Export CSV
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.exportButton,
                                { backgroundColor: theme.colors.surfaceVariant }
                            ]}
                            disabled={isLoading || categoriesLoading}
                        >
                            <Text style={[styles.exportButtonText, dynamicStyles.exportButtonText]}>
                                📊 Export PDF
                            </Text>
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
        paddingVertical: 12,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 16,
    },
    periodTabs: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8,
    },
    periodTab: {
        flex: 1,
    },
    dateSelector: {
        marginVertical: 12,
    },
    dateSelectorContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    dateButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(0,0,0,0.05)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    dateButtonText: {
        fontSize: 20,
        fontWeight: '600',
    },
    dateText: {
        fontSize: 18,
        fontWeight: '600',
    },
    summaryContainer: {
        flexDirection: screenWidth > 400 ? 'row' : 'column',
        gap: 8,
    },
    summaryCard: {
        flex: screenWidth > 400 ? 1 : undefined,
        padding: 16,
        minHeight: 80,
    },
    incomeCard: {
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
    },
    expenseCard: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
    },
    netCard: {
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
    },
    summaryLabel: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 4,
    },
    summaryAmount: {
        fontSize: screenWidth > 400 ? 20 : 18,
        fontWeight: '700',
        marginBottom: 4,
    },
    positiveAmount: {
        color: '#10B981',
    },
    negativeAmount: {
        color: '#EF4444',
    },
    summarySubtext: {
        fontSize: 12,
    },
    categoryCard: {
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 4,
    },
    chartCard: {
        marginBottom: 12,
    },
    chartContainer: {
        height: 220,
        marginHorizontal: -16,
    },
    pieChartContainer: {
        alignItems: 'center',
    },
    simplePieChart: {
        width: 160,
        height: 160,
        borderRadius: 80,
        position: 'relative',
        marginBottom: 20,
        backgroundColor: '#f0f0f0',
    },
    pieSlice: {
        position: 'absolute',
        width: 160,
        height: 160,
        borderRadius: 80,
    },
    pieChartLegend: {
        marginTop: 16,
        width: '100%',
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    legendColor: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 12,
    },
    legendText: {
        flex: 1,
        fontSize: 14,
        fontWeight: '500',
    },
    legendAmount: {
        fontSize: 14,
        fontWeight: '600',
    },
    emptyChart: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyChartText: {
        fontSize: 16,
        textAlign: 'center',
    },
    categoryItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 8,
        marginBottom: 8,
        backgroundColor: 'rgba(0,0,0,0.02)',
    },
    categoryInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    categoryColor: {
        width: 16,
        height: 16,
        borderRadius: 8,
        marginRight: 12,
    },
    categoryNameContainer: {
        flex: 1,
        marginLeft: 4,
    },
    categoryName: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 6,
    },
    progressBarContainer: {
        height: 4,
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        borderRadius: 2,
    },
    categoryAmount: {
        alignItems: 'flex-end',
        minWidth: 80,
    },
    categoryAmountText: {
        fontSize: 16,
        fontWeight: '600',
    },
    categoryPercentage: {
        fontSize: 12,
        marginTop: 2,
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
        paddingVertical: 40,
    },
    exportCard: {
        paddingHorizontal: 12,
        marginBottom: 64,
    },
    exportButtons: {
        paddingTop: 4,
        flexDirection: screenWidth > 400 ? 'row' : 'column',
        gap: 12,
    },
    exportButton: {
        flex: screenWidth > 400 ? 1 : undefined,
        paddingVertical: 16,
        paddingHorizontal: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    exportButtonText: {
        fontSize: 16,
        fontWeight: '500',
    },
});