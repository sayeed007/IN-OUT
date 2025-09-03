import React from 'react';
import {
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useTheme } from '../../../app/providers/ThemeProvider';

interface PieChartData {
    label: string;
    value: number;
    color: string;
}

interface PieChartProps {
    data: PieChartData[];
    title: string;
}

export const PieChart: React.FC<PieChartProps> = ({ data, title }) => {
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
                        <View key={`pie-${index}`} style={styles.legendItem}>
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

const styles = StyleSheet.create({
    pieChartContainer: {
        alignItems: 'center',
    },
    chartTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
        textAlign: 'center',
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
});