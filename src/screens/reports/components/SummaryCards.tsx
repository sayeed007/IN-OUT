import React from 'react';
import {
    StyleSheet,
    Text,
    View
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../app/providers/ThemeProvider';
import Card from '../../../components/ui/Card';

interface SummaryData {
    totals: {
        income: number;
        expense: number;
        net: number;
    };
    transactionCounts: {
        income: number;
        expense: number;
        total: number;
    };
}

interface SummaryCardsProps {
    data: SummaryData;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ data }) => {
    const { theme } = useTheme();

    const formatAmount = (amount: number) => {
        if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}k`;
        return `$${amount.toFixed(0)}`;
    };

    return (
        <Card style={styles.summaryContainer} variant='normal'>
            <View style={styles.summaryRow}>
                {/* Income */}
                <View style={styles.summaryItem}>
                    <View style={styles.itemHeader}>
                        <Icon name="trending-up" size={14} color={theme.colors.income.main} />
                        <Text style={[styles.itemLabel, { color: theme.colors.textSecondary }]}>Income</Text>
                    </View>
                    <Text style={[styles.itemAmount, { color: theme.colors.income.main }]}>
                        {formatAmount(data.totals.income)}
                    </Text>
                    <Text style={[styles.itemCount, { color: theme.colors.textSecondary }]}>
                        {data.transactionCounts.income}
                    </Text>
                </View>

                {/* Divider */}
                <View style={[styles.divider, { backgroundColor: theme.colors.textSecondary + '20' }]} />

                {/* Expenses */}
                <View style={styles.summaryItem}>
                    <View style={styles.itemHeader}>
                        <Icon name="trending-down" size={14} color={theme.colors.expense.main} />
                        <Text style={[styles.itemLabel, { color: theme.colors.textSecondary }]}>Expenses</Text>
                    </View>
                    <Text style={[styles.itemAmount, { color: theme.colors.expense.main }]}>
                        {formatAmount(data.totals.expense)}
                    </Text>
                    <Text style={[styles.itemCount, { color: theme.colors.textSecondary }]}>
                        {data.transactionCounts.expense}
                    </Text>
                </View>

                {/* Divider */}
                <View style={[styles.divider, { backgroundColor: theme.colors.textSecondary + '20' }]} />

                {/* Net */}
                <View style={styles.summaryItem}>
                    <View style={styles.itemHeader}>
                        <Icon
                            name={data.totals.net >= 0 ? "checkmark-circle" : "close-circle"}
                            size={14}
                            color={data.totals.net >= 0 ? theme.colors.income.main : theme.colors.expense.main}
                        />
                        <Text style={[styles.itemLabel, { color: theme.colors.textSecondary }]}>Net</Text>
                    </View>
                    <Text style={[
                        styles.itemAmount,
                        { color: data.totals.net >= 0 ? theme.colors.income.main : theme.colors.expense.main }
                    ]}>
                        {data.totals.net >= 0 ? '+' : '-'}{formatAmount(Math.abs(data.totals.net))}
                    </Text>
                    <Text style={[styles.itemCount, { color: theme.colors.textSecondary }]}>
                        {data.totals.net >= 0 ? 'surplus' : 'deficit'}
                    </Text>
                </View>
            </View>
        </Card>
    );
};

const styles = StyleSheet.create({
    summaryContainer: {
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    summaryItem: {
        flex: 1,
        alignItems: 'center',
    },
    itemHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    itemLabel: {
        fontSize: 11,
        fontWeight: '500',
        marginLeft: 4,
    },
    itemAmount: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 2,
    },
    itemCount: {
        fontSize: 10,
        fontWeight: '400',
    },
    divider: {
        width: 1,
        height: 40,
        marginHorizontal: 8,
    },
});