import React from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../app/providers/ThemeProvider';
import Card from '../../../components/ui/Card';

const { width: screenWidth } = Dimensions.get('window');

interface CategoryTrendData {
    period: string;
    categories: {
        name: string;
        value: number;
        color: string;
        icon: string;
    }[];
    total: number;
}

interface CategoryTrendChartProps {
    data: CategoryTrendData[];
    title?: string;
}

export const CategoryTrendChart: React.FC<CategoryTrendChartProps> = ({
    data,
    title = 'Category Spending Trends'
}) => {
    const { theme } = useTheme();

    if (data.length === 0) return null;

    const maxTotal = Math.max(...data.map(d => d.total));
    const barWidth = Math.min((screenWidth - 80) / data.length, 80);
    const chartHeight = 240;

    // Get unique categories across all periods
    const allCategories = Array.from(
        new Set(data.flatMap(d => d.categories.map(c => c.name)))
    );

    // Get category info (color, icon) from the first occurrence
    const categoryInfo = new Map<string, { color: string; icon: string }>();
    data.forEach(period => {
        period.categories.forEach(cat => {
            if (!categoryInfo.has(cat.name)) {
                categoryInfo.set(cat.name, { color: cat.color, icon: cat.icon });
            }
        });
    });

    return (
        <Card style={styles.container}>
            <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                Compare spending across categories over time
            </Text>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.chartContainer}>
                    {/* Y-axis labels */}
                    <View style={styles.yAxis}>
                        {[4, 3, 2, 1, 0].map((tick) => {
                            const value = (maxTotal * tick) / 4;
                            const label = value >= 1000 ? `$${(value / 1000).toFixed(1)}k` : `$${value.toFixed(0)}`;
                            return (
                                <Text
                                    key={`y-${tick}`}
                                    style={[styles.yAxisLabel, { color: theme.colors.textSecondary }]}
                                >
                                    {label}
                                </Text>
                            );
                        })}
                    </View>

                    {/* Bars */}
                    <View style={styles.barsContainer}>
                        {data.map((period, periodIndex) => {
                            return (
                                <View key={`period-${periodIndex}`} style={styles.barColumn}>
                                    <View style={[styles.barStack, { height: chartHeight }]}>
                                        {/* Stack bars from bottom to top */}
                                        {allCategories.map(categoryName => {
                                            const category = period.categories.find(c => c.name === categoryName);
                                            if (!category) return null;

                                            const segmentHeight = (category.value / maxTotal) * chartHeight;
                                            const segment = (
                                                <View
                                                    key={`${periodIndex}-${categoryName}`}
                                                    style={[
                                                        styles.barSegment,
                                                        {
                                                            height: segmentHeight,
                                                            backgroundColor: category.color,
                                                            width: barWidth - 8,
                                                        }
                                                    ]}
                                                />
                                            );

                                            return segment;
                                        })}
                                    </View>

                                    {/* Period label */}
                                    <Text
                                        style={[styles.xAxisLabel, { color: theme.colors.textSecondary }]}
                                        numberOfLines={1}
                                    >
                                        {period.period}
                                    </Text>

                                    {/* Total amount */}
                                    <Text
                                        style={[styles.totalLabel, { color: theme.colors.text }]}
                                        numberOfLines={1}
                                    >
                                        ${period.total >= 1000 ? (period.total / 1000).toFixed(1) + 'k' : period.total.toFixed(0)}
                                    </Text>
                                </View>
                            );
                        })}
                    </View>
                </View>
            </ScrollView>

            {/* Legend */}
            <View style={styles.legend}>
                <Text style={[styles.legendTitle, { color: theme.colors.text }]}>Categories</Text>
                <View style={styles.legendItems}>
                    {allCategories.slice(0, 6).map((categoryName, index) => {
                        const info = categoryInfo.get(categoryName);
                        if (!info) return null;

                        return (
                            <View key={`legend-${index}`} style={styles.legendItem}>
                                <View style={[styles.legendDot, { backgroundColor: info.color }]} />
                                <Icon name={info.icon} size={12} color={info.color} style={styles.legendIcon} />
                                <Text
                                    style={[styles.legendLabel, { color: theme.colors.text }]}
                                    numberOfLines={1}
                                >
                                    {categoryName}
                                </Text>
                            </View>
                        );
                    })}
                    {allCategories.length > 6 && (
                        <Text style={[styles.legendMore, { color: theme.colors.textSecondary }]}>
                            +{allCategories.length - 6} more
                        </Text>
                    )}
                </View>
            </View>
        </Card>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 12,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 12,
        marginBottom: 16,
    },
    scrollContent: {
        paddingHorizontal: 8,
    },
    chartContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        minHeight: 280,
    },
    yAxis: {
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        paddingRight: 8,
        height: 240,
        paddingVertical: 4,
    },
    yAxisLabel: {
        fontSize: 10,
        fontWeight: '500',
    },
    barsContainer: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'flex-end',
        paddingBottom: 40,
    },
    barColumn: {
        alignItems: 'center',
        gap: 4,
    },
    barStack: {
        justifyContent: 'flex-end',
        borderRadius: 6,
        overflow: 'hidden',
        minWidth: 40,
        backgroundColor: 'rgba(0, 0, 0, 0.04)',
    },
    barSegment: {
        borderRadius: 2,
    },
    xAxisLabel: {
        fontSize: 10,
        fontWeight: '600',
        textAlign: 'center',
        maxWidth: 60,
    },
    totalLabel: {
        fontSize: 9,
        fontWeight: '700',
        textAlign: 'center',
    },
    legend: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0, 0, 0, 0.06)',
    },
    legendTitle: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 8,
    },
    legendItems: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        maxWidth: '45%',
    },
    legendDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    legendIcon: {
        marginLeft: 2,
    },
    legendLabel: {
        fontSize: 11,
        fontWeight: '500',
        flex: 1,
    },
    legendMore: {
        fontSize: 11,
        fontWeight: '500',
        fontStyle: 'italic',
    },
});
