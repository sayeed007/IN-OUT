import React, { useMemo, useState } from 'react';
import {
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
import dayjs from 'dayjs';
import { useTheme } from '../../app/providers/ThemeProvider';
import Card from '../../components/ui/Card';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import BottomSpacing from '../../components/ui/BottomSpacing';
import { GradientHeader } from '../../components/ui/GradientHeader';
import {
    useGetBudgetsQuery,
    useGetCategoriesQuery,
    useGetTransactionsQuery,
    useDeleteBudgetMutation
} from '../../state/api';
import { RootState } from '../../state/store';
import { BudgetScreenProps } from '../../types/navigation';
import BudgetProgress from './components/BudgetProgress';
import BudgetCreationModal from './components/BudgetCreationModal';
import { showToast } from '../../utils/helpers/toast';
import { useNavigation } from '@react-navigation/native';
import {
    getCurrentPeriodId,
    getCustomPeriodStart,
    getCustomPeriodEnd,
    getPrevPeriod,
    getNextPeriod,
    formatPeriodLabel
} from '../../utils/helpers/dateUtils';

const BudgetScreen: React.FC<BudgetScreenProps> = ({ route }) => {
    const { theme } = useTheme();
    const navigation = useNavigation();
    const periodStartDay = useSelector((state: RootState) => state.preferences.budgetStartDay);

    const [selectedPeriod, setSelectedPeriod] = useState(
        route.params?.month || getCurrentPeriodId(periodStartDay)
    );
    const [showBudgetForm, setShowBudgetForm] = useState(false);
    const [budgetToEdit, setBudgetToEdit] = useState<any>(null);

    // Calculate date range for selected period
    const startDate = useMemo(() => {
        return getCustomPeriodStart(selectedPeriod, periodStartDay).toISOString();
    }, [selectedPeriod, periodStartDay]);

    const endDate = useMemo(() => {
        return getCustomPeriodEnd(selectedPeriod, periodStartDay).toISOString();
    }, [selectedPeriod, periodStartDay]);

    // API queries
    const {
        data: budgets = [],
        isLoading: loadingBudgets,
        isFetching: fetchingBudgets,
        refetch: refetchBudgets
    } = useGetBudgetsQuery({ periodId: selectedPeriod });

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
        start: startDate,
        end: endDate,
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
        }).sort((a, b) => b.amount - a.amount); // Sort by highest amount first
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
        setBudgetToEdit(null);
        setShowBudgetForm(true);
    };

    const handleEditBudget = (budget: any) => {
        setBudgetToEdit(budget);
        setShowBudgetForm(true);
    };

    const handleBudgetSaved = () => {
        // Budget creation/update success is handled by the form itself
        // The queries will be automatically refetched due to cache invalidation
        setBudgetToEdit(null);
    };

    const navigateToPeriod = (direction: 'prev' | 'next') => {
        const newPeriod = direction === 'prev'
            ? getPrevPeriod(selectedPeriod, periodStartDay)
            : getNextPeriod(selectedPeriod, periodStartDay);
        setSelectedPeriod(newPeriod);
    };

    const getPeriodLabel = () => {
        return formatPeriodLabel(selectedPeriod, periodStartDay);
    };

    if (isLoading && budgets.length === 0) {
        return (
            <View style={styles.container}>
                <GradientHeader
                    title="Budgets"
                    subtitle={getPeriodLabel()}
                    showBackButton={false}
                    rightIcon="add-circle-outline"
                    onRightPress={handleCreateBudget}
                />
                <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
                    <LoadingSpinner size="large" />
                    <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
                        Loading budgets...
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <GradientHeader
                title="Budgets"
                subtitle={getPeriodLabel()}
                showBackButton={true}
                onBackPress={() => navigation.goBack()}
                rightIcon="add-circle-outline"
                onRightPress={handleCreateBudget}
            />
            <ScrollView
                style={styles.content}
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
                {/* Period Selector */}
                <Card style={styles.card}>
                    <View style={styles.monthHeader}>
                        <TouchableOpacity
                            onPress={() => navigateToPeriod('prev')}
                            style={styles.monthButton}
                        >
                            <Icon name="chevron-back" size={20} color={theme.colors.primary[500]} />
                        </TouchableOpacity>

                        <Text style={[styles.monthText, { color: theme.colors.text }]}>
                            {getPeriodLabel()}
                        </Text>

                        <TouchableOpacity
                            onPress={() => navigateToPeriod('next')}
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
                            onEdit={handleEditBudget}
                        />
                    ))
                ) : (
                    <Card style={styles.emptyCard}>
                        <EmptyState
                            title="No budgets set"
                            description={`Create budgets for ${getPeriodLabel()} to track your spending`}
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
            <BudgetCreationModal
                visible={showBudgetForm}
                onClose={() => {
                    setShowBudgetForm(false);
                    setBudgetToEdit(null);
                }}
                onBudgetCreated={handleBudgetSaved}
                selectedPeriod={selectedPeriod}
                periodStartDay={periodStartDay}
                budgetToEdit={budgetToEdit}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    content: {
        flex: 1,
        backgroundColor: '#f8fafc',
        paddingHorizontal: 12,
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
    card: {
        marginVertical: 8,
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
