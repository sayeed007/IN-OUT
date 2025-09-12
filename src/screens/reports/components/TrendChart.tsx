import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { CartesianChart, Line, useChartPressState } from 'victory-native';
import { Circle, useFont } from '@shopify/react-native-skia';
import { useTheme } from '../../../app/providers/ThemeProvider';
import Card from '../../../components/ui/Card';

const { width: screenWidth } = Dimensions.get('window');
const chartWidth = screenWidth - 64;
const chartHeight = 240;

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
    const { state, isActive } = useChartPressState({ x: 0, y: { income: 0, expense: 0 } });
    const font = useFont(require('../../../assets/fonts/Roboto-Regular.ttf'), 12);

    if (data.length === 0) {
        return (
            <Card style={styles.chartCard}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                    No data available
                </Text>
            </Card>
        );
    }

    // Prepare chart data with indexed x values for better chart handling
    const chartData = data.map((d, index) => ({
        x: index,
        income: Number(d.income) || 0,
        expense: Number(d.expense) || 0,
        date: d.date,
    }));

    // Only show value labels if we have 8 or fewer data points to avoid clutter
    const showValueLabels = data.length <= 8;

    const chartStyle = {
        height: chartHeight,
        width: chartWidth,
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: 8,
    };

    return (
        <Card style={styles.chartCard}>
            <View style={styles.chartHeader}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                    {title}
                </Text>
                <Text style={[styles.chartSubtitle, { color: theme.colors.textSecondary }]}>
                    Period Analysis
                </Text>
            </View>

            <View style={styles.chartContainer}>
                <View style={chartStyle}>
                    <CartesianChart
                        data={chartData}
                        xKey="x"
                        yKeys={["income", "expense"]}
                        chartPressState={state}
                        xAxis={{
                            font,
                            tickCount: Math.min(data.length, 6),
                            lineColor: theme.colors.textSecondary,
                            lineWidth: 0.1,
                            labelColor: theme.colors.textSecondary,
                            formatXLabel: (value) => {
                                const index = Math.round(value);
                                return data[index]?.date || '';
                            },
                        }}
                        yAxis={[{
                            font,
                            tickCount: 5,
                            lineColor: theme.colors.textSecondary,
                            lineWidth: 0.1,
                            labelColor: theme.colors.textSecondary,
                            formatYLabel: (value) => {
                                if (value >= 1000) return `$${(value / 1000).toFixed(0)}k`;
                                return `$${value.toFixed(0)}`;
                            }
                        }]}
                    >
                        {({ points }) => (
                            <>
                                {/* Income Line */}
                                <Line
                                    points={points.income}
                                    color={theme.colors.income.main}
                                    strokeWidth={2}
                                    animate={{ type: "timing", duration: 300 }}
                                />
                                {/* Expense Line */}
                                <Line
                                    points={points.expense}
                                    color={theme.colors.expense.main}
                                    strokeWidth={2}
                                    animate={{ type: "timing", duration: 300 }}
                                />

                                {/* Active point indicators */}
                                {isActive && (
                                    <>
                                        <Circle
                                            cx={state.x.position}
                                            cy={state.y.income.position}
                                            r={4}
                                            color={theme.colors.income.main}
                                        />
                                        <Circle
                                            cx={state.x.position}
                                            cy={state.y.expense.position}
                                            r={4}
                                            color={theme.colors.expense.main}
                                        />
                                    </>
                                )}
                            </>
                        )}
                    </CartesianChart>
                </View>

                {/* Active data tooltip */}
                {isActive && state.x.value !== null && state.y.income.value !== null && state.y.expense.value !== null && (
                    <View style={[styles.tooltip, { backgroundColor: theme.colors.surface }]}>
                        <Text style={[styles.tooltipMonth, { color: theme.colors.text }]}>
                            {data[Math.round(state.x.value.value)]?.date}
                        </Text>
                        <Text style={[styles.tooltipValue, { color: theme.colors.income.main }]}>
                            Income: ${Math.round(state.y.income.value.value || 0).toLocaleString()}
                        </Text>
                        <Text style={[styles.tooltipValue, { color: theme.colors.expense.main }]}>
                            Expenses: ${Math.round(state.y.expense.value.value || 0).toLocaleString()}
                        </Text>
                    </View>
                )}

                {/* Legend */}
                <View style={styles.legend}>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendColor, { backgroundColor: theme.colors.income.main }]} />
                        <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>
                            Income
                        </Text>
                        <Text style={[styles.summaryValue, { color: theme.colors.income.main }]}>
                            (Avg: ${(data.reduce((sum, d) => sum + d.income, 0) / data.length).toFixed(0)})
                        </Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendColor, { backgroundColor: theme.colors.expense.main }]} />
                        <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>
                            Expenses
                        </Text>
                        <Text style={[styles.summaryValue, { color: theme.colors.expense.main }]}>
                            (Avg: ${(data.reduce((sum, d) => sum + d.expense, 0) / data.length).toFixed(0)})
                        </Text>
                    </View>
                </View>
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
        marginVertical: 12,
    },
    chartHeader: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    chartSubtitle: {
        fontSize: 12,
    },
    chartContainer: {
        alignItems: 'center',
        height: chartHeight + 35,
        width: '100%',
    },
    legend: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 24,
        marginTop: 12,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    legendColor: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 6,
    },
    legendText: {
        fontSize: 12,
        fontWeight: '500',
    },
    summaryValue: {
        fontSize: 11,
        fontWeight: '600',
        textAlign: 'right',
        marginLeft: 4,
    },
    tooltip: {
        position: 'absolute',
        top: 10,
        right: 10,
        padding: 12,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        minWidth: 120,
    },
    tooltipMonth: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 6,
        textAlign: 'center',
    },
    tooltipValue: {
        fontSize: 12,
        fontWeight: '500',
        marginBottom: 2,
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