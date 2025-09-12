import React from 'react';
import {
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { CartesianChart, Line } from 'victory-native';
import { useTheme } from '../../../app/providers/ThemeProvider';
import Card from '../../../components/ui/Card';

interface TrendData {
    date: string;
    income: number;
    expense: number;
    net: number;
}

interface TrendChartProps {
    data: TrendData[];
    title: string;
}

export const TrendChart: React.FC<TrendChartProps> = ({ data, title }) => {
    const { theme } = useTheme();

    if (data.length === 0) return null;

    // Calculate max value for better scaling
    // const maxValue = Math.max(
    //     ...data.map(d => Math.max(d.income, d.expense)),
    //     100 // Minimum scale
    // );

    // Only show value labels if we have 8 or fewer data points to avoid clutter
    const showValueLabels = data.length <= 8;

    return (
        <Card style={styles.chartCard}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                {title}
            </Text>

            {/* Chart Legend - moved to top for better visibility */}
            <View style={styles.topLegend}>
                <View style={styles.legendRow}>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: theme.colors.income.main }]} />
                        <Text style={[styles.legendLabel, { color: theme.colors.text }]}>Income</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: theme.colors.expense.main }]} />
                        <Text style={[styles.legendLabel, { color: theme.colors.text }]}>Expenses</Text>
                    </View>
                </View>
                {showValueLabels && (
                    <Text style={[styles.valueLabelsNote, { color: theme.colors.textSecondary }]}>
                        Values shown on chart points
                    </Text>
                )}
            </View>

            {/* Chart with axis labels */}
            <View style={styles.chartWithLabels}>
                {/* Y-axis label */}
                <View style={styles.yAxisLabel}>
                    <Text style={[styles.yAxisLabelText, { color: theme.colors.textSecondary }]}>
                        A{'\n'}m{'\n'}o{'\n'}u{'\n'}n{'\n'}t{'\n'}{'\n'}({'\n'}${'\n'})
                    </Text>
                </View>

                {/* Chart container */}
                <View style={styles.chartContainer}>
                    <CartesianChart
                        data={data}
                        xKey="date"
                        yKeys={["income", "expense"]}
                        axisOptions={{
                            tickCount: Math.min(data.length, 6),
                            labelColor: theme.colors.textSecondary,
                            formatYLabel: (v: number) => `$${v.toFixed(0)}`,
                            formatXLabel: (label: string) => label,
                        }}
                    >
                        {({ points }) => (
                            <>
                                {/* Income Line */}
                                <Line
                                    points={points.income}
                                    color={theme.colors.income.main}
                                    strokeWidth={3}
                                />

                                {/* Expense Line */}
                                <Line
                                    points={points.expense}
                                    color={theme.colors.expense.main}
                                    strokeWidth={3}
                                />
                            </>
                        )}
                    </CartesianChart>
                </View>
            </View>

            {/* X-axis label */}
            <View style={styles.xAxisLabel}>
                <Text style={[styles.axisLabelText, { color: theme.colors.textSecondary }]}>
                    Time Period
                </Text>
            </View>

            {/* Data Values Table - only show if data is manageable */}
            {showValueLabels && (
                <View style={styles.dataTable}>
                    <Text style={[styles.dataTableTitle, { color: theme.colors.text }]}>
                        Period Values
                    </Text>
                    <View style={styles.dataTableHeader}>
                        <Text style={[styles.tableHeaderCell, { color: theme.colors.textSecondary }]}>
                            Period
                        </Text>
                        <Text style={[styles.tableHeaderCell, { color: theme.colors.income.main }]}>
                            Income
                        </Text>
                        <Text style={[styles.tableHeaderCell, { color: theme.colors.expense.main }]}>
                            Expenses
                        </Text>
                        <Text style={[styles.tableHeaderCell, { color: theme.colors.text }]}>
                            Net
                        </Text>
                    </View>
                    {data.map((item, index) => (
                        <View key={`data-row-${index}`} style={styles.dataTableRow}>
                            <Text style={[styles.tableCell, { color: theme.colors.text }]}>
                                {item.date}
                            </Text>
                            <Text style={[styles.tableCell, { color: theme.colors.income.main }]}>
                                ${item.income.toFixed(0)}
                            </Text>
                            <Text style={[styles.tableCell, { color: theme.colors.expense.main }]}>
                                ${item.expense.toFixed(0)}
                            </Text>
                            <Text style={[
                                styles.tableCell,
                                { color: item.net >= 0 ? theme.colors.income.main : theme.colors.expense.main }
                            ]}>
                                ${Math.abs(item.net).toFixed(0)}
                            </Text>
                        </View>
                    ))}
                </View>
            )}

            {/* Summary stats */}
            <View style={styles.chartStats}>
                <View style={styles.statItem}>
                    <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                        Total Income
                    </Text>
                    <Text style={[styles.statValue, { color: theme.colors.income.main }]}>
                        ${data.reduce((sum, d) => sum + d.income, 0).toFixed(0)}
                    </Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                        Total Expenses
                    </Text>
                    <Text style={[styles.statValue, { color: theme.colors.expense.main }]}>
                        ${data.reduce((sum, d) => sum + d.expense, 0).toFixed(0)}
                    </Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                        Net Amount
                    </Text>
                    <Text style={[
                        styles.statValue,
                        {
                            color: data.reduce((sum, d) => sum + d.net, 0) >= 0
                                ? theme.colors.income.main
                                : theme.colors.expense.main
                        }
                    ]}>
                        ${Math.abs(data.reduce((sum, d) => sum + d.net, 0)).toFixed(0)}
                    </Text>
                </View>
            </View>
        </Card>
    );
};

const styles = StyleSheet.create({
    chartCard: {
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12,
        textAlign: 'center',
    },
    topLegend: {
        marginBottom: 16,
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: 'rgba(0, 0, 0, 0.02)',
        borderRadius: 8,
        alignItems: 'center',
    },
    legendRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 24,
        marginBottom: 4,
    },
    chartWithLabels: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 8,
    },
    yAxisLabel: {
        width: 60,
        height: 240,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    chartContainer: {
        flex: 1,
        height: 240,
    },
    xAxisLabel: {
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 12,
    },
    axisLabelText: {
        fontSize: 12,
        fontWeight: '500',
    },
    yAxisLabelText: {
        fontSize: 10,
        fontWeight: '500',
        textAlign: 'center',
        lineHeight: 12,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
    },
    legendDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 6,
    },
    legendLabel: {
        fontSize: 13,
        fontWeight: '500',
    },
    valueLabelsNote: {
        fontSize: 10,
        fontStyle: 'italic',
        marginTop: 2,
    },
    dataTable: {
        marginVertical: 8,
        backgroundColor: 'rgba(0, 0, 0, 0.02)',
        borderRadius: 8,
        padding: 12,
    },
    dataTableTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        textAlign: 'center',
    },
    dataTableHeader: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0, 0, 0, 0.1)',
        paddingBottom: 8,
        marginBottom: 8,
    },
    dataTableRow: {
        flexDirection: 'row',
        paddingVertical: 4,
    },
    tableHeaderCell: {
        flex: 1,
        fontSize: 11,
        fontWeight: '600',
        textAlign: 'center',
    },
    tableCell: {
        flex: 1,
        fontSize: 11,
        textAlign: 'center',
        fontWeight: '500',
    },
    chartStats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0, 0, 0, 0.08)',
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statLabel: {
        fontSize: 11,
        fontWeight: '400',
        marginBottom: 4,
        textAlign: 'center',
    },
    statValue: {
        fontSize: 14,
        fontWeight: '700',
    },
});