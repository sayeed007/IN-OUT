// src/screens/dashboard/components/KPICards.tsx
import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Easing,
} from 'react-native';
import { Card } from '../../../components/ui/Card';
import { ProgressBar } from '../../../components/ui/ProgressBar';
import { useTheme } from '../../../app/providers/ThemeProvider';
import { useNavigation } from '@react-navigation/native';

interface KPICardsProps {
    income: number;
    expense: number;
    net: number;
    budgetUsed: number;
    totalBudget: number;
    budgetPercentage: number;
}

export const KPICards: React.FC<KPICardsProps> = ({
    income,
    expense,
    net,
    budgetUsed,
    totalBudget,
    budgetPercentage,
}) => {
    const { theme } = useTheme();
    const navigation = useNavigation();
    const animatedValue = new Animated.Value(0);

    React.useEffect(() => {
        Animated.timing(animatedValue, {
            toValue: 1,
            duration: 800,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
        }).start();
    }, []);

    const getBudgetColor = (percentage: number) => {
        if (percentage >= 100) return theme.colors.error;
        if (percentage >= 80) return theme.colors.warning;
        return theme.colors.success;
    };

    const getBudgetStatus = (percentage: number) => {
        if (percentage >= 100) return 'Over Budget';
        if (percentage >= 80) return 'Near Limit';
        return 'On Track';
    };

    const handleCardPress = (type: string) => {
        switch (type) {
            case 'income':
                navigation.navigate('TransactionList', { filter: { type: 'income' } });
                break;
            case 'expense':
                navigation.navigate('TransactionList', { filter: { type: 'expense' } });
                break;
            case 'budget':
                navigation.navigate('Budget');
                break;
            default:
                break;
        }
    };

    return (
        <View style={styles.container}>
            {/* Income & Expense Row */}
            <View style={styles.row}>
                <Animated.View
                    style={[
                        styles.cardContainer,
                        {
                            transform: [
                                {
                                    translateY: animatedValue.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [50, 0],
                                    }),
                                },
                            ],
                            opacity: animatedValue,
                        },
                    ]}
                >
                    <TouchableOpacity
                        onPress={() => handleCardPress('income')}
                        activeOpacity={0.8}
                    >
                        <Card style={[styles.kpiCard, styles.incomeCard]}>
                            <View style={styles.cardHeader}>
                                <View style={[styles.iconContainer, { backgroundColor: theme.colors.success + '20' }]}>
                                    <Text style={[styles.icon, { color: theme.colors.success }]}>↗</Text>
                                </View>
                                <Text style={[styles.cardTitle, { color: theme.colors.textSecondary }]}>
                                    Income
                                </Text>
                            </View>
                            <Text style={[styles.amount, { color: theme.colors.success }]}>
                                +${income.toFixed(2)}
                            </Text>
                            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                                This month
                            </Text>
                        </Card>
                    </TouchableOpacity>
                </Animated.View>

                <Animated.View
                    style={[
                        styles.cardContainer,
                        {
                            transform: [
                                {
                                    translateY: animatedValue.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [50, 0],
                                    }),
                                },
                            ],
                            opacity: animatedValue,
                        },
                    ]}
                >
                    <TouchableOpacity
                        onPress={() => handleCardPress('expense')}
                        activeOpacity={0.8}
                    >
                        <Card style={[styles.kpiCard, styles.expenseCard]}>
                            <View style={styles.cardHeader}>
                                <View style={[styles.iconContainer, { backgroundColor: theme.colors.error + '20' }]}>
                                    <Text style={[styles.icon, { color: theme.colors.error }]}>↙</Text>
                                </View>
                                <Text style={[styles.cardTitle, { color: theme.colors.textSecondary }]}>
                                    Expenses
                                </Text>
                            </View>
                            <Text style={[styles.amount, { color: theme.colors.error }]}>
                                -${expense.toFixed(2)}
                            </Text>
                            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                                This month
                            </Text>
                        </Card>
                    </TouchableOpacity>
                </Animated.View>
            </View>

            {/* Net Worth */}
            <Animated.View
                style={[
                    {
                        transform: [
                            {
                                translateY: animatedValue.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [50, 0],
                                }),
                            },
                        ],
                        opacity: animatedValue,
                    },
                ]}
            >
                <Card style={[styles.netCard, { marginHorizontal: 16, marginBottom: 12 }]}>
                    <View style={styles.netHeader}>
                        <View>
                            <Text style={[styles.netLabel, { color: theme.colors.textSecondary }]}>
                                Net Income
                            </Text>
                            <Text style={[
                                styles.netAmount,
                                { color: net >= 0 ? theme.colors.success : theme.colors.error }
                            ]}>
                                {net >= 0 ? '+' : ''}${net.toFixed(2)}
                            </Text>
                        </View>
                        <View style={[
                            styles.netBadge,
                            { backgroundColor: net >= 0 ? theme.colors.success + '20' : theme.colors.error + '20' }
                        ]}>
                            <Text style={[
                                styles.netBadgeText,
                                { color: net >= 0 ? theme.colors.success : theme.colors.error }
                            ]}>
                                {net >= 0 ? 'Positive' : 'Negative'}
                            </Text>
                        </View>
                    </View>
                </Card>
            </Animated.View>

            {/* Budget Progress */}
            {totalBudget > 0 && (
                <Animated.View
                    style={[
                        {
                            transform: [
                                {
                                    translateY: animatedValue.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [50, 0],
                                    }),
                                },
                            ],
                            opacity: animatedValue,
                        },
                    ]}
                >
                    <TouchableOpacity
                        onPress={() => handleCardPress('budget')}
                        activeOpacity={0.8}
                    >
                        <Card style={[styles.budgetCard, { marginHorizontal: 16 }]}>
                            <View style={styles.budgetHeader}>
                                <View>
                                    <Text style={[styles.budgetTitle, { color: theme.colors.text }]}>
                                        Budget Progress
                                    </Text>
                                    <Text style={[styles.budgetSubtitle, { color: theme.colors.textSecondary }]}>
                                        ${budgetUsed.toFixed(2)} of ${totalBudget.toFixed(2)}
                                    </Text>
                                </View>
                                <View style={[
                                    styles.statusBadge,
                                    { backgroundColor: getBudgetColor(budgetPercentage) + '20' }
                                ]}>
                                    <Text style={[
                                        styles.statusText,
                                        { color: getBudgetColor(budgetPercentage) }
                                    ]}>
                                        {getBudgetStatus(budgetPercentage)}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.progressContainer}>
                                <ProgressBar
                                    progress={Math.min(budgetPercentage / 100, 1)}
                                    color={getBudgetColor(budgetPercentage)}
                                    height={8}
                                    animated
                                />
                                <Text style={[styles.percentageText, { color: getBudgetColor(budgetPercentage) }]}>
                                    {budgetPercentage.toFixed(1)}%
                                </Text>
                            </View>
                        </Card>
                    </TouchableOpacity>
                </Animated.View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 4,
    },
    row: {
        flexDirection: 'row',
        marginHorizontal: 12,
        marginBottom: 12,
    },
    cardContainer: {
        flex: 1,
        marginHorizontal: 4,
    },
    kpiCard: {
        padding: 16,
        minHeight: 120,
    },
    incomeCard: {
        borderLeftWidth: 4,
        borderLeftColor: '#10B981', // Green
    },
    expenseCard: {
        borderLeftWidth: 4,
        borderLeftColor: '#EF4444', // Red
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    icon: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: '500',
    },
    amount: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 12,
    },
    netCard: {
        padding: 16,
    },
    netHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    netLabel: {
        fontSize: 14,
        marginBottom: 4,
    },
    netAmount: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    netBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    netBadgeText: {
        fontSize: 12,
        fontWeight: '600',
    },
    budgetCard: {
        padding: 16,
    },
    budgetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    budgetTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    budgetSubtitle: {
        fontSize: 14,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    percentageText: {
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 12,
        minWidth: 50,
        textAlign: 'right',
    },
});