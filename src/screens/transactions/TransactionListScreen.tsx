// src/screens/transactions/TransactionListScreen.tsx
import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeContainer } from '../../components/layout/SafeContainer';
import { Card } from '../../components/ui/Card';
import { Chip } from '../../components/ui/Chip';
import { Input } from '../../components/ui/Input';
import { useGetTransactionsQuery, useGetAccountsQuery, useGetCategoriesQuery } from '../../state/api';
import {
    formatCurrency,
    formatDate,
    getTransactionTypeColor,
    getTransactionTypeIcon,
    groupTransactionsByDate,
    filterTransactions,
    searchTransactions,
} from '../../features/transactions/utils/transactionUtils';
import { TransactionType } from '../../types/global';
import { Spacing } from '../../theme';

interface DailyGroup {
    date: string;
    transactions: any[];
    totals: {
        income: number;
        expense: number;
        net: number;
    };
}

export const TransactionListScreen: React.FC = () => {
    const navigation = useNavigation();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState<TransactionType | 'all'>('all');
    const [refreshing, setRefreshing] = useState(false);

    // Data queries
    const { data: transactions = [], refetch: refetchTransactions } = useGetTransactionsQuery();
    const { data: accounts = [] } = useGetAccountsQuery();
    const { data: categories = [] } = useGetCategoriesQuery();

    // Filter and search transactions
    const filteredTransactions = useMemo(() => {
        let filtered = transactions;

        // Apply type filter
        if (selectedType !== 'all') {
            filtered = filterTransactions(filtered, { type: selectedType });
        }

        // Apply search
        if (searchQuery.trim()) {
            filtered = searchTransactions(filtered, searchQuery, categories, accounts);
        }

        return filtered;
    }, [transactions, selectedType, searchQuery, categories, accounts]);

    // Group transactions by date
    const groupedTransactions = useMemo(() => {
        const grouped = groupTransactionsByDate(filteredTransactions);

        return Object.entries(grouped)
            .map(([date, dayTransactions]) => {
                let income = 0;
                let expense = 0;

                dayTransactions.forEach(transaction => {
                    if (transaction.type === 'income') {
                        income += transaction.amount;
                    } else if (transaction.type === 'expense') {
                        expense += transaction.amount;
                    }
                });

                return {
                    date,
                    transactions: dayTransactions,
                    totals: {
                        income,
                        expense,
                        net: income - expense,
                    },
                };
            })
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [filteredTransactions]);

    // Handle refresh
    const handleRefresh = async () => {
        setRefreshing(true);
        await refetchTransactions();
        setRefreshing(false);
    };

    // Handle transaction press
    const handleTransactionPress = (transaction: any) => {
        // TODO: Navigate to transaction detail screen
        console.log('Transaction pressed:', transaction.id);
    };

    // Render transaction item
    const renderTransactionItem = ({ item: transaction }: { item: any }) => {
        const account = accounts.find(acc => acc.id === transaction.accountId);
        const category = categories.find(cat => cat.id === transaction.categoryId);
        const accountTo = accounts.find(acc => acc.id === transaction.accountIdTo);

        return (
            <TouchableOpacity
                style={styles.transactionItem}
                onPress={() => handleTransactionPress(transaction)}
                activeOpacity={0.7}
            >
                <View style={styles.transactionLeft}>
                    <View style={[
                        styles.transactionIcon,
                        { backgroundColor: getTransactionTypeColor(transaction.type) + '20' }
                    ]}>
                        <Text style={styles.transactionIconText}>
                            {getTransactionTypeIcon(transaction.type)}
                        </Text>
                    </View>

                    <View style={styles.transactionInfo}>
                        <Text style={styles.transactionNote} numberOfLines={1}>
                            {transaction.note || 'No note'}
                        </Text>
                        <Text style={styles.transactionDetails}>
                            {transaction.type === 'transfer'
                                ? `${account?.name} → ${accountTo?.name}`
                                : `${account?.name} • ${category?.name || 'Uncategorized'}`
                            }
                        </Text>
                        {transaction.tags.length > 0 && (
                            <View style={styles.tagsContainer}>
                                {transaction.tags.slice(0, 2).map((tag: string, index: number) => (
                                    <Text key={index} style={styles.tag}>
                                        #{tag}
                                    </Text>
                                ))}
                                {transaction.tags.length > 2 && (
                                    <Text style={styles.moreTags}>+{transaction.tags.length - 2}</Text>
                                )}
                            </View>
                        )}
                    </View>
                </View>

                <View style={styles.transactionRight}>
                    <Text style={[
                        styles.transactionAmount,
                        { color: getTransactionTypeColor(transaction.type) }
                    ]}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </Text>
                    <Text style={styles.transactionTime}>
                        {new Date(transaction.date).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    // Render daily group
    const renderDailyGroup = ({ item: group }: { item: DailyGroup }) => (
        <View style={styles.dailyGroup}>
            <View style={styles.dailyHeader}>
                <Text style={styles.dailyDate}>{formatDate(group.date, 'long')}</Text>
                <View style={styles.dailyTotals}>
                    {group.totals.income > 0 && (
                        <Text style={[styles.dailyTotal, { color: '#10B981' }]}>
                            +{formatCurrency(group.totals.income)}
                        </Text>
                    )}
                    {group.totals.expense > 0 && (
                        <Text style={[styles.dailyTotal, { color: '#EF4444' }]}>
                            -{formatCurrency(group.totals.expense)}
                        </Text>
                    )}
                </View>
            </View>

            <Card style={styles.transactionsCard}>
                {group.transactions.map((transaction) => (
                    <View key={transaction.id}>
                        {renderTransactionItem({ item: transaction })}
                    </View>
                ))}
            </Card>
        </View>
    );

    // Transaction type filters
    const typeFilters = [
        { type: 'all' as const, label: 'All', color: '#6B7280' },
        { type: 'expense' as const, label: 'Expenses', color: '#EF4444' },
        { type: 'income' as const, label: 'Income', color: '#10B981' },
        { type: 'transfer' as const, label: 'Transfers', color: '#6366F1' },
    ];

    return (
        <SafeContainer>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Transactions</Text>
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => navigation.navigate('AddTransaction' as never)}
                    >
                        <Text style={styles.addButtonText}>+ Add</Text>
                    </TouchableOpacity>
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <Input
                        placeholder="Search transactions..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        leftIcon="search"
                        style={styles.searchInput}
                    />
                </View>

                {/* Type Filters */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.filtersContainer}
                    contentContainerStyle={styles.filtersContent}
                >
                    {typeFilters.map((filter) => (
                        <Chip
                            key={filter.type}
                            label={filter.label}
                            selected={selectedType === filter.type}
                            onPress={() => setSelectedType(filter.type)}
                            color={filter.color}
                            style={styles.filterChip}
                        />
                    ))}
                </ScrollView>

                {/* Transactions List */}
                <FlatList
                    data={groupedTransactions}
                    renderItem={renderDailyGroup}
                    keyExtractor={(item) => item.date}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                    }
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyTitle}>No transactions found</Text>
                            <Text style={styles.emptySubtitle}>
                                {searchQuery || selectedType !== 'all'
                                    ? 'Try adjusting your filters or search terms'
                                    : 'Add your first transaction to get started'
                                }
                            </Text>
                            {!searchQuery && selectedType === 'all' && (
                                <TouchableOpacity
                                    style={styles.emptyButton}
                                    onPress={() => navigation.navigate('AddTransaction' as never)}
                                >
                                    <Text style={styles.emptyButtonText}>Add Transaction</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    }
                />
            </View>
        </SafeContainer>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.xl,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#111827',
    },
    addButton: {
        backgroundColor: '#6366F1',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: 8,
    },
    addButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    searchContainer: {
        paddingHorizontal: Spacing.lg,
        marginBottom: Spacing.md,
    },
    searchInput: {
        backgroundColor: '#F9FAFB',
    },
    filtersContainer: {
        marginBottom: Spacing.lg,
    },
    filtersContent: {
        paddingHorizontal: Spacing.lg,
        gap: Spacing.sm,
    },
    filterChip: {
        marginRight: Spacing.sm,
    },
    listContent: {
        paddingHorizontal: Spacing.lg,
        paddingBottom: Spacing.xl,
    },
    dailyGroup: {
        marginBottom: Spacing.lg,
    },
    dailyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    dailyDate: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
    },
    dailyTotals: {
        flexDirection: 'row',
        gap: Spacing.sm,
    },
    dailyTotal: {
        fontSize: 14,
        fontWeight: '500',
    },
    transactionsCard: {
        padding: 0,
    },
    transactionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    transactionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    transactionIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.md,
    },
    transactionIconText: {
        fontSize: 18,
        color: '#374151',
    },
    transactionInfo: {
        flex: 1,
    },
    transactionNote: {
        fontSize: 16,
        fontWeight: '500',
        color: '#111827',
        marginBottom: Spacing.xs,
    },
    transactionDetails: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: Spacing.xs,
    },
    tagsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    tag: {
        fontSize: 12,
        color: '#6366F1',
        backgroundColor: '#EEF2FF',
        paddingHorizontal: Spacing.xs,
        paddingVertical: 2,
        borderRadius: 4,
        marginRight: Spacing.xs,
    },
    moreTags: {
        fontSize: 12,
        color: '#6B7280',
    },
    transactionRight: {
        alignItems: 'flex-end',
    },
    transactionAmount: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: Spacing.xs,
    },
    transactionTime: {
        fontSize: 12,
        color: '#6B7280',
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: Spacing.xl * 2,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#111827',
        marginBottom: Spacing.sm,
    },
    emptySubtitle: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: Spacing.lg,
    },
    emptyButton: {
        backgroundColor: '#6366F1',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        borderRadius: 8,
    },
    emptyButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});


