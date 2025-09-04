import dayjs from 'dayjs';
import React, { useMemo, useState } from 'react';
import {
    Alert,
    Dimensions,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../app/providers/ThemeProvider';
import { SafeContainer } from '../../components/layout/SafeContainer';
import Card from '../../components/ui/Card';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useGetCategoriesQuery, useGetTransactionsQuery } from '../../state/api';
import {
    CustomComparison,
    ComparisonItem,
    CustomPeriodState
} from './components/CustomComparison';
import { PieChart } from './components/PieChart';
import { PeriodSelector, ReportPeriod } from './components/PeriodSelector';
import { SummaryCards } from './components/SummaryCards';
import { TrendChart } from './components/TrendChart';

const { width: screenWidth } = Dimensions.get('window');

export const ReportsScreen: React.FC = () => {
    const { theme } = useTheme();
    const [selectedPeriod, setSelectedPeriod] = useState<ReportPeriod>('monthly');
    const [currentDate, setCurrentDate] = useState(dayjs());
    const [refreshing, setRefreshing] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showMonthPicker, setShowMonthPicker] = useState(false);
    const [showYearPicker, setShowYearPicker] = useState(false);
    const [customPeriod, setCustomPeriod] = useState<CustomPeriodState>({
        comparisonType: 'dates',
        items: [],
        isAddingNew: false,
    });

    // Data queries
    const { data: transactions = [], isLoading, refetch: refetchTransactions } = useGetTransactionsQuery({});
    const { data: categories = [] } = useGetCategoriesQuery();

    // Calculate date ranges based on selected period
    const dateRange = useMemo(() => {
        let start: dayjs.Dayjs;
        let end: dayjs.Dayjs;
        let label: string;

        switch (selectedPeriod) {
            case 'daily':
                start = currentDate.startOf('day');
                end = currentDate.endOf('day');
                label = currentDate.format('MMMM D, YYYY');
                break;
            case 'monthly':
                start = currentDate.startOf('month');
                end = currentDate.endOf('month');
                label = currentDate.format('MMMM YYYY');
                break;
            case 'yearly':
                start = currentDate.startOf('year');
                end = currentDate.endOf('year');
                label = currentDate.format('YYYY');
                break;
            case 'custom':
                if (customPeriod.items.length === 0) {
                    start = dayjs().startOf('month');
                    end = dayjs().endOf('month');
                    label = 'No comparison selected';
                } else {
                    const allItems = customPeriod.items;
                    start = allItems.reduce((earliest, item) =>
                        item.start.isBefore(earliest) ? item.start : earliest, allItems[0].start);
                    end = allItems.reduce((latest, item) =>
                        item.end.isAfter(latest) ? item.end : latest, allItems[0].end);
                    label = `Comparing ${allItems.length} ${customPeriod.comparisonType}`;
                }
                break;
        }

        return { start, end, label };
    }, [selectedPeriod, currentDate.valueOf(), customPeriod]);

    // Filter transactions for the selected period
    const periodTransactions = useMemo(() => {
        if (selectedPeriod === 'custom' && customPeriod.items.length > 0) {
            return transactions.filter(transaction => {
                const transactionDate = dayjs(transaction.date);
                return customPeriod.items.some(item =>
                    transactionDate.isAfter(item.start.subtract(1, 'day')) &&
                    transactionDate.isBefore(item.end.add(1, 'day'))
                );
            });
        }

        return transactions.filter(transaction => {
            const transactionDate = dayjs(transaction.date);
            return transactionDate.isAfter(dateRange.start.subtract(1, 'day')) &&
                transactionDate.isBefore(dateRange.end.add(1, 'day'));
        });
    }, [transactions, dateRange.start.valueOf(), dateRange.end.valueOf(), selectedPeriod, customPeriod]);

    // Calculate comprehensive report data
    const reportData = useMemo(() => {
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
    }, [periodTransactions, categories, dateRange.start.valueOf(), dateRange.end.valueOf(), selectedPeriod, customPeriod, transactions]);

    // Handle period navigation
    const navigatePeriod = (direction: 'prev' | 'next') => {
        if (selectedPeriod === 'custom') return;

        const multiplier = direction === 'next' ? 1 : -1;
        let newDate: dayjs.Dayjs;

        switch (selectedPeriod) {
            case 'daily':
                newDate = currentDate.add(multiplier, 'day');
                break;
            case 'monthly':
                newDate = currentDate.add(multiplier, 'month');
                break;
            case 'yearly':
                newDate = currentDate.add(multiplier, 'year');
                break;
            default:
                return; // This should never happen, but just in case
        }

        // Force a new dayjs instance to ensure React detects the change
        setCurrentDate(dayjs(newDate.toDate()));
    };

    // Handle period type change
    const handlePeriodChange = (period: ReportPeriod) => {
        setSelectedPeriod(period);
        if (period === 'custom') {
            resetCustomPeriod();
        }
    };

    // Custom period handlers
    const addCustomPeriodItem = () => {
        const { comparisonType } = customPeriod;
        let newItem: ComparisonItem;
        const id = Date.now().toString();

        switch (comparisonType) {
            case 'dates':
                const selectedDate = customPeriod.selectedDate || dayjs();
                newItem = {
                    id,
                    label: selectedDate.format('MMM D, YYYY'),
                    start: selectedDate.startOf('day'),
                    end: selectedDate.endOf('day'),
                };
                break;
            case 'months':
                const selectedMonth = customPeriod.selectedMonth || dayjs();
                newItem = {
                    id,
                    label: selectedMonth.format('MMM YYYY'),
                    start: selectedMonth.startOf('month'),
                    end: selectedMonth.endOf('month'),
                };
                break;
            case 'years':
                const selectedYear = customPeriod.selectedYear || dayjs();
                newItem = {
                    id,
                    label: selectedYear.format('YYYY'),
                    start: selectedYear.startOf('year'),
                    end: selectedYear.endOf('year'),
                };
                break;
        }

        setCustomPeriod(prev => ({
            ...prev,
            items: [...prev.items, newItem],
            isAddingNew: false,
            selectedDate: undefined,
            selectedMonth: undefined,
            selectedYear: undefined,
        }));
    };

    const removeCustomPeriodItem = (id: string) => {
        setCustomPeriod(prev => ({
            ...prev,
            items: prev.items.filter(item => item.id !== id),
        }));
    };

    const resetCustomPeriod = () => {
        setCustomPeriod({
            comparisonType: 'dates',
            items: [],
            isAddingNew: false,
        });
    };

    // Handle refresh
    const handleRefresh = async () => {
        setRefreshing(true);
        await refetchTransactions();
        setRefreshing(false);
    };

    // Export functions
    const exportToCSV = async () => {
        try {
            let csvContent = `Period,${dateRange.label}\n`;
            csvContent += `Type,Amount,Count\n`;
            csvContent += `Income,${reportData.totals.income.toFixed(2)},${reportData.transactionCounts.income}\n`;
            csvContent += `Expense,${reportData.totals.expense.toFixed(2)},${reportData.transactionCounts.expense}\n`;
            csvContent += `Net,${reportData.totals.net.toFixed(2)},${reportData.transactionCounts.total}\n\n`;

            csvContent += `Income Categories\n`;
            csvContent += `Category,Amount\n`;
            reportData.incomeCategoryData.forEach(item => {
                csvContent += `${item.category.name},${item.amount.toFixed(2)}\n`;
            });

            csvContent += `\nExpense Categories\n`;
            csvContent += `Category,Amount\n`;
            reportData.expenseCategoryData.forEach(item => {
                csvContent += `${item.category.name},${item.amount.toFixed(2)}\n`;
            });

            const fileName = `financial_report_${dateRange.label.replace(/\s+/g, '_')}.csv`;
            const filePath = `${RNFS.DocumentDirectoryPath}/${fileName}`;

            await RNFS.writeFile(filePath, csvContent, 'utf8');

            await Share.open({
                url: `file://${filePath}`,
                type: 'text/csv',
                title: 'Financial Report'
            });
        } catch (error) {
            Alert.alert('Export Error', 'Failed to export CSV file');
        }
    };

    const exportToPDF = async () => {
        Alert.alert('Export PDF', 'PDF export functionality coming soon!');
    };

    // Get trend chart title
    const getTrendChartTitle = () => {
        if (selectedPeriod === 'custom' && customPeriod.items.length > 0) {
            return `${customPeriod.comparisonType.charAt(0).toUpperCase() + customPeriod.comparisonType.slice(1)} Comparison`;
        }

        switch (selectedPeriod) {
            case 'daily': return 'Daily Income vs Expenses';
            case 'monthly': return 'Weekly Income vs Expenses';
            case 'yearly': return 'Monthly Income vs Expenses';
            default: return 'Income vs Expenses';
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
                    <Text style={[styles.title, { color: theme.colors.text }]}>Financial Reports</Text>
                    <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                        Comprehensive financial insights
                    </Text>
                </View>

                {/* Period Selector */}
                <PeriodSelector
                    selectedPeriod={selectedPeriod}
                    currentDate={currentDate}
                    dateLabel={dateRange.label}
                    onPeriodChange={handlePeriodChange}
                    onDateChange={setCurrentDate}
                    onNavigatePeriod={navigatePeriod}
                    showDatePicker={showDatePicker}
                    showMonthPicker={showMonthPicker}
                    showYearPicker={showYearPicker}
                    onShowDatePicker={setShowDatePicker}
                    onShowMonthPicker={setShowMonthPicker}
                    onShowYearPicker={setShowYearPicker}
                />

                {/* Custom Comparison */}
                {selectedPeriod === 'custom' && (
                    <CustomComparison
                        customPeriod={customPeriod}
                        onUpdateCustomPeriod={setCustomPeriod}
                        showDatePicker={showDatePicker}
                        showMonthPicker={showMonthPicker}
                        showYearPicker={showYearPicker}
                        onShowDatePicker={setShowDatePicker}
                        onShowMonthPicker={setShowMonthPicker}
                        onShowYearPicker={setShowYearPicker}
                        onAddItem={addCustomPeriodItem}
                        onRemoveItem={removeCustomPeriodItem}
                    />
                )}

                {/* Summary Cards */}
                <SummaryCards data={reportData} />

                {/* Trend Chart */}
                <TrendChart
                    data={reportData.trendData}
                    title={getTrendChartTitle()}
                />

                {/* Income Categories */}
                {reportData.incomePieData.length > 0 && (
                    <Card style={styles.chartCard}>
                        <PieChart data={reportData.incomePieData} title="Top Income Categories" />
                    </Card>
                )}

                {/* Expense Categories */}
                {reportData.expensePieData.length > 0 && (
                    <Card style={styles.chartCard}>
                        <PieChart data={reportData.expensePieData} title="Top Expense Categories" />
                    </Card>
                )}

                {/* Export Options */}
                <Card style={styles.exportCard}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Export Report</Text>
                    <View style={styles.exportButtons}>
                        <TouchableOpacity
                            style={[styles.exportButton, { backgroundColor: theme.colors.primary[500] }]}
                            onPress={exportToCSV}
                            disabled={isLoading}
                        >
                            <Icon name="document-text" size={20} color={theme.colors.onPrimary} />
                            <Text style={[styles.exportButtonText, { color: theme.colors.onPrimary }]}>
                                Export CSV
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.exportButton, { backgroundColor: theme.colors.secondary[500] || theme.colors.primary[500] }]}
                            onPress={exportToPDF}
                            disabled={isLoading}
                        >
                            <Icon name="document" size={20} color={theme.colors.onPrimary} />
                            <Text style={[styles.exportButtonText, { color: theme.colors.onPrimary }]}>
                                Export PDF
                            </Text>
                        </TouchableOpacity>
                    </View>
                </Card>

                {/* Bottom Spacing */}
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
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 16,
    },
    chartCard: {
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
    },
    exportCard: {
        marginBottom: 16,
    },
    exportButtons: {
        flexDirection: screenWidth > 400 ? 'row' : 'column',
        gap: 12,
    },
    exportButton: {
        flex: screenWidth > 400 ? 1 : undefined,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 12,
        gap: 8,
    },
    exportButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    bottomSpacing: {
        height: 80,
    },
});