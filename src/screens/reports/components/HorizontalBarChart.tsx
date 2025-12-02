import React from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../app/providers/ThemeProvider';

const { width: screenWidth } = Dimensions.get('window');
const maxBarWidth = screenWidth - 160;

interface BarChartData {
    label: string;
    value: number;
    color: string;
    icon?: string;
    percentage?: number;
}

interface HorizontalBarChartProps {
    data: BarChartData[];
    title: string;
    subtitle?: string;
    limit?: number;
}

export const HorizontalBarChart: React.FC<HorizontalBarChartProps> = ({
    data,
    title,
    subtitle,
    limit = 10
}) => {
    const { theme } = useTheme();

    if (data.length === 0) return null;

    // Limit to top N items
    const displayData = data.slice(0, limit);
    const maxValue = Math.max(...displayData.map(item => item.value));

    const formatAmount = (amount: number) => {
        if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}k`;
        return `$${amount.toFixed(0)}`;
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
                {subtitle && (
                    <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                        {subtitle}
                    </Text>
                )}
            </View>

            <View style={styles.barsContainer}>
                {displayData.map((item, index) => {
                    const barWidth = (item.value / maxValue) * maxBarWidth;
                    const percentage = item.percentage || (item.value / maxValue) * 100;

                    return (
                        <View key={`bar-${index}`} style={styles.barRow}>
                            <View style={styles.labelContainer}>
                                {item.icon && (
                                    <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
                                        <Icon name={item.icon} size={16} color={item.color} />
                                    </View>
                                )}
                                <Text
                                    style={[styles.label, { color: theme.colors.text }]}
                                    numberOfLines={1}
                                    ellipsizeMode="tail"
                                >
                                    {item.label}
                                </Text>
                            </View>

                            <View style={styles.barContainer}>
                                <View
                                    style={[
                                        styles.bar,
                                        {
                                            width: barWidth,
                                            backgroundColor: item.color,
                                        }
                                    ]}
                                >
                                    <View style={[styles.barGradient, { backgroundColor: item.color }]} />
                                </View>
                            </View>

                            <View style={styles.valueContainer}>
                                <Text style={[styles.value, { color: theme.colors.text }]}>
                                    {formatAmount(item.value)}
                                </Text>
                                <Text style={[styles.percentage, { color: theme.colors.textSecondary }]}>
                                    {percentage.toFixed(0)}%
                                </Text>
                            </View>
                        </View>
                    );
                })}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: 8,
    },
    header: {
        marginBottom: 16,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 12,
        fontWeight: '400',
    },
    barsContainer: {
        gap: 12,
    },
    barRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    labelContainer: {
        width: 100,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    iconContainer: {
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    label: {
        fontSize: 12,
        fontWeight: '500',
        flex: 1,
    },
    barContainer: {
        flex: 1,
        height: 24,
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        borderRadius: 12,
        overflow: 'hidden',
    },
    bar: {
        height: '100%',
        borderRadius: 12,
        justifyContent: 'center',
        paddingLeft: 8,
        minWidth: 2,
    },
    barGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0.8,
        borderRadius: 12,
    },
    valueContainer: {
        width: 60,
        alignItems: 'flex-end',
    },
    value: {
        fontSize: 13,
        fontWeight: '700',
    },
    percentage: {
        fontSize: 10,
        fontWeight: '500',
        marginTop: 1,
    },
});
