import dayjs from 'dayjs';
import React, { useEffect, useRef, useState } from 'react';
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../app/providers/ThemeProvider';

interface MonthYearPickerProps {
    visible: boolean;
    value: dayjs.Dayjs;
    onSelect: (date: dayjs.Dayjs) => void;
    onClose: () => void;
    title?: string;
}

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const ITEM_HEIGHT = 50;
const VISIBLE_ITEMS = 3;
const WHEEL_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

export const MonthYearPicker: React.FC<MonthYearPickerProps> = ({
    visible,
    value,
    onSelect,
    onClose,
    title = 'Select Month & Year'
}) => {
    const { theme } = useTheme();
    const [selectedMonth, setSelectedMonth] = useState(value.month());
    const [selectedYear, setSelectedYear] = useState(value.year());

    const monthScrollRef = useRef<ScrollView>(null);
    const yearScrollRef = useRef<ScrollView>(null);

    const currentYear = dayjs().year();
    const years = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i);

    // Sync state with value prop when component opens or value changes
    useEffect(() => {
        setSelectedMonth(value.month());
        setSelectedYear(value.year());
    }, [value]);

    useEffect(() => {
        if (visible) {
            setTimeout(() => {
                monthScrollRef.current?.scrollTo({
                    y: selectedMonth * ITEM_HEIGHT,
                    animated: false
                });
                yearScrollRef.current?.scrollTo({
                    y: years.findIndex(y => y === selectedYear) * ITEM_HEIGHT,
                    animated: false
                });
            }, 100);
        }
    }, [visible, selectedMonth, selectedYear, years]);

    const handleConfirm = () => {
        const newDate = dayjs().year(selectedYear).month(selectedMonth);
        onSelect(newDate);
        onClose();
    };

    const handleMonthScroll = (event: any) => {
        const y = event.nativeEvent.contentOffset.y;
        const index = Math.round(y / ITEM_HEIGHT);
        const clampedIndex = Math.max(0, Math.min(11, index));
        if (clampedIndex !== selectedMonth) {
            setSelectedMonth(clampedIndex);
        }
    };

    const handleYearScroll = (event: any) => {
        const y = event.nativeEvent.contentOffset.y;
        const index = Math.round(y / ITEM_HEIGHT);
        const clampedIndex = Math.max(0, Math.min(years.length - 1, index));
        const newYear = years[clampedIndex];
        if (newYear !== selectedYear) {
            setSelectedYear(newYear);
        }
    };

    if (!visible) return null;

    return (
        <Modal transparent visible={visible} animationType="slide">
            <View style={styles.overlay}>
                <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: theme.colors.text }]}>
                            {title}
                        </Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Icon name="close" size={24} color={theme.colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    {/* Selected Display */}
                    <View style={[
                        styles.selectedDisplay,
                        { backgroundColor: theme.colors.primary?.[50] || 'rgba(99, 102, 241, 0.1)' }
                    ]}>
                        <Text style={[styles.selectedLabel, { color: theme.colors.textSecondary }]}>
                            Selected:
                        </Text>
                        <Text style={[
                            styles.selectedValue,
                            { color: theme.colors.primary?.[600] || theme.colors.text }
                        ]}>
                            {dayjs().year(selectedYear).month(selectedMonth).format('MMMM YYYY')}
                        </Text>
                    </View>

                    {/* Wheel Pickers */}
                    <View style={styles.wheelContainer}>
                        {/* Month Wheel */}
                        <View style={styles.wheelSection}>
                            <Text style={[styles.wheelLabel, { color: theme.colors.text }]}>Month</Text>
                            <View style={[styles.wheelWrapper, { backgroundColor: theme.colors.background }]}>
                                <ScrollView
                                    ref={monthScrollRef}
                                    style={styles.wheel}
                                    contentContainerStyle={styles.wheelContent}
                                    showsVerticalScrollIndicator={false}
                                    snapToInterval={ITEM_HEIGHT}
                                    decelerationRate="fast"
                                    onMomentumScrollEnd={handleMonthScroll}
                                >
                                    {MONTHS.map((month, index) => (
                                        <View key={month} style={styles.wheelItem}>
                                            <Text
                                                style={[
                                                    styles.wheelItemText,
                                                    {
                                                        color: selectedMonth === index
                                                            ? theme.colors.primary?.[600] || theme.colors.text
                                                            : theme.colors.textSecondary,
                                                        fontWeight: selectedMonth === index ? ('700' as const) : ('400' as const)
                                                    }
                                                ]}
                                            >
                                                {month}
                                            </Text>
                                        </View>
                                    ))}
                                </ScrollView>
                                {/* Selection overlay */}
                                <View style={[
                                    styles.selectionOverlay,
                                    { borderColor: theme.colors.primary?.[300] || '#ccc' }
                                ]} />
                            </View>
                        </View>

                        {/* Year Wheel */}
                        <View style={styles.wheelSection}>
                            <Text style={[styles.wheelLabel, { color: theme.colors.text }]}>Year</Text>
                            <View style={[styles.wheelWrapper, { backgroundColor: theme.colors.background }]}>
                                <ScrollView
                                    ref={yearScrollRef}
                                    style={styles.wheel}
                                    contentContainerStyle={styles.wheelContent}
                                    showsVerticalScrollIndicator={false}
                                    snapToInterval={ITEM_HEIGHT}
                                    decelerationRate="fast"
                                    onMomentumScrollEnd={handleYearScroll}
                                >
                                    {years.map((year) => (
                                        <View key={year} style={styles.wheelItem}>
                                            <Text
                                                style={[
                                                    styles.wheelItemText,
                                                    {
                                                        color: selectedYear === year
                                                            ? theme.colors.primary?.[600] || theme.colors.text
                                                            : theme.colors.textSecondary,
                                                        fontWeight: selectedYear === year ? ('700' as const) : ('400' as const)
                                                    }
                                                ]}
                                            >
                                                {year}
                                            </Text>
                                        </View>
                                    ))}
                                </ScrollView>
                                {/* Selection overlay */}
                                <View style={[
                                    styles.selectionOverlay,
                                    { borderColor: theme.colors.primary?.[300] || '#ccc' }
                                ]} />
                            </View>
                        </View>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.actions}>
                        <TouchableOpacity
                            style={[
                                styles.button,
                                styles.cancelButton,
                                { borderColor: theme.colors.primary?.[200] }
                            ]}
                            onPress={onClose}
                        >
                            <Text style={[styles.buttonText, { color: theme.colors.textSecondary }]}>
                                Cancel
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.button,
                                styles.confirmButton,
                                { backgroundColor: theme.colors.primary?.[500] }
                            ]}
                            onPress={handleConfirm}
                        >
                            <Text style={[styles.buttonText, { color: theme.colors.onPrimary }]}>
                                Confirm
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    container: {
        width: '100%',
        maxWidth: 380,
        borderRadius: 16,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
    },
    closeButton: {
        padding: 4,
    },
    selectedDisplay: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    },
    selectedLabel: {
        fontSize: 12,
        marginBottom: 4,
    },
    selectedValue: {
        fontSize: 16,
        fontWeight: '700',
    },
    wheelContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 24,
        gap: 16,
    },
    wheelSection: {
        flex: 1,
        alignItems: 'center',
    },
    wheelLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 12,
        textAlign: 'center',
    },
    wheelWrapper: {
        height: WHEEL_HEIGHT,
        width: '100%',
        borderRadius: 12,
        overflow: 'hidden',
        position: 'relative',
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.1)',
    },
    wheel: {
        flex: 1,
    },
    wheelContent: {
        paddingVertical: ITEM_HEIGHT * 1, // Add padding for proper centering with 3 items
    },
    wheelItem: {
        height: ITEM_HEIGHT,
        justifyContent: 'center',
        alignItems: 'center',
    },
    wheelItemText: {
        fontSize: 12,
        textAlign: 'center',
    },
    selectionOverlay: {
        position: 'absolute',
        top: ITEM_HEIGHT * 1,
        left: 0,
        right: 0,
        height: ITEM_HEIGHT,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        pointerEvents: 'none',
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0, 0, 0, 0.1)',
    },
    button: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButton: {
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.2)',
        backgroundColor: 'transparent',
    },
    confirmButton: {},
    buttonText: {
        fontSize: 14,
        fontWeight: '600',
    },
});