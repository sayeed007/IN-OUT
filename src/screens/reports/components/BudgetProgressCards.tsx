import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../app/providers/ThemeProvider';
import Card from '../../../components/ui/Card';

interface BudgetItem {
    categoryName: string;
    categoryIcon: string;
    categoryColor: string;
    budgetAmount: number;
    spentAmount: number;
    remaining: number;
    percentage: number;
    isOverBudget: boolean;
}

interface BudgetProgressCardsProps {
    budgets: BudgetItem[];
    title?: string;
}

export const BudgetProgressCards: React.FC<BudgetProgressCardsProps> = ({
    budgets,
    title = 'Budget Performance'
}) => {
    const { theme } = useTheme();

    if (budgets.length === 0) return null;

    const getProgressColor = (percentage: number, isOver: boolean) => {
        if (isOver) return theme.colors.error[500];
        if (percentage > 90) return theme.colors.warning[600];
        if (percentage > 75) return theme.colors.warning[500];
        return theme.colors.success[500];
    };

    const getStatusIcon = (isOver: boolean, percentage: number) => {
        if (isOver) return 'alert-circle';
        if (percentage > 90) return 'warning';
        if (percentage > 75) return 'time';
        return 'checkmark-circle';
    };

    return (
        <Card style={styles.container}>
            <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                Track spending against your budgets
            </Text>

            <View style={styles.budgetList}>
                {budgets.map((budget, index) => {
                    const progressColor = getProgressColor(budget.percentage, budget.isOverBudget);
                    const statusIcon = getStatusIcon(budget.isOverBudget, budget.percentage);

                    return (
                        <View key={`budget-${index}`} style={styles.budgetItem}>
                            <View style={styles.budgetHeader}>
                                <View style={styles.categoryInfo}>
                                    <View style={[
                                        styles.categoryIcon,
                                        { backgroundColor: budget.categoryColor + '20' }
                                    ]}>
                                        <Icon name={budget.categoryIcon} size={18} color={budget.categoryColor} />
                                    </View>
                                    <View style={styles.categoryDetails}>
                                        <Text style={[styles.categoryName, { color: theme.colors.text }]}>
                                            {budget.categoryName}
                                        </Text>
                                        <Text style={[styles.budgetRange, { color: theme.colors.textSecondary }]}>
                                            ${budget.spentAmount.toFixed(0)} of ${budget.budgetAmount.toFixed(0)}
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.statusBadge}>
                                    <Icon name={statusIcon} size={16} color={progressColor} />
                                    <Text style={[styles.percentageText, { color: progressColor }]}>
                                        {budget.percentage.toFixed(0)}%
                                    </Text>
                                </View>
                            </View>

                            {/* Progress Bar */}
                            <View style={[styles.progressBarContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
                                <View
                                    style={[
                                        styles.progressBar,
                                        {
                                            width: `${Math.min(budget.percentage, 100)}%`,
                                            backgroundColor: progressColor,
                                        }
                                    ]}
                                />
                                {budget.isOverBudget && (
                                    <View
                                        style={[
                                            styles.overBudgetBar,
                                            {
                                                width: `${Math.min(budget.percentage - 100, 50)}%`,
                                                backgroundColor: progressColor,
                                            }
                                        ]}
                                    />
                                )}
                            </View>

                            {/* Remaining/Over Budget */}
                            <View style={styles.remainingContainer}>
                                {budget.isOverBudget ? (
                                    <Text style={[styles.remainingText, { color: theme.colors.error[500] }]}>
                                        ${Math.abs(budget.remaining).toFixed(0)} over budget
                                    </Text>
                                ) : (
                                    <Text style={[styles.remainingText, { color: theme.colors.success[500] }]}>
                                        ${budget.remaining.toFixed(0)} remaining
                                    </Text>
                                )}
                            </View>
                        </View>
                    );
                })}
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
    budgetList: {
        gap: 20,
    },
    budgetItem: {
        gap: 8,
    },
    budgetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    categoryInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    categoryIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    categoryDetails: {
        flex: 1,
    },
    categoryName: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 2,
    },
    budgetRange: {
        fontSize: 12,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    percentageText: {
        fontSize: 14,
        fontWeight: '700',
    },
    progressBarContainer: {
        height: 8,
        borderRadius: 4,
        overflow: 'hidden',
        flexDirection: 'row',
    },
    progressBar: {
        height: '100%',
        borderRadius: 4,
    },
    overBudgetBar: {
        height: '100%',
        opacity: 0.5,
    },
    remainingContainer: {
        alignItems: 'flex-end',
    },
    remainingText: {
        fontSize: 11,
        fontWeight: '600',
    },
});
