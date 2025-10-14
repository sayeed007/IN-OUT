import React, { useMemo, useState } from 'react';
import {
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import dayjs from 'dayjs';
import { useTheme } from '../../app/providers/ThemeProvider';
import { SafeContainer } from '../../components/layout/SafeContainer';
import Card from '../../components/ui/Card';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import BottomSpacing from '../../components/ui/BottomSpacing';
import {
    useGetBudgetsQuery,
    useGetCategoriesQuery,
    useGetTransactionsQuery,
    useDeleteBudgetMutation
} from '../../state/api';
import { BudgetScreenProps } from '../../types/navigation';
import BudgetProgress from './components/BudgetProgress';
import BudgetForm from './components/BudgetForm';
import { showToast } from '../../utils/helpers/toast';

const BudgetScreen: React.FC<BudgetScreenProps> = ({ route }) => {
    const { theme } = useTheme();
    const [selectedMonth, setSelectedMonth] = useState(route.params?.month || dayjs().format('YYYY-MM'));
    const [showBudgetForm, setShowBudgetForm] = useState(false);

    // API queries
    const {
        data: budgets = [],
        isLoading: loadingBudgets,
        isFetching: fetchingBudgets,
        refetch: refetchBudgets
    } = useGetBudgetsQuery({ month: selectedMonth });

    const {
        data: categories = [],
        isLoading: loadingCategories
    } = useGetCategoriesQuery();

    const {
        data: transactions = [],
        isLoading: loadingTransactions,
        isFetching: fetchingTransactions,
        refetch: refetchTransactions
    } = useGetTransactionsQuery({
        start: dayjs(selectedMonth).startOf('month').toISOString(),
        end: dayjs(selectedMonth).endOf('month').toISOString(),
    });

    const [deleteBudget] = useDeleteBudgetMutation();

    const isLoading = loadingBudgets || loadingCategories || loadingTransactions;
    const isRefreshing = fetchingBudgets || fetchingTransactions;

    // Calculate budget data with spending
    const budgetData = useMemo(() => {
        return budgets.map(budget => {
            const category = categories.find(c => c.id === budget.categoryId);
            const categorySpending = transactions
                .filter(t => t.type === 'expense' && t.categoryId === budget.categoryId)
                .reduce((sum, t) => sum + t.amount, 0);

            const percentage = budget.amount > 0 ? (categorySpending / budget.amount) * 100 : 0;
            const remaining = budget.amount - categorySpending;

            return {
                ...budget,
                category,
                spent: categorySpending,
                remaining,
                percentage: Math.min(percentage, 100),
                isOverspent: categorySpending > budget.amount,
            };
        });
    }, [budgets, categories, transactions]);

    // Summary calculations
    const summary = useMemo(() => {
        const totalBudget = budgetData.reduce((sum, b) => sum + b.amount, 0);
        const totalSpent = budgetData.reduce((sum, b) => sum + b.spent, 0);
        const totalRemaining = totalBudget - totalSpent;
        const overallPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

        return {
            totalBudget,
            totalSpent,
            totalRemaining,
            overallPercentage: Math.min(overallPercentage, 100),
            isOverspent: totalSpent > totalBudget,
        };
    }, [budgetData]);

    const handleRefresh = async () => {
        // RTK Query handles the fetching state automatically
        await Promise.all([
            refetchBudgets(),
            refetchTransactions(),
        ]);
    };

    const handleDeleteBudget = async (budgetId: string) => {
        try {
            await deleteBudget(budgetId).unwrap();
            showToast.success('Budget deleted successfully');
        } catch (error) {
            showToast.error('Failed to delete budget');
        }
    };

    const handleCreateBudget = () => {
        setShowBudgetForm(true);
    };

    const handleBudgetCreated = () => {
        // Budget creation success is handled by the form itself
        // The queries will be automatically refetched due to cache invalidation
    };

    const navigateToMonth = (direction: 'prev' | 'next') => {
        const currentMonth = dayjs(selectedMonth);
        const newMonth = direction === 'prev'
            ? currentMonth.subtract(1, 'month')
            : currentMonth.add(1, 'month');
        setSelectedMonth(newMonth.format('YYYY-MM'));
    };

    if (isLoading && budgets.length === 0) {
        return (
            <SafeContainer>
                <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
                    <LoadingSpinner size="large" />
                    <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
                        Loading budgets...
                    </Text>
                </View>
            </SafeContainer>
        );
    }

    return (
        <SafeContainer>
            <ScrollView
                style={[styles.container, { backgroundColor: theme.colors.background }]}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={handleRefresh}
                        colors={[theme.colors.primary[500]]}
                        tintColor={theme.colors.primary[500]}
                    />
                }
            >
                {/* Month Selector */}
                <Card>
                    <View style={styles.monthHeader}>
                        <TouchableOpacity
                            onPress={() => navigateToMonth('prev')}
                            style={styles.monthButton}
                        >
                            <Icon name="chevron-back" size={20} color={theme.colors.primary[500]} />
                        </TouchableOpacity>

                        <Text style={[styles.monthText, { color: theme.colors.text }]}>
                            {dayjs(selectedMonth).format('MMMM YYYY')}
                        </Text>

                        <TouchableOpacity
                            onPress={() => navigateToMonth('next')}
                            style={styles.monthButton}
                        >
                            <Icon name="chevron-forward" size={20} color={theme.colors.primary[500]} />
                        </TouchableOpacity>
                    </View>
                </Card>

                {/* Budget Summary */}
                <Card style={styles.summaryCard}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                        Budget Overview
                    </Text>

                    <View style={styles.summaryRow}>
                        <View style={styles.summaryItem}>
                            <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
                                Total Budget
                            </Text>
                            <Text style={[styles.summaryAmount, { color: theme.colors.text }]}>
                                ${summary.totalBudget.toFixed(2)}
                            </Text>
                        </View>

                        <View style={styles.summaryItem}>
                            <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
                                Total Spent
                            </Text>
                            <Text style={[
                                styles.summaryAmount,
                                { color: summary.isOverspent ? theme.colors.error[500] : theme.colors.warning[500] }
                            ]}>
                                ${summary.totalSpent.toFixed(2)}
                            </Text>
                        </View>

                        <View style={styles.summaryItem}>
                            <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
                                Remaining
                            </Text>
                            <Text style={[
                                styles.summaryAmount,
                                { color: summary.totalRemaining >= 0 ? theme.colors.success[500] : theme.colors.error[500] }
                            ]}>
                                ${summary.totalRemaining.toFixed(2)}
                            </Text>
                        </View>
                    </View>

                    {/* Overall Progress Bar */}
                    <View style={styles.overallProgress}>
                        <View style={[styles.progressBar, { backgroundColor: theme.colors.textSecondary + '20' }]}>
                            <View
                                style={[
                                    styles.progressFill,
                                    {
                                        width: `${summary.overallPercentage}%`,
                                        backgroundColor: summary.isOverspent
                                            ? theme.colors.error[500]
                                            : summary.overallPercentage > 80
                                                ? theme.colors.warning[500]
                                                : theme.colors.success[500],
                                    },
                                ]}
                            />
                        </View>
                        <Text style={[styles.progressText, { color: theme.colors.textSecondary }]}>
                            {summary.overallPercentage.toFixed(1)}% used
                        </Text>
                    </View>
                </Card>

                {/* Budget List */}
                {budgetData.length > 0 ? (
                    budgetData.map((budget) => (
                        <BudgetProgress
                            key={budget.id}
                            budget={budget}
                            onDelete={handleDeleteBudget}
                        />
                    ))
                ) : (
                    <Card style={styles.emptyCard}>
                        <EmptyState
                            title="No budgets set"
                            description={`Create budgets for ${dayjs(selectedMonth).format('MMMM')} to track your spending`}
                            actionLabel="Create Budget"
                            onActionPress={handleCreateBudget}
                        />
                    </Card>
                )}

                {/* Add Budget Button */}
                <TouchableOpacity
                    style={[styles.addButton, { backgroundColor: theme.colors.primary[500] }]}
                    onPress={handleCreateBudget}
                >
                    <Icon name="add" size={24} color="#FFFFFF" />
                    <Text style={styles.addButtonText}>Create Budget</Text>
                </TouchableOpacity>

                <BottomSpacing />
            </ScrollView>

            {/* Budget Creation Modal */}
            <BudgetForm
                visible={showBudgetForm}
                onClose={() => setShowBudgetForm(false)}
                onBudgetCreated={handleBudgetCreated}
                selectedMonth={selectedMonth}
            />
        </SafeContainer>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 14,
    },
    monthHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    monthButton: {
        padding: 8,
    },
    monthText: {
        fontSize: 18,
        fontWeight: '600',
    },
    summaryCard: {
        marginVertical: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 16,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    summaryItem: {
        flex: 1,
        alignItems: 'center',
    },
    summaryLabel: {
        fontSize: 12,
        marginBottom: 4,
    },
    summaryAmount: {
        fontSize: 16,
        fontWeight: '600',
    },
    overallProgress: {
        alignItems: 'center',
    },
    progressBar: {
        width: '100%',
        height: 8,
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressFill: {
        height: '100%',
        borderRadius: 4,
    },
    progressText: {
        fontSize: 12,
    },
    emptyCard: {
        marginVertical: 8,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
        marginHorizontal: 16,
        marginVertical: 8,
    },
    addButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
});

export default BudgetScreen;
