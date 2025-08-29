import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Spacing } from '../../theme';

interface AmountKeypadProps {
    value: string;
    onChange: (value: string) => void;
    currencyCode?: string;
    maxAmount?: number;
    onDone?: () => void;
}

const KEYPAD_KEYS = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['.', '0', '⌫'],
];

export const AmountKeypad: React.FC<AmountKeypadProps> = ({
    value,
    onChange,
    currencyCode = 'USD',
    maxAmount = 999999.99,
    onDone,
}) => {
    const [displayValue, setDisplayValue] = useState(value || '0');

    const formatAmount = useCallback((amount: string): string => {
        // Remove all non-numeric characters except decimal point
        let cleaned = amount.replace(/[^0-9.]/g, '');

        // Ensure only one decimal point
        const parts = cleaned.split('.');
        if (parts.length > 2) {
            cleaned = parts[0] + '.' + parts.slice(1).join('');
        }

        // Limit to 2 decimal places
        if (parts.length === 2 && parts[1].length > 2) {
            cleaned = parts[0] + '.' + parts[1].substring(0, 2);
        }

        // Prevent leading zeros (except for decimal numbers)
        if (cleaned.startsWith('0') && !cleaned.startsWith('0.')) {
            cleaned = cleaned.substring(1);
        }

        // Ensure at least one digit before decimal
        if (cleaned.startsWith('.')) {
            cleaned = '0' + cleaned;
        }

        return cleaned || '0';
    }, []);

    const handleKeyPress = useCallback((key: string) => {
        let newValue = displayValue;

        if (key === '⌫') {
            // Backspace
            newValue = displayValue.slice(0, -1);
            if (newValue === '' || newValue === '0') {
                newValue = '0';
            }
        } else if (key === '.') {
            // Decimal point
            if (!displayValue.includes('.')) {
                newValue = displayValue + '.';
            }
        } else {
            // Number
            if (displayValue === '0') {
                newValue = key;
            } else {
                newValue = displayValue + key;
            }
        }

        const formatted = formatAmount(newValue);
        const numericValue = parseFloat(formatted);

        // Check max amount
        if (numericValue <= maxAmount) {
            setDisplayValue(formatted);
            onChange(formatted);
        }
    }, [displayValue, formatAmount, maxAmount, onChange]);

    const handleClear = useCallback(() => {
        setDisplayValue('0');
        onChange('0');
    }, [onChange]);

    const formatDisplayValue = (val: string): string => {
        const numericValue = parseFloat(val);
        if (isNaN(numericValue)) return '0.00';

        return numericValue.toFixed(2);
    };

    return (
        <View style={styles.container}>
            {/* Display */}
            <View style={styles.displayContainer}>
                <Text style={styles.currencyCode}>{currencyCode}</Text>
                <Text style={styles.amountText}>
                    {formatDisplayValue(displayValue)}
                </Text>
                <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
                    <Text style={styles.clearButtonText}>Clear</Text>
                </TouchableOpacity>
            </View>

            {/* Keypad */}
            <View style={styles.keypadContainer}>
                {KEYPAD_KEYS.map((row, rowIndex) => (
                    <View key={rowIndex} style={styles.row}>
                        {row.map((key) => (
                            <TouchableOpacity
                                key={key}
                                style={[
                                    styles.key,
                                    key === '⌫' && styles.backspaceKey,
                                    key === '.' && displayValue.includes('.') && styles.disabledKey,
                                ]}
                                onPress={() => handleKeyPress(key)}
                                disabled={key === '.' && displayValue.includes('.')}
                                activeOpacity={0.7}
                            >
                                <Text style={[
                                    styles.keyText,
                                    key === '⌫' && styles.backspaceText,
                                    key === '.' && displayValue.includes('.') && styles.disabledKeyText,
                                ]}>
                                    {key}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                ))}
            </View>

            {/* Done Button */}
            {onDone && (
                <TouchableOpacity style={styles.doneButton} onPress={onDone}>
                    <Text style={styles.doneButtonText}>Done</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: Spacing.lg,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    displayContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.lg,
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        marginBottom: Spacing.lg,
    },
    currencyCode: {
        fontSize: 16,
        fontWeight: '600',
        color: '#6B7280',
    },
    amountText: {
        fontSize: 32,
        fontWeight: '700',
        color: '#111827',
        flex: 1,
        textAlign: 'center',
    },
    clearButton: {
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
    },
    clearButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#EF4444',
    },
    keypadContainer: {
        gap: Spacing.sm,
    },
    row: {
        flexDirection: 'row',
        gap: Spacing.sm,
    },
    key: {
        flex: 1,
        height: 56,
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    keyText: {
        fontSize: 20,
        fontWeight: '600',
        color: '#111827',
    },
    backspaceKey: {
        backgroundColor: '#FEF3C7',
    },
    backspaceText: {
        color: '#D97706',
    },
    disabledKey: {
        backgroundColor: '#E5E7EB',
    },
    disabledKeyText: {
        color: '#9CA3AF',
    },
    doneButton: {
        backgroundColor: '#6366F1',
        borderRadius: 12,
        paddingVertical: Spacing.md,
        marginTop: Spacing.lg,
        alignItems: 'center',
    },
    doneButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
});