import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../app/providers/ThemeProvider';
import Card from '../../../components/ui/Card';

interface KeyMetrics {
    avgDailySpending: number;
    savingsRate: number;
    topCategory: { name: string; amount: number; icon: string; color: string };
    transactionFrequency: number;
    spendingTrend: 'up' | 'down' | 'stable';
    trendPercentage: number;
    totalTransactions: number;
    avgTransactionSize: number;
}

interface KeyMetricsCardProps {
    metrics: KeyMetrics;
    title?: string;
}

export const KeyMetricsCard: React.FC<KeyMetricsCardProps> = ({
    metrics,
    title = 'Key Insights'
}) => {
    const { theme } = useTheme();

    const getTrendIcon = () => {
        switch (metrics.spendingTrend) {
            case 'up': return 'trending-up';
            case 'down': return 'trending-down';
            default: return 'remove';
        }
    };

    const getTrendColor = () => {
        switch (metrics.spendingTrend) {
            case 'up': return theme.colors.error[500];
            case 'down': return theme.colors.success[500];
            default: return theme.colors.textSecondary;
        }
    };

    const getTrendText = () => {
        switch (metrics.spendingTrend) {
            case 'up': return `${metrics.trendPercentage.toFixed(1)}% increase`;
            case 'down': return `${metrics.trendPercentage.toFixed(1)}% decrease`;
            default: return 'Stable';
        }
    };

    const getSavingsColor = () => {
        if (metrics.savingsRate >= 20) return theme.colors.success[600];
        if (metrics.savingsRate >= 10) return theme.colors.success[500];
        if (metrics.savingsRate >= 0) return theme.colors.warning[500];
        return theme.colors.error[500];
    };

    return (
        <Card style={styles.container}>
            <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                Financial overview at a glance
            </Text>

            <View style={styles.metricsGrid}>
                {/* Average Daily Spending */}
                <View style={[styles.metricCard, { backgroundColor: theme.colors.primary[50] || theme.colors.primary[500] + '10' }]}>
                    <View style={styles.metricHeader}>
                        <View style={[styles.metricIconContainer, { backgroundColor: theme.colors.primary[500] }]}>
                            <Icon name="calendar-outline" size={18} color="#FFFFFF" />
                        </View>
                        <Text style={[styles.metricLabel, { color: theme.colors.text }]}>
                            Daily Avg
                        </Text>
                    </View>
                    <Text style={[styles.metricValue, { color: theme.colors.primary[600] || theme.colors.primary[500] }]}>
                        ${metrics.avgDailySpending.toFixed(0)}
                    </Text>
                    <Text style={[styles.metricHint, { color: theme.colors.textSecondary }]}>
                        per day
                    </Text>
                </View>

                {/* Savings Rate */}
                <View style={[styles.metricCard, { backgroundColor: getSavingsColor() + '10' }]}>
                    <View style={styles.metricHeader}>
                        <View style={[styles.metricIconContainer, { backgroundColor: getSavingsColor() }]}>
                            <Icon name="wallet-outline" size={18} color="#FFFFFF" />
                        </View>
                        <Text style={[styles.metricLabel, { color: theme.colors.text }]}>
                            Savings
                        </Text>
                    </View>
                    <Text style={[styles.metricValue, { color: getSavingsColor() }]}>
                        {metrics.savingsRate.toFixed(1)}%
                    </Text>
                    <Text style={[styles.metricHint, { color: theme.colors.textSecondary }]}>
                        {metrics.savingsRate >= 0 ? 'saved' : 'deficit'}
                    </Text>
                </View>

                {/* Transaction Frequency */}
                <View style={[styles.metricCard, { backgroundColor: theme.colors.info[50] || theme.colors.info[500] + '10' }]}>
                    <View style={styles.metricHeader}>
                        <View style={[styles.metricIconContainer, { backgroundColor: theme.colors.info[500] }]}>
                            <Icon name="repeat-outline" size={18} color="#FFFFFF" />
                        </View>
                        <Text style={[styles.metricLabel, { color: theme.colors.text }]}>
                            Frequency
                        </Text>
                    </View>
                    <Text style={[styles.metricValue, { color: theme.colors.info[600] || theme.colors.info[500] }]}>
                        {metrics.transactionFrequency.toFixed(1)}
                    </Text>
                    <Text style={[styles.metricHint, { color: theme.colors.textSecondary }]}>
                        per day
                    </Text>
                </View>

                {/* Spending Trend */}
                <View style={[styles.metricCard, { backgroundColor: getTrendColor() + '10' }]}>
                    <View style={styles.metricHeader}>
                        <View style={[styles.metricIconContainer, { backgroundColor: getTrendColor() }]}>
                            <Icon name={getTrendIcon()} size={18} color="#FFFFFF" />
                        </View>
                        <Text style={[styles.metricLabel, { color: theme.colors.text }]}>
                            Trend
                        </Text>
                    </View>
                    <Text style={[styles.metricValue, { color: getTrendColor() }]}>
                        {getTrendText()}
                    </Text>
                    <Text style={[styles.metricHint, { color: theme.colors.textSecondary }]}>
                        vs previous
                    </Text>
                </View>
            </View>

            {/* Top Category Highlight */}
            <View style={[styles.topCategoryCard, { backgroundColor: theme.colors.surfaceVariant }]}>
                <View style={styles.topCategoryHeader}>
                    <Icon name="star" size={16} color={theme.colors.warning[500]} />
                    <Text style={[styles.topCategoryLabel, { color: theme.colors.text }]}>
                        Top Spending Category
                    </Text>
                </View>
                <View style={styles.topCategoryContent}>
                    <View style={[styles.topCategoryIcon, { backgroundColor: metrics.topCategory.color }]}>
                        <Icon name={metrics.topCategory.icon} size={24} color="#FFFFFF" />
                    </View>
                    <View style={styles.topCategoryDetails}>
                        <Text style={[styles.topCategoryName, { color: theme.colors.text }]}>
                            {metrics.topCategory.name}
                        </Text>
                        <Text style={[styles.topCategoryAmount, { color: theme.colors.textSecondary }]}>
                            ${metrics.topCategory.amount.toFixed(0)} spent
                        </Text>
                    </View>
                </View>
            </View>

            {/* Additional Stats */}
            <View style={styles.additionalStats}>
                <View style={styles.statRow}>
                    <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                        Total Transactions
                    </Text>
                    <Text style={[styles.statValue, { color: theme.colors.text }]}>
                        {metrics.totalTransactions}
                    </Text>
                </View>
                <View style={styles.statRow}>
                    <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                        Avg Transaction Size
                    </Text>
                    <Text style={[styles.statValue, { color: theme.colors.text }]}>
                        ${metrics.avgTransactionSize.toFixed(0)}
                    </Text>
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
    metricsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 16,
    },
    metricCard: {
        flex: 1,
        minWidth: '47%',
        padding: 12,
        borderRadius: 12,
    },
    metricHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 8,
    },
    metricIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    metricLabel: {
        fontSize: 12,
        fontWeight: '600',
    },
    metricValue: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 2,
    },
    metricHint: {
        fontSize: 10,
        fontWeight: '500',
    },
    topCategoryCard: {
        padding: 12,
        borderRadius: 12,
        marginBottom: 12,
    },
    topCategoryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 12,
    },
    topCategoryLabel: {
        fontSize: 12,
        fontWeight: '600',
    },
    topCategoryContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    topCategoryIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    topCategoryDetails: {
        flex: 1,
    },
    topCategoryName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    topCategoryAmount: {
        fontSize: 13,
        fontWeight: '500',
    },
    additionalStats: {
        gap: 8,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0, 0, 0, 0.06)',
    },
    statRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 12,
        fontWeight: '500',
    },
    statValue: {
        fontSize: 13,
        fontWeight: '700',
    },
});
