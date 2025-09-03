import dayjs from 'dayjs';
import React from 'react';
import {
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../app/providers/ThemeProvider';
import Card from '../../../components/ui/Card';
import Chip from '../../../components/ui/Chip';
import { MonthYearPicker } from './MonthYearPicker';
import { YearPicker } from './YearPicker';

export type ReportPeriod = 'daily' | 'monthly' | 'yearly' | 'custom';

interface PeriodSelectorProps {
    selectedPeriod: ReportPeriod;
    currentDate: dayjs.Dayjs;
    dateLabel: string;
    onPeriodChange: (period: ReportPeriod) => void;
    onDateChange: (date: dayjs.Dayjs) => void;
    onNavigatePeriod: (direction: 'prev' | 'next') => void;
    showDatePicker: boolean;
    showMonthPicker: boolean;
    showYearPicker: boolean;
    onShowDatePicker: (show: boolean) => void;
    onShowMonthPicker: (show: boolean) => void;
    onShowYearPicker: (show: boolean) => void;
}

export const PeriodSelector: React.FC<PeriodSelectorProps> = ({
    selectedPeriod,
    currentDate,
    dateLabel,
    onPeriodChange,
    onDateChange,
    onNavigatePeriod,
    showDatePicker,
    showMonthPicker,
    showYearPicker,
    onShowDatePicker,
    onShowMonthPicker,
    onShowYearPicker,
}) => {
    const { theme } = useTheme();

    const handleDatePickerChange = (event: any, selectedDate?: Date) => {
        onShowDatePicker(Platform.OS === 'ios');
        if (selectedDate) {
            onDateChange(dayjs(selectedDate));
        }
    };

    return (
        <>
            {/* Period Tabs */}
            <Card>
                <View style={styles.periodTabs}>
                    {(['daily', 'monthly', 'yearly', 'custom'] as ReportPeriod[]).map((period) => {
                        let label = period.charAt(0).toUpperCase() + period.slice(1);
                        if (period === 'custom') label = 'Compare';
                        
                        return (
                            <Chip
                                key={period}
                                label={label}
                                selected={selectedPeriod === period}
                                onPress={() => onPeriodChange(period)}
                                style={styles.periodTab}
                            />
                        );
                    })}
                </View>
            </Card>

            {/* Date Navigator */}
            {selectedPeriod !== 'custom' && (
                <Card style={styles.dateSelector}>
                    <View style={styles.dateSelectorContent}>
                        <TouchableOpacity
                            style={[styles.dateButton, { backgroundColor: theme.colors.surface }]}
                            onPress={() => onNavigatePeriod('prev')}
                        >
                            <Icon name="chevron-back" size={20} color={theme.colors.text} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.dateDisplayButton}
                            onPress={() => {
                                if (selectedPeriod === 'daily') onShowDatePicker(true);
                                else if (selectedPeriod === 'monthly') onShowMonthPicker(true);
                                else if (selectedPeriod === 'yearly') onShowYearPicker(true);
                            }}
                        >
                            <Text style={[styles.dateText, { color: theme.colors.text }]}>
                                {dateLabel}
                            </Text>
                            <Icon name="calendar" size={16} color={theme.colors.textSecondary} style={styles.calendarIcon} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.dateButton, { backgroundColor: theme.colors.surface }]}
                            onPress={() => onNavigatePeriod('next')}
                        >
                            <Icon name="chevron-forward" size={20} color={theme.colors.text} />
                        </TouchableOpacity>
                    </View>
                </Card>
            )}

            {/* Date Picker for Daily */}
            {showDatePicker && selectedPeriod === 'daily' && (
                <DateTimePicker
                    value={currentDate.toDate()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleDatePickerChange}
                />
            )}

            {/* Month-Year Picker */}
            <MonthYearPicker
                visible={showMonthPicker}
                value={currentDate}
                onSelect={onDateChange}
                onClose={() => onShowMonthPicker(false)}
                title="Select Month & Year"
            />

            {/* Year Picker */}
            <YearPicker
                visible={showYearPicker}
                value={currentDate}
                onSelect={onDateChange}
                onClose={() => onShowYearPicker(false)}
                title="Select Year"
            />
        </>
    );
};

const styles = StyleSheet.create({
    periodTabs: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8,
    },
    periodTab: {
        flex: 1,
    },
    dateSelector: {
        marginVertical: 8,
    },
    dateSelectorContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    dateButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dateDisplayButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    },
    dateText: {
        fontSize: 18,
        fontWeight: '600',
    },
    calendarIcon: {
        marginLeft: 8,
    },
});