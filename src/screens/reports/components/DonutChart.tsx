import React from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import Svg, { Circle, G, Text as SvgText } from 'react-native-svg';
import { useTheme } from '../../../app/providers/ThemeProvider';

const { width: screenWidth } = Dimensions.get('window');

interface DonutChartData {
    label: string;
    value: number;
    color: string;
}

interface DonutChartProps {
    data: DonutChartData[];
    title: string;
    centerLabel?: string;
    centerValue?: string;
}

export const DonutChart: React.FC<DonutChartProps> = ({
    data,
    title,
    centerLabel = '',
    centerValue
}) => {
    const { theme } = useTheme();

    if (data.length === 0) return null;

    const size = Math.min(screenWidth - 120, 220);
    const radius = size / 3;
    const innerRadius = radius * 0.2; // Donut hole
    const center = radius * 1.5;

    const total = data.reduce((sum, item) => sum + item.value, 0);

    // Calculate slice angles
    let currentAngle = -90; // Start from top
    const slices = data.map((item) => {
        const percentage = (item.value / total) * 100;
        const angle = (percentage / 100) * 360;
        const slice = {
            ...item,
            percentage,
            startAngle: currentAngle,
            endAngle: currentAngle + angle,
        };
        currentAngle += angle;
        return slice;
    });

    const displayValue = centerValue || `$${total.toFixed(0)}`;

    return (
        <View style={styles.container}>
            <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>

            <View style={styles.chartContainer}>
                <Svg width={size} height={size}>
                    <G>
                        {slices.map((slice, index) => (
                            <G key={`slice-${index}`}>
                                <Circle
                                    cx={center}
                                    cy={center}
                                    r={radius}
                                    fill="transparent"
                                    strokeWidth={radius - innerRadius}
                                    stroke={slice.color}
                                    strokeDasharray={`${(slice.percentage / 100) * (2 * Math.PI * radius)} ${2 * Math.PI * radius}`}
                                    strokeDashoffset={-slices.slice(0, index).reduce((sum, s) =>
                                        sum + (s.percentage / 100) * (2 * Math.PI * radius), 0
                                    )}
                                    rotation="-90"
                                    origin={`${center}, ${center}`}
                                />
                            </G>
                        ))}

                        {/* Center circle background */}
                        <Circle
                            cx={center}
                            cy={center}
                            r={innerRadius - 5}
                            fill={theme.colors.surface}
                        />

                        {/* Center text */}
                        {centerLabel && (
                            <SvgText
                                x={center}
                                y={center - 10}
                                textAnchor="middle"
                                fontSize="12"
                                fill={theme.colors.textSecondary}
                                fontWeight="500"
                            >
                                {centerLabel}
                            </SvgText>
                        )}
                        {displayValue && (
                            <SvgText
                                x={center}
                                y={centerLabel ? center + 12 : center + 5}
                                textAnchor="middle"
                                fontSize="18"
                                fill={theme.colors.text}
                                fontWeight="700"
                            >
                                {displayValue}
                            </SvgText>
                        )}
                    </G>
                </Svg>
            </View>

            {/* Legend */}
            <View style={styles.legend}>
                {slices.map((slice, index) => (
                    <View key={`legend-${index}`} style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: slice.color }]} />
                        <Text style={[styles.legendLabel, { color: theme.colors.text }]} numberOfLines={1}>
                            {slice.label}
                        </Text>
                        <View style={styles.legendValues}>
                            <Text style={[styles.legendAmount, { color: theme.colors.text }]}>
                                ${slice.value.toFixed(0)}{' '}
                                <Text style={StyleSheet.flatten([styles.legendPercentage, { color: theme.colors.textSecondary, opacity: 0.7 }])}>
                                    ({slice.percentage.toFixed(1)}%)
                                </Text>
                            </Text>
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        paddingVertical: 8,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 16,
        textAlign: 'center',
    },
    chartContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        paddingHorizontal: 16,
    },
    legend: {
        width: '100%',
        paddingHorizontal: 8,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 4,
    },
    legendDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 12,
    },
    legendLabel: {
        flex: 1,
        fontSize: 14,
        fontWeight: '500',
    },
    legendValues: {
        alignItems: 'flex-end',
        minWidth: 80,
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
