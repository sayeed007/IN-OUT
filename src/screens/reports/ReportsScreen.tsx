import dayjs from 'dayjs';
import React, { useMemo, useState } from 'react';
import {
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useSelector } from 'react-redux';
import { useTheme } from '../../app/providers/ThemeProvider';
import { SafeContainer } from '../../components/layout/SafeContainer';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useGetCategoriesQuery, useGetTransactionsQuery, useGetBudgetsQuery } from '../../state/api';
import { RootState } from '../../state/store';
import {
    CustomComparison,
    ComparisonItem,
    CustomPeriodState
} from './components/CustomComparison';
import { PeriodSelector, ReportPeriod } from './components/PeriodSelector';
import { SummaryCards } from './components/SummaryCards';
import { ExportButtons } from './components/ExportButtons';
import { ReportHeader } from './components/ReportHeader';
import { ReportCharts } from './components/ReportCharts';
import { useReportData } from './hooks/useReportData';
import BottomSpacing from '../../components/ui/BottomSpacing';
import { getCustomPeriodStart, getCustomPeriodEnd, formatPeriodLabel } from '../../utils/helpers/dateUtils';


export const ReportsScreen: React.FC = () => {
    const { theme } = useTheme();
    const periodStartDay = useSelector((state: RootState) => state.preferences.budgetStartDay);
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
    const { data: budgets = [] } = useGetBudgetsQuery({});

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
                // Use custom accounting period
                start = dayjs(getCustomPeriodStart(currentDate.toDate(), periodStartDay));
                end = dayjs(getCustomPeriodEnd(currentDate.toDate(), periodStartDay));
                label = formatPeriodLabel(
                    start.format('YYYY-MM-DD'),
                    periodStartDay
                );
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

    // Calculate comprehensive report data using custom hook
    const reportData = useReportData({
        periodTransactions,
        categories,
        dateRange,
        selectedPeriod,
        customPeriod,
        transactions,
        budgets,
    });

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


    // Get trend chart title
    const getTrendChartTitle = () => {
        if (selectedPeriod === 'custom' && customPeriod.items.length > 0) {
            return `${customPeriod.comparisonType.charAt(0).toUpperCase() + customPeriod.comparisonType.slice(1)} Spending vs Income`;
        }

        switch (selectedPeriod) {
            case 'daily': return 'Daily Spending vs Income';
            case 'monthly': return 'Spending Trend vs Available Income';
            case 'yearly': return 'Monthly Spending vs Income';
            default: return 'Spending vs Income';
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
                <ReportHeader />

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

                {/* Charts */}
                <ReportCharts
                    reportData={reportData}
                    trendChartTitle={getTrendChartTitle()}
                    dateRange={dateRange}
                />

                {/* Export Options */}
                <ExportButtons
                    reportData={reportData}
                    periodTransactions={periodTransactions}
                    categories={categories}
                    dateRange={dateRange}
                    isLoading={isLoading}
                />

                {/* Bottom Spacing */}
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
});