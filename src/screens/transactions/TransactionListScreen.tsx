// src/screens/transactions/TransactionListScreen.tsx
import { useNavigation, useRoute } from '@react-navigation/native';
import dayjs from 'dayjs';
import React, { useMemo, useState } from 'react';
import {
    Alert,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../app/providers/ThemeProvider';
import { SafeContainer } from '../../components/layout/SafeContainer';
import { SectionHeader } from '../../components/lists/SectionHeader';
import { TransactionItem } from '../../components/lists/TransactionItem';
import { Card } from '../../components/ui';
import BottomSpacing from '../../components/ui/BottomSpacing';
import Chip from '../../components/ui/Chip';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useDeleteTransactionMutation, useGetAccountsQuery, useGetCategoriesQuery, useGetTransactionsQuery } from '../../state/api';
import { Transaction } from '../../types/global';
import TransactionFilters from './components/TransactionFilters';

interface GroupedTransaction {
    title: string;
    data: Transaction[];
    total: number;
}

// Define route params interface
interface RouteParams {
    filter?: {
        type?: 'income' | 'expense' | 'transfer';
        categoryId?: string;
        accountId?: string;
    };
}

// Define navigation params for Add screen
interface AddScreenParams {
    editTransaction?: Transaction;
    type?: 'income' | 'expense' | 'transfer';
}

export const TransactionListScreen: React.FC = () => {
    const navigation = useNavigation<{
        navigate: (screen: 'Add' | 'TransactionDetail', params?: AddScreenParams | { transactionId: string }) => void;
    }>();
    const route = useRoute<{ key: string; name: string; params?: RouteParams }>();
    const { theme } = useTheme();

    // State
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState<'all' | 'income' | 'expense' | 'transfer'>('all');
    const [showFilters, setShowFilters] = useState(false);
    const [dateRange, setDateRange] = useState({
        start: dayjs().subtract(30, 'days').startOf('day').toISOString(),
        end: dayjs().endOf('day').toISOString(),
    });
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    // Get initial filter from route params
    React.useEffect(() => {
        if (route.params?.filter) {
            const { type, categoryId, accountId } = route.params.filter;
            if (type) setSelectedType(type);
            if (categoryId) setSelectedCategories([categoryId]);
            if (accountId) setSelectedAccounts([accountId]);
        }
    }, [route.params]);

    // API queries
    const {
        data: transactions = [],
        isLoading,
        error,
        refetch
    } = useGetTransactionsQuery({
        type: selectedType === 'all' ? undefined : selectedType,
        start: dateRange.start,
        end: dateRange.end,
    });

    const [deleteTransaction] = useDeleteTransactionMutation();

    // Additional data queries for better transaction descriptions
    const { data: categories = [], refetch: refetchCategories } = useGetCategoriesQuery();
    const { data: accounts = [], refetch: refetchAccounts } = useGetAccountsQuery();

    // Filter transactions based on search and filters
    const filteredTransactions = useMemo(() => {
        return transactions.filter(transaction => {
            // Search filter
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const matchesNote = transaction.note?.toLowerCase().includes(query);
                const matchesTags = transaction.tags?.some(tag =>
                    tag.toLowerCase().includes(query)
                );
                if (!matchesNote && !matchesTags) return false;
            }

            // Category filter
            if (selectedCategories.length > 0 && transaction.categoryId) {
                if (!selectedCategories.includes(transaction.categoryId)) return false;
            }

            // Account filter
            if (selectedAccounts.length > 0) {
                const matchesAccount = selectedAccounts.includes(transaction.accountId);
                const matchesAccountTo = transaction.accountIdTo &&
                    selectedAccounts.includes(transaction.accountIdTo);
                if (!matchesAccount && !matchesAccountTo) return false;
            }

            return true;
        });
    }, [transactions, searchQuery, selectedCategories, selectedAccounts]);

    // Group transactions by date
    const groupedTransactions = useMemo(() => {
        const groups: { [key: string]: Transaction[] } = {};

        filteredTransactions.forEach(transaction => {
            const date = dayjs(transaction.date).format('YYYY-MM-DD');
            if (!groups[date]) {
                groups[date] = [];
            }
            groups[date].push(transaction);
        });

        return Object.entries(groups)
            .map(([date, data]) => ({
                title: date,
                data: data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
                total: data.reduce((sum, t) => {
                    if (t.type === 'income') return sum + t.amount;
                    if (t.type === 'expense') return sum - t.amount;
                    return sum;
                }, 0),
            }))
            .sort((a, b) => new Date(b.title).getTime() - new Date(a.title).getTime());
    }, [filteredTransactions]);

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            await Promise.all([
                refetch(),
                refetchCategories(),
                refetchAccounts(),
            ]);
        } finally {
            setRefreshing(false);
        }
    };

    const handleTransactionPress = (transaction: Transaction) => {
        navigation.navigate('TransactionDetail', { transactionId: transaction.id });
    };

    const handleTransactionEdit = (transaction: Transaction) => {
        navigation.navigate('Add', {
            editTransaction: transaction,
            type: transaction.type
        });
    };

    const handleTransactionDelete = (transaction: Transaction) => {
        Alert.alert(
            'Delete Transaction',
            'Are you sure you want to delete this transaction? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteTransaction(transaction.id).unwrap();
                        } catch (handleTransactionError) {
                            Alert.alert('Error', `Failed to delete transaction because ${handleTransactionError}`);
                        }
                    },
                },
            ]
        );
    };

    const handleAddTransaction = () => {
        navigation.navigate('Add', {});
    };

    const clearFilters = () => {
        setSelectedType('all');
        setSearchQuery('');
        setSelectedCategories([]);
        setSelectedAccounts([]);
        setDateRange({
            start: dayjs().subtract(30, 'days').startOf('day').toISOString(),
            end: dayjs().endOf('day').toISOString(),
        });
    };

    const getActiveFiltersCount = () => {
        let count = 0;
        if (selectedType !== 'all') count++;
        if (searchQuery) count++;
        if (selectedCategories.length > 0) count++;
        if (selectedAccounts.length > 0) count++;
        return count;
    };

    const formatSectionTitle = (dateString: string) => {
        const date = dayjs(dateString);
        const today = dayjs();
        const yesterday = dayjs().subtract(1, 'day');

        if (date.isSame(today, 'day')) {
            return 'Today';
        } else if (date.isSame(yesterday, 'day')) {
            return 'Yesterday';
        } else if (date.isSame(today, 'year')) {
            return date.format('MMM D, ddd');
        } else {
            return date.format('MMM D, YYYY');
        }
    };

    const renderSectionHeader = ({ section }: { section: GroupedTransaction }) => (
        <SectionHeader
            title={formatSectionTitle(section.title)}
            subtitle={`${section.data.length} transaction${section.data.length !== 1 ? 's' : ''}`}
            amount={section.total}
        />
    );

    const renderTransaction = ({ item }: { item: Transaction }) => (
        <TransactionItem
            transaction={item}
            onPress={() => handleTransactionPress(item)}
            onEdit={() => handleTransactionEdit(item)}
            onDelete={() => handleTransactionDelete(item)}
            categories={categories}
            accounts={accounts}
        />
    );

    if (isLoading && transactions.length === 0) {
        return (
            <SafeContainer>
                <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
                    <LoadingSpinner size="large" />
                    <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
                        Loading transactions...
                    </Text>
                </View>
            </SafeContainer>
        );
    }

    if (error) {
        console.log('Transaction loading error:', error);

        // Determine error type and message
        const errorData = error as any;
        const isTimeoutError = errorData?.status === 'TIMEOUT_ERROR' ||
            errorData?.error?.includes('AbortError');

        const errorTitle = isTimeoutError
            ? 'Connection Timeout'
            : 'Failed to Load Transactions';

        const errorMessage = isTimeoutError
            ? 'The request took too long. Please check your connection and try again.'
            : 'Unable to load transactions. Please try again.';

        return (
            <SafeContainer>
                <View style={[styles.errorContainer, { backgroundColor: theme.colors.background }]}>
                    <Text style={[styles.errorText, { color: theme.colors.error[500] }]}>
                        {errorTitle}
                    </Text>
                    <Text style={[styles.errorSubText, { color: theme.colors.textSecondary }]}>
                        {errorMessage}
                    </Text>
                    <TouchableOpacity
                        onPress={handleRefresh}
                        style={[styles.retryButton, { backgroundColor: theme.colors.primary[500] }]}
                        activeOpacity={0.8}
                    >
                        <Text style={[styles.retryText, { color: theme.colors.onPrimary }]}>
                            Retry
                        </Text>
                    </TouchableOpacity>
                </View>
            </SafeContainer>
        );
    }

    return (
        <SafeContainer>
            <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
                {/* Header */}
                {/* <Card style={[styles.header, { backgroundColor: theme.colors.surface }]}> */}
                <Card>
                    <Text style={[styles.title, { color: theme.colors.text }]}>
                        Transactions
                    </Text>

                    {/* Search Bar */}
                    <View style={[styles.searchContainer, { backgroundColor: theme.colors.background }]}>
                        <TextInput
                            style={[styles.searchInput, { color: theme.colors.text }]}
                            placeholder="Search transactions..."
                            placeholderTextColor={theme.colors.textSecondary}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        <TouchableOpacity
                            onPress={() => setShowFilters(!showFilters)}
                            style={[
                                styles.filterButton,
                                {
                                    backgroundColor: getActiveFiltersCount() > 0
                                        ? theme.colors.primary[500]
                                        : theme.colors.background,
                                }
                            ]}
                            activeOpacity={0.7}
                        >
                            <Icon
                                name="options"
                                size={18}
                                color={getActiveFiltersCount() > 0
                                    ? theme.colors.onPrimary
                                    : theme.colors.textSecondary}
                            />
                            {getActiveFiltersCount() > 0 && (
                                <View style={[styles.filterBadge, { backgroundColor: theme.colors.error[500] }]}>
                                    <Text style={[styles.filterBadgeText, { color: theme.colors.onError }]}>
                                        {getActiveFiltersCount()}
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Type Filter Chips */}
                    <View style={styles.typeFilters}>
                        {(['all', 'income', 'expense', 'transfer'] as const).map((type) => (
                            <Chip
                                key={type}
                                label={type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
                                selected={selectedType === type}
                                onPress={() => setSelectedType(type)}
                                style={styles.typeChip}
                            />
                        ))}
                    </View>
                </Card>

                {/* Advanced Filters Modal */}
                {showFilters &&
                    <TransactionFilters
                        visible={showFilters}
                        dateRange={dateRange}
                        onDateRangeChange={setDateRange}
                        selectedCategories={selectedCategories}
                        onCategoriesChange={setSelectedCategories}
                        selectedAccounts={selectedAccounts}
                        onAccountsChange={setSelectedAccounts}
                        onClose={() => setShowFilters(false)}
                        onClear={clearFilters}
                        categories={categories}
                        accounts={accounts}
                    />
                }

                {/* Transaction List */}
                {groupedTransactions.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <EmptyState
                            title="No transactions found"
                            description={
                                getActiveFiltersCount() > 0
                                    ? "Try adjusting your filters"
                                    : "Start by adding your first transaction"
                            }
                            actionLabel="Add Transaction"
                            onActionPress={handleAddTransaction}
                        />
                        {getActiveFiltersCount() > 0 && (
                            <TouchableOpacity
                                onPress={clearFilters}
                                style={[styles.clearFiltersButton, { borderColor: theme.colors.primary[500] }]}
                                activeOpacity={0.7}
                            >
                                <Text style={[styles.clearFiltersText, { color: theme.colors.primary[500] }]}>
                                    Clear Filters
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                ) : (
                    <FlatList
                        data={groupedTransactions}
                        renderItem={({ item }) => (
                            <View>
                                {renderSectionHeader({ section: item })}
                                {item.data.map((transaction) => (
                                    <View key={transaction.id}>
                                        {renderTransaction({ item: transaction })}
                                    </View>
                                ))}
                            </View>
                        )}
                        keyExtractor={(item) => item.title}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={handleRefresh}
                                colors={[theme.colors.primary[500]]}
                                tintColor={theme.colors.primary[500]}
                            />
                        }
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.listContent}
                    />
                )}
            </View>

            {/* Bottom spacing for tab bar */}
            <BottomSpacing />
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
        fontSize: 16,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
        textAlign: 'center',
    },
    errorSubText: {
        fontSize: 14,
        marginBottom: 16,
        textAlign: 'center',
        lineHeight: 20,
    },
    retryButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryText: {
        fontSize: 16,
        fontWeight: '500',
    },
    header: {
        padding: 20,
        paddingBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 4,
        marginBottom: 16,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        paddingVertical: 12,
    },
    filterButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    filterBadge: {
        position: 'absolute',
        top: -2,
        right: -2,
        width: 16,
        height: 16,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    filterBadgeText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    typeFilters: {
        flexDirection: 'row',
        gap: 8,
    },
    typeChip: {
        marginRight: 0,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 40,
    },
    clearFiltersButton: {
        marginTop: 24,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        marginBottom: 20,
    },
    clearFiltersText: {
        fontSize: 14,
        fontWeight: '500',
    },
    listContent: {
        padding: 16,
        paddingBottom: 100,
    },
    separator: {
        height: StyleSheet.hairlineWidth,
        marginLeft: 60,
    },
});