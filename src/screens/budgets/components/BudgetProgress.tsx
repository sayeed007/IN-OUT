import React from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../app/providers/ThemeProvider';
import Card from '../../../components/ui/Card';

interface BudgetData {
    id: string;
    categoryId: string;
    periodId: string; // YYYY-MM-DD format
    periodStartDay: number; // 1-28
    amount: number;
    rollover: boolean;
    month?: string; // Legacy field for backward compatibility
    category?: {
        id: string;
        name: string;
        color: string;
        icon: string;
    };
    spent: number;
    remaining: number;
    percentage: number;
    isOverspent: boolean;
}

interface BudgetProgressProps {
    budget: BudgetData;
    onDelete: (budgetId: string) => void;
}

const BudgetProgress: React.FC<BudgetProgressProps> = ({ budget, onDelete }) => {
    const { theme } = useTheme();

    const getProgressColor = () => {
        if (budget.isOverspent) return theme.colors.error[500];
        if (budget.percentage > 80) return theme.colors.warning[500];
        return theme.colors.success[500];
    };

    const getStatusText = () => {
        if (budget.isOverspent) {
            const overspent = budget.spent - budget.amount;
            return `$${overspent.toFixed(2)} over budget`;
        }
        if (budget.percentage > 90) {
            return `$${budget.remaining.toFixed(2)} left`;
        }
        return `${(100 - budget.percentage).toFixed(0)}% remaining`;
    };

    return (
        <Card style={styles.container}>
            <View style={styles.header}>
                <View style={styles.categoryInfo}>
                    <View style={[
                        styles.categoryIcon,
                        { backgroundColor: budget.category?.color || theme.colors.primary[500] }
                    ]}>
                        <Icon
                            name={budget.category?.icon || 'help-outline'}
                            size={20}
                            color="#FFFFFF"
                        />
                    </View>
                    <View style={styles.categoryDetails}>
                        <Text style={[styles.categoryName, { color: theme.colors.text }]}>
                            {budget.category?.name || 'Unknown Category'}
                        </Text>
                        <Text style={[styles.statusText, { color: theme.colors.textSecondary }]}>
                            {getStatusText()}
                        </Text>
                    </View>
                </View>

                <View style={styles.actions}>
                    <TouchableOpacity
                        onPress={() => onDelete(budget.id)}
                        style={styles.deleteButton}
                    >
                        <Icon name="trash-outline" size={18} color={theme.colors.error[500]} />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.amounts}>
                <View style={styles.amountItem}>
                    <Text style={[styles.amountLabel, { color: theme.colors.textSecondary }]}>
                        Budgeted
                    </Text>
                    <Text style={[styles.amountValue, { color: theme.colors.text }]}>
                        ${budget.amount.toFixed(2)}
                    </Text>
                </View>

                <View style={styles.amountItem}>
                    <Text style={[styles.amountLabel, { color: theme.colors.textSecondary }]}>
                        Spent
                    </Text>
                    <Text style={[
                        styles.amountValue,
                        { color: budget.isOverspent ? theme.colors.error[500] : theme.colors.text }
                    ]}>
                        ${budget.spent.toFixed(2)}
                    </Text>
                </View>

                <View style={styles.amountItem}>
                    <Text style={[styles.amountLabel, { color: theme.colors.textSecondary }]}>
                        Remaining
                    </Text>
                    <Text style={[
                        styles.amountValue,
                        { color: budget.remaining >= 0 ? theme.colors.success[500] : theme.colors.error[500] }
                    ]}>
                        ${budget.remaining.toFixed(2)}
                    </Text>
                </View>
            </View>

            <View style={styles.progressSection}>
                <View style={styles.progressHeader}>
                    <Text style={[styles.progressLabel, { color: theme.colors.textSecondary }]}>
                        Progress
                    </Text>
                    <Text style={[styles.progressPercentage, { color: getProgressColor() }]}>
                        {budget.percentage.toFixed(1)}%
                    </Text>
                </View>

                <View style={[styles.progressBar, { backgroundColor: theme.colors.textSecondary + '20' }]}>
                    <View
                        style={[
                            styles.progressFill,
                            {
                                width: `${Math.min(budget.percentage, 100)}%`,
                                backgroundColor: getProgressColor(),
                            },
                        ]}
                    />
                    {budget.isOverspent && (
                        <View
                            style={[
                                styles.overBudgetFill,
                                {
                                    width: `${Math.min(budget.percentage - 100, 50)}%`,
                                    backgroundColor: theme.colors.error[500] + '40',
                                },
                            ]}
                        />
                    )}
                </View>
            </View>

            {budget.rollover && (
                <View style={styles.rolloverBadge}>
                    <Icon name="refresh-outline" size={12} color={theme.colors.primary[500]} />
                    <Text style={[styles.rolloverText, { color: theme.colors.primary[500] }]}>
                        Rollover enabled
                    </Text>
                </View>
            )}
        </Card>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 8,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    categoryInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    categoryIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    categoryDetails: {
        flex: 1,
    },
    categoryName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    statusText: {
        fontSize: 12,
    },
    actions: {
        flexDirection: 'row',
    },
    deleteButton: {
        padding: 8,
    },
    amounts: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    amountItem: {
        flex: 1,
        alignItems: 'center',
    },
    amountLabel: {
        fontSize: 11,
        marginBottom: 4,
    },
    amountValue: {
        fontSize: 14,
        fontWeight: '600',
    },
    progressSection: {
        marginBottom: 8,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    progressLabel: {
        fontSize: 12,
    },
    progressPercentage: {
        fontSize: 12,
        fontWeight: '600',
    },
    progressBar: {
        height: 6,
        borderRadius: 3,
        overflow: 'hidden',
        flexDirection: 'row',
    },
    progressFill: {
        height: '100%',
        borderRadius: 3,
    },
    overBudgetFill: {
        height: '100%',
        borderRadius: 3,
    },
    rolloverBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        backgroundColor: 'transparent',
        marginTop: 8,
    },
    rolloverText: {
        fontSize: 11,
        fontWeight: '500',
        marginLeft: 4,
    },
});

export default BudgetProgress;
