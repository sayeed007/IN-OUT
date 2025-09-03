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
import Icon from 'react-native-vector-icons/Ionicons';
import Card from '../../../components/ui/Card';
import ProgressBar from '../../../components/ui/ProgressBar';
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
    const navigation = useNavigation<any>();
    const animatedValue = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        Animated.timing(animatedValue, {
            toValue: 1,
            duration: 800,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
        }).start();
    }, []);

    const getBudgetColor = (percentage: number) => {
        if (percentage >= 100) return theme.colors.error[500];
        if (percentage >= 80) return theme.colors.warning[500];
        return theme.colors.success[500];
    };

    const getBudgetStatus = (percentage: number) => {
        if (percentage >= 100) return 'Over Budget';
        if (percentage >= 80) return 'Near Limit';
        return 'On Track';
    };

    const handleCardPress = (type: string) => {
        switch (type) {
            case 'income':
                navigation.navigate('Transactions', { filter: { type: 'income' } });
                break;
            case 'expense':
                navigation.navigate('Transactions', { filter: { type: 'expense' } });
                break;
            case 'budget':
                navigation.navigate('Settings');
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
                        <Card style={StyleSheet.flatten([styles.kpiCard, styles.incomeCard])}>
                            <View style={styles.cardHeader}>
                                <View style={[styles.iconContainer, { backgroundColor: (theme.colors.success[500]) + '20' }]}>
                                    <Icon
                                        name="trending-up"
                                        size={18}
                                        color={theme.colors.success[500]}
                                    />
                                </View>
                                <Text style={[styles.cardTitle, { color: theme.colors.textSecondary }]}>
                                    Income
                                </Text>
                            </View>
                            <Text style={[styles.amount, { color: theme.colors.success[500] }]}>
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
                        <Card style={StyleSheet.flatten([styles.kpiCard, styles.expenseCard])}>
                            <View style={styles.cardHeader}>
                                <View style={[styles.iconContainer, { backgroundColor: (theme.colors.error[500]) + '20' }]}>
                                    <Icon
                                        name="trending-down"
                                        size={18}
                                        color={theme.colors.error[500]}
                                    />
                                </View>
                                <Text style={[styles.cardTitle, { color: theme.colors.textSecondary }]}>
                                    Expenses
                                </Text>
                            </View>
                            <Text style={[styles.amount, { color: theme.colors.error[500] }]}>
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
                <Card style={styles.netCard}>
                    <View style={styles.netHeader}>
                        <View>
                            <Text style={[styles.netLabel, { color: theme.colors.textSecondary }]}>
                                Net Income
                            </Text>
                            <Text style={[
                                styles.netAmount,
                                { color: net >= 0 ? (theme.colors.success[500]) : (theme.colors.error[500]) }
                            ]}>
                                {net >= 0 ? '+' : ''}${net.toFixed(2)}
                            </Text>
                        </View>
                        <View style={[
                            styles.netBadge,
                            { backgroundColor: net >= 0 ? (theme.colors.success[500]) + '20' : (theme.colors.error[500]) + '20' }
                        ]}>
                            <Text style={[
                                styles.netBadgeText,
                                { color: net >= 0 ? (theme.colors.success[500]) : (theme.colors.error[500]) }
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
                        <Card style={StyleSheet.flatten([styles.budgetCard, { marginHorizontal: 16 }])}>
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
                                    progress={budgetPercentage}
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
    },
    row: {
        flexDirection: 'row',
    },
    cardContainer: {
        flex: 1,
    },
    kpiCard: {
        minHeight: 120,
    },
    incomeCard: {
        borderWidth: 1,
        borderTopWidth: 1,
        borderLeftWidth: 5,
        borderColor: '#10B981', // Green
    },
    expenseCard: {
        borderWidth: 1,
        borderLeftWidth: 5,
        borderColor: '#EF4444', // Red
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 6,
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: '500',
    },
    amount: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 12,
    },
    netCard: {
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