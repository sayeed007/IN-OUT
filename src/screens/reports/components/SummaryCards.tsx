import React from 'react';
import {
    Dimensions,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../app/providers/ThemeProvider';
import Card from '../../../components/ui/Card';

const { width: screenWidth } = Dimensions.get('window');

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

    return (
        <View style={styles.summaryContainer}>
            <Card style={StyleSheet.flatten([styles.summaryCard, styles.incomeCard])} variant='normal'>
                <View style={styles.summaryHeader}>
                    <Icon name="trending-up" size={20} color={theme.colors.income.main} />
                    <Text style={[styles.summaryLabel, { color: theme.colors.income.main }]}>Income</Text>
                </View>
                <Text style={[styles.summaryAmount, { color: theme.colors.income.main }]}>
                    ${data.totals.income.toFixed(2)}
                </Text>
                <Text style={[styles.summarySubtext, { color: theme.colors.textSecondary }]}>
                    {data.transactionCounts.income} transactions
                </Text>
            </Card>

            <Card style={StyleSheet.flatten([styles.summaryCard, styles.expenseCard])} variant='normal'>
                <View style={styles.summaryHeader}>
                    <Icon name="trending-down" size={20} color={theme.colors.expense.main} />
                    <Text style={[styles.summaryLabel, { color: theme.colors.expense.main }]}>Expenses</Text>
                </View>
                <Text style={[styles.summaryAmount, { color: theme.colors.expense.main }]}>
                    ${data.totals.expense.toFixed(2)}
                </Text>
                <Text style={[styles.summarySubtext, { color: theme.colors.textSecondary }]}>
                    {data.transactionCounts.expense} transactions
                </Text>
            </Card>

            <Card style={StyleSheet.flatten([styles.summaryCard, styles.netCard])} variant='normal'>
                <View style={styles.summaryHeader}>
                    <Icon name="analytics" size={20} color={data.totals.net >= 0 ? theme.colors.income.main : theme.colors.expense.main} />
                    <Text style={[styles.summaryLabel, { color: data.totals.net >= 0 ? theme.colors.income.main : theme.colors.expense.main }]}>
                        Net
                    </Text>
                </View>
                <Text style={[
                    styles.summaryAmount,
                    { color: data.totals.net >= 0 ? theme.colors.income.main : theme.colors.expense.main }
                ]}>
                    ${Math.abs(data.totals.net).toFixed(2)}
                </Text>
                <Text style={[styles.summarySubtext, { color: theme.colors.textSecondary }]}>
                    {data.totals.net >= 0 ? 'Surplus' : 'Deficit'}
                </Text>
            </Card>
        </View>
    );
};

const styles = StyleSheet.create({
    summaryContainer: {
        flexDirection: screenWidth > 400 ? 'row' : 'column',
        gap: 12,
        marginBottom: 8,
    },
    summaryCard: {
        flex: screenWidth > 400 ? 1 : undefined,
        padding: 16,
    },
    summaryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    incomeCard: {
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
    },
    expenseCard: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
    },
    netCard: {
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
    },
    summaryLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 8,
    },
    summaryAmount: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 4,
    },
    summarySubtext: {
        fontSize: 12,
    },
});