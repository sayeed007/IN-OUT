import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions } from 'react-native';
import dayjs, { Dayjs } from 'dayjs';
import { useTheme } from '../../../app/providers/ThemeProvider';
import Card from '../../../components/ui/Card';

const { width: screenWidth } = Dimensions.get('window');

interface DayData {
    date: string;
    amount: number;
    transactionCount: number;
}

interface SpendingHeatmapProps {
    data: DayData[];
    startDate: Dayjs;
    endDate: Dayjs;
    title?: string;
}

export const SpendingHeatmap: React.FC<SpendingHeatmapProps> = ({
    data,
    startDate,
    endDate,
    title = 'Spending Calendar'
}) => {
    const { theme } = useTheme();
    const [selectedDay, setSelectedDay] = useState<DayData | null>(null);

    // Calculate max amount for intensity scaling
    const maxAmount = Math.max(...data.map(d => d.amount), 1);

    // Get intensity color based on spending amount
    const getIntensityColor = (amount: number) => {
        if (amount === 0) return theme.colors.surfaceVariant;

        const intensity = amount / maxAmount;
        if (intensity >= 0.75) return theme.colors.error[600];
        if (intensity >= 0.5) return theme.colors.error[500];
        if (intensity >= 0.25) return theme.colors.warning[500];
        return theme.colors.warning[50];
    };

    // Generate calendar grid
    const generateCalendar = () => {
        const weeks: DayData[][] = [];
        let currentWeek: DayData[] = [];

        // Start from the beginning of the week containing startDate
        let current = startDate.startOf('week');
        const end = endDate.endOf('week');

        while (current.isBefore(end) || current.isSame(end, 'day')) {
            const dateStr = current.format('YYYY-MM-DD');
            const dayData = data.find(d => d.date === dateStr) || {
                date: dateStr,
                amount: 0,
                transactionCount: 0,
            };

            currentWeek.push(dayData);

            if (currentWeek.length === 7) {
                weeks.push(currentWeek);
                currentWeek = [];
            }

            current = current.add(1, 'day');
        }

        if (currentWeek.length > 0) {
            weeks.push(currentWeek);
        }

        return weeks;
    };

    const weeks = generateCalendar();
    const cellSize = (screenWidth - 80) / 7;

    return (
        <Card style={styles.container}>
            <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                Daily spending intensity heatmap
            </Text>

            {/* Day of week headers */}
            <View style={styles.weekHeader}>
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                    <Text
                        key={`day-${index}`}
                        style={[
                            styles.weekDay,
                            { color: theme.colors.textSecondary, width: cellSize }
                        ]}
                    >
                        {day}
                    </Text>
                ))}
            </View>

            {/* Calendar grid */}
            <View style={styles.calendar}>
                {weeks.map((week, weekIndex) => (
                    <View key={`week-${weekIndex}`} style={styles.week}>
                        {week.map((day, dayIndex) => {
                            const isOutOfRange = dayjs(day.date).isBefore(startDate, 'day') ||
                                dayjs(day.date).isAfter(endDate, 'day');
                            const isToday = dayjs(day.date).isSame(dayjs(), 'day');
                            const isSelected = selectedDay?.date === day.date;

                            return (
                                <TouchableOpacity
                                    key={`day-${weekIndex}-${dayIndex}`}
                                    style={[
                                        styles.dayCell,
                                        {
                                            width: cellSize,
                                            height: cellSize,
                                            backgroundColor: isOutOfRange
                                                ? 'transparent'
                                                : getIntensityColor(day.amount),
                                            borderColor: isToday ? theme.colors.primary[500] : 'transparent',
                                            borderWidth: isToday ? 2 : isSelected ? 2 : 1,
                                            opacity: isOutOfRange ? 0.3 : 1,
                                        }
                                    ]}
                                    onPress={() => !isOutOfRange && setSelectedDay(day)}
                                    disabled={isOutOfRange}
                                    activeOpacity={0.7}
                                >
                                    <Text
                                        style={[
                                            styles.dayNumber,
                                            {
                                                color: day.amount > 0
                                                    ? '#FFFFFF'
                                                    : theme.colors.textSecondary
                                            }
                                        ]}
                                    >
                                        {dayjs(day.date).format('D')}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                ))}
            </View>

            {/* Selected day info */}
            {selectedDay && selectedDay.amount > 0 && (
                <View style={[styles.selectedInfo, { backgroundColor: theme.colors.surfaceVariant }]}>
                    <Text style={[styles.selectedDate, { color: theme.colors.text }]}>
                        {dayjs(selectedDay.date).format('MMM D, YYYY')}
                    </Text>
                    <View style={styles.selectedStats}>
                        <View style={styles.selectedStat}>
                            <Text style={[styles.selectedLabel, { color: theme.colors.textSecondary }]}>
                                Spent
                            </Text>
                            <Text style={[styles.selectedValue, { color: theme.colors.error[500] }]}>
                                ${selectedDay.amount.toFixed(0)}
                            </Text>
                        </View>
                        <View style={styles.selectedStat}>
                            <Text style={[styles.selectedLabel, { color: theme.colors.textSecondary }]}>
                                Transactions
                            </Text>
                            <Text style={[styles.selectedValue, { color: theme.colors.primary[500] }]}>
                                {selectedDay.transactionCount}
                            </Text>
                        </View>
                    </View>
                </View>
            )}

            {/* Legend */}
            <View style={styles.legend}>
                <Text style={[styles.legendLabel, { color: theme.colors.textSecondary }]}>
                    Less
                </Text>
                <View style={styles.legendColors}>
                    <View style={[styles.legendBox, { backgroundColor: theme.colors.surfaceVariant }]} />
                    <View style={[styles.legendBox, { backgroundColor: theme.colors.warning[50] }]} />
                    <View style={[styles.legendBox, { backgroundColor: theme.colors.warning[500] }]} />
                    <View style={[styles.legendBox, { backgroundColor: theme.colors.error[500] }]} />
                    <View style={[styles.legendBox, { backgroundColor: theme.colors.error[600] }]} />
                </View>
                <Text style={[styles.legendLabel, { color: theme.colors.textSecondary }]}>
                    More
                </Text>
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
    weekHeader: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    weekDay: {
        fontSize: 10,
        fontWeight: '600',
        textAlign: 'center',
    },
    calendar: {
        gap: 4,
    },
    week: {
        flexDirection: 'row',
        gap: 4,
    },
    dayCell: {
        aspectRatio: 1,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.06)',
    },
    dayNumber: {
        fontSize: 10,
        fontWeight: '600',
    },
    selectedInfo: {
        marginTop: 16,
        padding: 12,
        borderRadius: 12,
    },
    selectedDate: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 12,
        textAlign: 'center',
    },
    selectedStats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    selectedStat: {
        alignItems: 'center',
    },
    selectedLabel: {
        fontSize: 11,
        fontWeight: '500',
        marginBottom: 4,
    },
    selectedValue: {
        fontSize: 16,
        fontWeight: '700',
    },
    legend: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 16,
        gap: 8,
    },
    legendLabel: {
        fontSize: 10,
        fontWeight: '500',
    },
    legendColors: {
        flexDirection: 'row',
        gap: 4,
    },
    legendBox: {
        width: 16,
        height: 16,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.1)',
    },
});
