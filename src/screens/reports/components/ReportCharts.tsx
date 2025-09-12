import React from 'react';
import { StyleSheet } from 'react-native';
import Card from '../../../components/ui/Card';
import { PieChart } from './PieChart';
import { TrendChart } from './TrendChart';
import { ReportData } from '../hooks/useReportData';

interface ReportChartsProps {
    reportData: ReportData;
    trendChartTitle: string;
}

export const ReportCharts: React.FC<ReportChartsProps> = ({
    reportData,
    trendChartTitle,
}) => {
    return (
        <>
            {/* Trend Chart */}
            <TrendChart
                data={reportData.trendData}
                title={trendChartTitle}
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
        </>
    );
};

const styles = StyleSheet.create({
    chartCard: {
        marginBottom: 12,
    },
});