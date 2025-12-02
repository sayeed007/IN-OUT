import React from 'react';
import { StyleSheet } from 'react-native';
import dayjs from 'dayjs';
import Card from '../../../components/ui/Card';
import { DonutChart } from './DonutChart';
import { HorizontalBarChart } from './HorizontalBarChart';
import { TrendChart } from './TrendChart';
import { BudgetProgressCards } from './BudgetProgressCards';
import { KeyMetricsCard } from './KeyMetricsCard';
import { CategoryTrendChart } from './CategoryTrendChart';
import { SpendingHeatmap } from './SpendingHeatmap';
import { ReportData } from '../hooks/useReportData';

interface ReportChartsProps {
    reportData: ReportData;
    trendChartTitle: string;
    dateRange: {
        start: dayjs.Dayjs;
        end: dayjs.Dayjs;
        label: string;
    };
}

export const ReportCharts: React.FC<ReportChartsProps> = ({
    reportData,
    trendChartTitle,
    dateRange,
}) => {
    return (
        <>
            {/* Key Metrics Dashboard */}
            <KeyMetricsCard metrics={reportData.keyMetrics} />

            {/* Budget Progress */}
            {reportData.budgetProgressData.length > 0 && (
                <BudgetProgressCards budgets={reportData.budgetProgressData} />
            )}

            {/* Trend Chart */}
            <TrendChart
                data={reportData.trendData}
                title={trendChartTitle}
            />

            {/* Top Expense Categories - Horizontal Bar Chart */}
            {reportData.topExpenseBarData.length > 0 && (
                <Card style={styles.chartCard}>
                    <HorizontalBarChart
                        data={reportData.topExpenseBarData}
                        title="Top Expense Categories"
                        subtitle="Your biggest spending categories"
                        limit={8}
                    />
                </Card>
            )}

            {/* Income Categories - Donut Chart */}
            {reportData.incomePieData.length > 0 && (
                <Card style={styles.chartCard}>
                    <DonutChart
                        data={reportData.incomePieData}
                        title="Income Distribution"
                        centerValue={`$${reportData.totals.income.toFixed(0)}`}
                    />
                </Card>
            )}

            {/* Expense Categories - Donut Chart */}
            {reportData.expensePieData.length > 0 && (
                <Card style={styles.chartCard}>
                    <DonutChart
                        data={reportData.expensePieData}
                        title="Expense Distribution"
                        centerValue={`$${reportData.totals.expense.toFixed(0)}`}
                    />
                </Card>
            )}

            {/* Category Spending Trends Over Time */}
            {reportData.categoryTrendData.length > 0 && (
                <CategoryTrendChart data={reportData.categoryTrendData} />
            )}

            {/* Spending Heatmap */}
            {reportData.heatmapData.length > 0 && (
                <SpendingHeatmap
                    data={reportData.heatmapData}
                    startDate={dateRange.start}
                    endDate={dateRange.end}
                />
            )}
        </>
    );
};

const styles = StyleSheet.create({
    chartCard: {
        marginBottom: 12,
    },
});