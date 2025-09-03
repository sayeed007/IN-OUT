// src/screens/reports/ReportsScreen.tsx
import dayjs from 'dayjs';
import React, { useMemo, useState } from 'react';
import {
    Alert,
    Dimensions,
    Modal,
    Platform,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import Icon from 'react-native-vector-icons/Ionicons';
import { CartesianChart, Line } from 'victory-native';
import { useTheme } from '../../app/providers/ThemeProvider';
import { SafeContainer } from '../../components/layout/SafeContainer';
import Card from '../../components/ui/Card';
import Chip from '../../components/ui/Chip';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useGetCategoriesQuery, useGetTransactionsQuery } from '../../state/api';

type ReportPeriod = 'daily' | 'monthly' | 'yearly' | 'custom';

type ComparisonType = 'dates' | 'months' | 'years';

type ComparisonItem = {
    id: string;
    label: string;
    start: dayjs.Dayjs;
    end: dayjs.Dayjs;
};

type CustomPeriodState = {
    comparisonType: ComparisonType;
    items: ComparisonItem[];
    isAddingNew: boolean;
    selectedDate?: dayjs.Dayjs;
    selectedMonth?: dayjs.Dayjs;
    selectedYear?: dayjs.Dayjs;
};

const { width: screenWidth } = Dimensions.get('window');

// Improved Pie Chart Component
const PieChart: React.FC<{ data: Array<{ label: string; value: number; color: string }>, title: string }> = ({ data, title }) => {
    const { theme } = useTheme();

    if (data.length === 0) return null;

    const total = data.reduce((sum, item) => sum + item.value, 0);

    return (
        <View style={styles.pieChartContainer}>
            <Text style={[styles.chartTitle, { color: theme.colors.text }]}>{title}</Text>
            <View style={styles.pieChartLegend}>
                {data.map((item, index) => {
                    const percentage = (item.value / total) * 100;
                    return (
                        <View key={index} style={styles.legendItem}>
                            <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                            <Text style={[styles.legendText, { color: theme.colors.text }]}>
                                {item.label}
                            </Text>
                            <View style={styles.legendValues}>
                                <Text style={[styles.legendAmount, { color: theme.colors.text }]}>
                                    ${item.value.toFixed(2)}
                                </Text>
                                <Text style={[styles.legendPercentage, { color: theme.colors.textSecondary }]}>
                                    {percentage.toFixed(1)}%
                                </Text>
                            </View>
                        </View>
                    );
                })}
            </View>
        </View>
    );
};

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

    // Data queries - get all transactions
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
    }, [selectedPeriod, currentDate, customPeriod]);

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
    }, [transactions, dateRange, selectedPeriod, customPeriod]);

    // Calculate comprehensive report data
    const reportData = useMemo(() => {
        // Basic totals
        const incomeTransactions = periodTransactions.filter(t => t.type === 'income');
        const expenseTransactions = periodTransactions.filter(t => t.type === 'expense');

        const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
        const totalExpense = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
        const netAmount = totalIncome - totalExpense;

        // Category breakdown - separate by type
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

        // Trend data based on period type
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

        // Prepare pie chart data
        const incomeChartColors = ['#10B981', '#059669', '#047857', '#065F46', '#064E3B'];
        const expenseChartColors = ['#EF4444', '#DC2626', '#B91C1C', '#991B1B', '#7F1D1D'];

        const incomePieData = incomeCategoryData.slice(0, 5).map((item, index) => ({
            label: item.category.name,
            value: item.amount,
            color: incomeChartColors[index] || '#10B981'
        }));

        const expensePieData = expenseCategoryData.slice(0, 5).map((item, index) => ({
            label: item.category.name,
            value: item.amount,
            color: expenseChartColors[index] || '#EF4444'
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
    }, [periodTransactions, categories, dateRange, selectedPeriod, customPeriod, transactions]);

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
        }

        setCurrentDate(newDate);
    };

    // Date picker handlers
    const handleDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (selectedDate) {
            setCurrentDate(dayjs(selectedDate));
        }
    };

    const handleMonthChange = (event: any, selectedDate?: Date) => {
        setShowMonthPicker(Platform.OS === 'ios');
        if (selectedDate) {
            setCurrentDate(dayjs(selectedDate));
        }
    };

    const handleYearChange = (event: any, selectedDate?: Date) => {
        setShowYearPicker(Platform.OS === 'ios');
        if (selectedDate) {
            setCurrentDate(dayjs(selectedDate));
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
                <Card>
                    <View style={styles.periodTabs}>
                        {(['daily', 'monthly', 'yearly', 'custom'] as ReportPeriod[]).map((period) => {
                            let label = period.charAt(0).toUpperCase() + period.slice(1);
                            if (period === 'custom') label = 'Compare';
                            
                            return (
                                <Chip
                                    key={period}
                                    label={label}
                                    selected={selectedPeriod === period}
                                    onPress={() => {
                                        setSelectedPeriod(period);
                                        if (period === 'custom') {
                                            resetCustomPeriod();
                                        }
                                    }}
                                    style={styles.periodTab}
                                />
                            );
                        })}
                    </View>
                </Card>

                {/* Date Selector */}
                {selectedPeriod !== 'custom' ? (
                    <Card style={styles.dateSelector}>
                        <View style={styles.dateSelectorContent}>
                            <TouchableOpacity
                                style={[styles.dateButton, { backgroundColor: theme.colors.surface }]}
                                onPress={() => navigatePeriod('prev')}
                            >
                                <Icon name="chevron-back" size={20} color={theme.colors.text} />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.dateDisplayButton}
                                onPress={() => {
                                    if (selectedPeriod === 'daily') setShowDatePicker(true);
                                    else if (selectedPeriod === 'monthly') setShowMonthPicker(true);
                                    else if (selectedPeriod === 'yearly') setShowYearPicker(true);
                                }}
                            >
                                <Text style={[styles.dateText, { color: theme.colors.text }]}>
                                    {dateRange.label}
                                </Text>
                                <Icon name="calendar" size={16} color={theme.colors.textSecondary} style={{ marginLeft: 8 }} />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.dateButton, { backgroundColor: theme.colors.surface }]}
                                onPress={() => navigatePeriod('next')}
                            >
                                <Icon name="chevron-forward" size={20} color={theme.colors.text} />
                            </TouchableOpacity>
                        </View>
                    </Card>
                ) : (
                    <Card style={styles.customPeriodCard}>
                        <Text style={[styles.customPeriodTitle, { color: theme.colors.text }]}>
                            Comparison Settings
                        </Text>
                        
                        {/* Comparison Type Selector */}
                        <View style={styles.comparisonTypeTabs}>
                            {(['dates', 'months', 'years'] as ComparisonType[]).map((type) => (
                                <Chip
                                    key={type}
                                    label={type.charAt(0).toUpperCase() + type.slice(1)}
                                    selected={customPeriod.comparisonType === type}
                                    onPress={() => {
                                        setCustomPeriod(_prev => ({
                                            comparisonType: type,
                                            items: [],
                                            isAddingNew: false,
                                        }));
                                    }}
                                    style={styles.comparisonTypeTab}
                                />
                            ))}
                        </View>

                        {/* Selected Items */}
                        {customPeriod.items.length > 0 && (
                            <View style={styles.selectedItems}>
                                <Text style={[styles.selectedItemsTitle, { color: theme.colors.text }]}>
                                    Selected {customPeriod.comparisonType}:
                                </Text>
                                {customPeriod.items.map((item) => (
                                    <View key={item.id} style={[styles.selectedItem, { backgroundColor: theme.colors.surface }]}>
                                        <Text style={[styles.selectedItemText, { color: theme.colors.text }]}>
                                            {item.label}
                                        </Text>
                                        <TouchableOpacity
                                            onPress={() => removeCustomPeriodItem(item.id)}
                                            style={styles.removeItemButton}
                                        >
                                            <Icon name="close" size={16} color={typeof theme.colors.error === 'string' ? theme.colors.error : '#EF4444'} />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* Add New Button */}
                        <TouchableOpacity
                            style={[styles.addPeriodButton, { backgroundColor: theme.colors.primary[500] }]}
                            onPress={() => {
                                setCustomPeriod(prev => ({ ...prev, isAddingNew: true }));
                                if (customPeriod.comparisonType === 'dates') setShowDatePicker(true);
                                else if (customPeriod.comparisonType === 'months') setShowMonthPicker(true);
                                else if (customPeriod.comparisonType === 'years') setShowYearPicker(true);
                            }}
                        >
                            <Icon name="add" size={20} color={theme.colors.onPrimary} />
                            <Text style={[styles.addPeriodButtonText, { color: theme.colors.onPrimary }]}>
                                Add {customPeriod.comparisonType.slice(0, -1)}
                            </Text>
                        </TouchableOpacity>
                    </Card>
                )}

                {/* Summary Cards */}
                <View style={styles.summaryContainer}>
                    <Card style={[styles.summaryCard, styles.incomeCard]}>
                        <View style={styles.summaryHeader}>
                            <Icon name="trending-up" size={20} color="#10B981" />
                            <Text style={[styles.summaryLabel, { color: '#10B981' }]}>Income</Text>
                        </View>
                        <Text style={[styles.summaryAmount, { color: '#10B981' }]}>
                            ${reportData.totals.income.toFixed(2)}
                        </Text>
                        <Text style={[styles.summarySubtext, { color: theme.colors.textSecondary }]}>
                            {reportData.transactionCounts.income} transactions
                        </Text>
                    </Card>

                    <Card style={[styles.summaryCard, styles.expenseCard]}>
                        <View style={styles.summaryHeader}>
                            <Icon name="trending-down" size={20} color="#EF4444" />
                            <Text style={[styles.summaryLabel, { color: '#EF4444' }]}>Expenses</Text>
                        </View>
                        <Text style={[styles.summaryAmount, { color: '#EF4444' }]}>
                            ${reportData.totals.expense.toFixed(2)}
                        </Text>
                        <Text style={[styles.summarySubtext, { color: theme.colors.textSecondary }]}>
                            {reportData.transactionCounts.expense} transactions
                        </Text>
                    </Card>

                    <Card style={[styles.summaryCard, styles.netCard]}>
                        <View style={styles.summaryHeader}>
                            <Icon name="analytics" size={20} color={reportData.totals.net >= 0 ? '#10B981' : '#EF4444'} />
                            <Text style={[styles.summaryLabel, { color: reportData.totals.net >= 0 ? '#10B981' : '#EF4444' }]}>
                                Net
                            </Text>
                        </View>
                        <Text style={[
                            styles.summaryAmount,
                            { color: reportData.totals.net >= 0 ? '#10B981' : '#EF4444' }
                        ]}>
                            ${Math.abs(reportData.totals.net).toFixed(2)}
                        </Text>
                        <Text style={[styles.summarySubtext, { color: theme.colors.textSecondary }]}>
                            {reportData.totals.net >= 0 ? 'Surplus' : 'Deficit'}
                        </Text>
                    </Card>
                </View>

                {/* Trend Chart */}
                {reportData.trendData.length > 0 && (
                    <Card style={styles.chartCard}>
                        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                            {selectedPeriod === 'custom' && customPeriod.items.length > 0 
                                ? `${customPeriod.comparisonType.charAt(0).toUpperCase() + customPeriod.comparisonType.slice(1)} Comparison`
                                : selectedPeriod === 'daily' 
                                ? 'Daily Income vs Expenses'
                                : selectedPeriod === 'monthly'
                                ? 'Weekly Income vs Expenses'
                                : 'Monthly Income vs Expenses'
                            }
                        </Text>
                        <View style={styles.chartContainer}>
                            <CartesianChart
                                data={reportData.trendData}
                                xKey="date"
                                yKeys={["income", "expense"]}
                                axisOptions={{
                                    tickCount: Math.min(reportData.trendData.length, 6),
                                    labelColor: theme.colors.textSecondary,
                                    formatYLabel: (v: number) => `$${v.toFixed(0)}`,
                                }}
                            >
                                {({ points }) => (
                                    <>
                                        <Line
                                            points={points.income}
                                            color="#10B981"
                                            strokeWidth={2}
                                        />
                                        <Line
                                            points={points.expense}
                                            color="#EF4444"
                                            strokeWidth={2}
                                        />
                                    </>
                                )}
                            </CartesianChart>
                        </View>
                        <View style={styles.chartLegend}>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendColor, { backgroundColor: '#10B981' }]} />
                                <Text style={[styles.legendText, { color: theme.colors.text }]}>Income</Text>
                            </View>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendColor, { backgroundColor: '#EF4444' }]} />
                                <Text style={[styles.legendText, { color: theme.colors.text }]}>Expenses</Text>
                            </View>
                        </View>
                    </Card>
                )}

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

                {/* Date Pickers */}
                {showDatePicker && (
                    <DateTimePicker
                        value={customPeriod.isAddingNew && customPeriod.selectedDate ? customPeriod.selectedDate.toDate() : currentDate.toDate()}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={(event, date) => {
                            if (customPeriod.isAddingNew) {
                                setShowDatePicker(Platform.OS === 'ios');
                                if (date) {
                                    setCustomPeriod(prev => ({ ...prev, selectedDate: dayjs(date) }));
                                    if (Platform.OS === 'android') {
                                        setTimeout(() => {
                                            setCustomPeriod(prev => ({ ...prev, selectedDate: dayjs(date) }));
                                            addCustomPeriodItem();
                                        }, 100);
                                    }
                                }
                            } else {
                                handleDateChange(event, date);
                            }
                        }}
                    />
                )}

                {showMonthPicker && (
                    <DateTimePicker
                        value={customPeriod.isAddingNew && customPeriod.selectedMonth ? customPeriod.selectedMonth.toDate() : currentDate.toDate()}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={(event, date) => {
                            if (customPeriod.isAddingNew) {
                                setShowMonthPicker(Platform.OS === 'ios');
                                if (date) {
                                    setCustomPeriod(prev => ({ ...prev, selectedMonth: dayjs(date) }));
                                    if (Platform.OS === 'android') {
                                        setTimeout(() => {
                                            setCustomPeriod(prev => ({ ...prev, selectedMonth: dayjs(date) }));
                                            addCustomPeriodItem();
                                        }, 100);
                                    }
                                }
                            } else {
                                handleMonthChange(event, date);
                            }
                        }}
                    />
                )}

                {showYearPicker && (
                    <DateTimePicker
                        value={customPeriod.isAddingNew && customPeriod.selectedYear ? customPeriod.selectedYear.toDate() : currentDate.toDate()}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={(event, date) => {
                            if (customPeriod.isAddingNew) {
                                setShowYearPicker(Platform.OS === 'ios');
                                if (date) {
                                    setCustomPeriod(prev => ({ ...prev, selectedYear: dayjs(date) }));
                                    if (Platform.OS === 'android') {
                                        setTimeout(() => {
                                            setCustomPeriod(prev => ({ ...prev, selectedYear: dayjs(date) }));
                                            addCustomPeriodItem();
                                        }, 100);
                                    }
                                }
                            } else {
                                handleYearChange(event, date);
                            }
                        }}
                    />
                )}

                {/* iOS Date Picker Confirm Button */}
                {Platform.OS === 'ios' && (customPeriod.isAddingNew && (showDatePicker || showMonthPicker || showYearPicker)) && (
                    <Modal transparent visible={true} animationType="fade">
                        <View style={styles.iosPickerOverlay}>
                            <View style={[styles.iosPickerContainer, { backgroundColor: theme.colors.surface }]}>
                                <View style={styles.iosPickerHeader}>
                                    <TouchableOpacity
                                        onPress={() => {
                                            setShowDatePicker(false);
                                            setShowMonthPicker(false);
                                            setShowYearPicker(false);
                                            setCustomPeriod(prev => ({
                                                ...prev,
                                                isAddingNew: false,
                                                selectedDate: undefined,
                                                selectedMonth: undefined,
                                                selectedYear: undefined,
                                            }));
                                        }}
                                    >
                                        <Text style={[styles.iosPickerButton, { color: theme.colors.textSecondary }]}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => {
                                            addCustomPeriodItem();
                                            setShowDatePicker(false);
                                            setShowMonthPicker(false);
                                            setShowYearPicker(false);
                                        }}
                                    >
                                        <Text style={[styles.iosPickerButton, { color: theme.colors.primary[500] }]}>Done</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </Modal>
                )}

                {/* Bottom Spacing */}
                <View style={{ height: 80 }} />
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
    periodTabs: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8,
    },
    periodTab: {
        flex: 1,
    },
    dateSelector: {
        marginVertical: 8,
    },
    dateSelectorContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    dateButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dateText: {
        fontSize: 18,
        fontWeight: '600',
    },
    summaryContainer: {
        flexDirection: screenWidth > 400 ? 'row' : 'column',
        gap: 12,
        marginBottom: 8,
    },
    summaryCard: {
        flex: screenWidth > 400 ? 1 : undefined,
        padding: 16,
    },
    summaryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    incomeCard: {
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
    },
    expenseCard: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
    },
    netCard: {
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
    },
    summaryLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 8,
    },
    summaryAmount: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 4,
    },
    summarySubtext: {
        fontSize: 12,
    },
    chartCard: {
        marginBottom: 12,
    },
    chartContainer: {
        height: 200,
        marginTop: 8,
    },
    chartLegend: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 20,
        marginTop: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
    },
    chartTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
        textAlign: 'center',
    },
    pieChartContainer: {
        alignItems: 'center',
    },
    pieChartLegend: {
        width: '100%',
        marginTop: 8,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 4,
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
    legendValues: {
        alignItems: 'flex-end',
    },
    legendAmount: {
        fontSize: 14,
        fontWeight: '600',
    },
    legendPercentage: {
        fontSize: 12,
        marginTop: 2,
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
    dateDisplayButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    },
    customPeriodCard: {
        marginVertical: 8,
        padding: 16,
    },
    customPeriodTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
    },
    comparisonTypeTabs: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 16,
    },
    comparisonTypeTab: {
        flex: 1,
    },
    selectedItems: {
        marginBottom: 16,
    },
    selectedItemsTitle: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
    },
    selectedItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
    },
    selectedItemText: {
        fontSize: 14,
        fontWeight: '500',
    },
    removeItemButton: {
        padding: 4,
    },
    addPeriodButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 8,
        gap: 8,
    },
    addPeriodButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    iosPickerOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    iosPickerContainer: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 34,
    },
    iosPickerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    },
    iosPickerButton: {
        fontSize: 16,
        fontWeight: '500',
    },
});