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

export type ComparisonType = 'dates' | 'months' | 'years';

export interface ComparisonItem {
    id: string;
    label: string;
    start: dayjs.Dayjs;
    end: dayjs.Dayjs;
}

export interface CustomPeriodState {
    comparisonType: ComparisonType;
    items: ComparisonItem[];
    isAddingNew: boolean;
    selectedDate?: dayjs.Dayjs;
    selectedMonth?: dayjs.Dayjs;
    selectedYear?: dayjs.Dayjs;
}

interface CustomComparisonProps {
    customPeriod: CustomPeriodState;
    onUpdateCustomPeriod: (state: CustomPeriodState) => void;
    showDatePicker: boolean;
    showMonthPicker: boolean;
    showYearPicker: boolean;
    onShowDatePicker: (show: boolean) => void;
    onShowMonthPicker: (show: boolean) => void;
    onShowYearPicker: (show: boolean) => void;
    onAddItem: () => void;
    onRemoveItem: (id: string) => void;
}

export const CustomComparison: React.FC<CustomComparisonProps> = ({
    customPeriod,
    onUpdateCustomPeriod,
    showDatePicker,
    showMonthPicker,
    showYearPicker,
    onShowDatePicker,
    onShowMonthPicker,
    onShowYearPicker,
    onAddItem,
    onRemoveItem,
}) => {
    const { theme } = useTheme();

    const handleComparisonTypeChange = (type: ComparisonType) => {
        onUpdateCustomPeriod({
            comparisonType: type,
            items: [],
            isAddingNew: false,
        });
    };

    const handleAddNewClick = () => {
        onUpdateCustomPeriod({ ...customPeriod, isAddingNew: true });
        if (customPeriod.comparisonType === 'dates') onShowDatePicker(true);
        else if (customPeriod.comparisonType === 'months') onShowMonthPicker(true);
        else if (customPeriod.comparisonType === 'years') onShowYearPicker(true);
    };

    const handleDatePickerChange = (event: any, date?: Date) => {
        onShowDatePicker(Platform.OS === 'ios');
        if (date) {
            onUpdateCustomPeriod({
                ...customPeriod,
                selectedDate: dayjs(date)
            });
            if (Platform.OS === 'android') {
                setTimeout(() => onAddItem(), 100);
            }
        }
    };

    const handleMonthPickerSelect = (date: dayjs.Dayjs) => {
        onUpdateCustomPeriod({
            ...customPeriod,
            selectedMonth: date
        });
        setTimeout(() => onAddItem(), 100);
    };

    const handleYearPickerSelect = (date: dayjs.Dayjs) => {
        onUpdateCustomPeriod({
            ...customPeriod,
            selectedYear: date
        });
        setTimeout(() => onAddItem(), 100);
    };

    return (
        <>
            <Card style={styles.customPeriodCard}>
                <Text style={[styles.customPeriodTitle, { color: theme.colors.text }]}>
                    Comparison Settings
                </Text>
                
                {/* Comparison Type Selector */}
                <View style={styles.comparisonTypeTabs}>
                    {(['dates', 'months', 'years'] as ComparisonType[]).map((type) => (
                        <Chip
                            key={type}
                            label={type.charAt(0).toUpperCase() + type.slice(1)}
                            selected={customPeriod.comparisonType === type}
                            onPress={() => handleComparisonTypeChange(type)}
                            style={styles.comparisonTypeTab}
                        />
                    ))}
                </View>

                {/* Selected Items */}
                {customPeriod.items.length > 0 && (
                    <View style={styles.selectedItems}>
                        <Text style={[styles.selectedItemsTitle, { color: theme.colors.text }]}>
                            Selected {customPeriod.comparisonType}:
                        </Text>
                        {customPeriod.items.map((item) => (
                            <View key={`custom-${item.id}`} style={[styles.selectedItem, { backgroundColor: theme.colors.surface }]}>
                                <Text style={[styles.selectedItemText, { color: theme.colors.text }]}>
                                    {item.label}
                                </Text>
                                <TouchableOpacity
                                    onPress={() => onRemoveItem(item.id)}
                                    style={styles.removeItemButton}
                                >
                                    <Icon 
                                        name="close" 
                                        size={16} 
                                        color={typeof theme.colors.error === 'string' ? theme.colors.error : '#EF4444'} 
                                    />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                )}

                {/* Add New Button */}
                <TouchableOpacity
                    style={[styles.addPeriodButton, { backgroundColor: theme.colors.primary[500] }]}
                    onPress={handleAddNewClick}
                >
                    <Icon name="add" size={20} color={theme.colors.onPrimary} />
                    <Text style={[styles.addPeriodButtonText, { color: theme.colors.onPrimary }]}>
                        Add {customPeriod.comparisonType.slice(0, -1)}
                    </Text>
                </TouchableOpacity>
            </Card>

            {/* Date Picker for Custom Dates */}
            {showDatePicker && customPeriod.isAddingNew && customPeriod.comparisonType === 'dates' && (
                <DateTimePicker
                    value={customPeriod.selectedDate?.toDate() || new Date()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleDatePickerChange}
                />
            )}

            {/* Month-Year Picker for Custom Months */}
            <MonthYearPicker
                visible={showMonthPicker && customPeriod.isAddingNew && customPeriod.comparisonType === 'months'}
                value={customPeriod.selectedMonth || dayjs()}
                onSelect={handleMonthPickerSelect}
                onClose={() => {
                    onShowMonthPicker(false);
                    onUpdateCustomPeriod({
                        ...customPeriod,
                        isAddingNew: false,
                        selectedMonth: undefined
                    });
                }}
                title="Select Month to Compare"
            />

            {/* Year Picker for Custom Years */}
            <YearPicker
                visible={showYearPicker && customPeriod.isAddingNew && customPeriod.comparisonType === 'years'}
                value={customPeriod.selectedYear || dayjs()}
                onSelect={handleYearPickerSelect}
                onClose={() => {
                    onShowYearPicker(false);
                    onUpdateCustomPeriod({
                        ...customPeriod,
                        isAddingNew: false,
                        selectedYear: undefined
                    });
                }}
                title="Select Year to Compare"
            />
        </>
    );
};

const styles = StyleSheet.create({
    customPeriodCard: {
        marginVertical: 8,
        padding: 16,
    },
    customPeriodTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
    },
    comparisonTypeTabs: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 16,
    },
    comparisonTypeTab: {
        flex: 1,
    },
    selectedItems: {
        marginBottom: 16,
    },
    selectedItemsTitle: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
    },
    selectedItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
    },
    selectedItemText: {
        fontSize: 14,
        fontWeight: '500',
    },
    removeItemButton: {
        padding: 4,
    },
    addPeriodButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 8,
        gap: 8,
    },
    addPeriodButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
});