// src/screens/accounts/AccountManagerScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { FloatingActionButton } from '../../components/ui/FloatingActionButton';
import { Header } from '../../components/layout/Header';
import {
  useGetAccountsQuery,
  useDeleteAccountMutation,
  useGetTransactionsQuery,
} from '../../state/api';
import { formatCurrency } from '../../utils/helpers/currencyUtils';
import type { Account } from '../../types/global';

interface Props {
  navigation: any;
}

const AccountManagerScreen: React.FC<Props> = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);

  const { data: accounts = [], isLoading, refetch } = useGetAccountsQuery();
  const { data: allTransactions = [] } = useGetTransactionsQuery({});
  const [deleteAccount] = useDeleteAccountMutation();

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

  const handleAddAccount = () => {
    navigation.navigate('AccountForm');
  };

  const handleEditAccount = (account: Account) => {
    navigation.navigate('AccountForm', { accountId: account.id });
  };

  const handleDeleteAccount = (account: Account) => {
    // Check if account has transactions
    const accountTransactions = allTransactions.filter(
      tx => tx.accountId === account.id || tx.accountIdTo === account.id
    );

    if (accountTransactions.length > 0) {
      Alert.alert(
        'Cannot Delete Account',
        `This account has ${accountTransactions.length} transaction(s). Please delete or reassign these transactions first.`,
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Delete Account',
      `Are you sure you want to delete "${account.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => confirmDelete(account),
        },
      ]
    );
  };

  const confirmDelete = async (account: Account) => {
    try {
      await deleteAccount(account.id).unwrap();
    } catch (error) {
      Alert.alert('Error', 'Failed to delete account');
    }
  };

  const calculateAccountBalance = (account: Account) => {
    const accountTransactions = allTransactions.filter(
      tx => tx.accountId === account.id || tx.accountIdTo === account.id
    );

    // Debug logging
    console.log(`Account: ${account.name} (ID: ${account.id})`);
    console.log(`Opening Balance: ${account.openingBalance}`);
    console.log(`Transactions for this account:`, accountTransactions);

    const balance = accountTransactions.reduce((total, tx) => {
      console.log(`Processing transaction: ${tx.type} - ${tx.amount} (Account: ${tx.accountId})`);

      if (tx.accountId === account.id) {
        // This account is the source
        if (tx.type === 'income') {
          console.log(`Adding income: ${total} + ${tx.amount} = ${total + tx.amount}`);
          return total + tx.amount;
        } else if (tx.type === 'expense') {
          console.log(`Subtracting expense: ${total} - ${tx.amount} = ${total - tx.amount}`);
          return total - tx.amount;
        } else if (tx.type === 'transfer') {
          console.log(`Transfer out: ${total} - ${tx.amount} = ${total - tx.amount}`);
          return total - tx.amount; // Money going out
        }
      }

      if (tx.accountIdTo === account.id && tx.type === 'transfer') {
        // This account is the destination for a transfer
        console.log(`Transfer in: ${total} + ${tx.amount} = ${total + tx.amount}`);
        return total + tx.amount; // Money coming in
      }

      return total;
    }, account.openingBalance);

    console.log(`Final balance for ${account.name}: ${balance}`);
    return balance;
  };

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'cash':
        return '💵';
      case 'bank':
        return '🏦';
      case 'card':
        return '💳';
      case 'wallet':
        return '👛';
      default:
        return '💰';
    }
  };

  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case 'cash':
        return '#10B981';
      case 'bank':
        return '#3B82F6';
      case 'card':
        return '#8B5CF6';
      case 'wallet':
        return '#F59E0B';
      default:
        return '#6B7280';
    }
  };

  const renderAccount = ({ item }: { item: Account }) => {
    const currentBalance = calculateAccountBalance(item);
    const transactionCount = allTransactions.filter(
      tx => tx.accountId === item.id || tx.accountIdTo === item.id
    ).length;

    return (
      <Card style={styles.accountCard}>
        <TouchableOpacity
          style={styles.accountContent}
          onPress={() => handleEditAccount(item)}
          activeOpacity={0.7}
        >
          <View style={styles.accountHeader}>
            <View style={styles.accountIconContainer}>
              <Text style={styles.accountIcon}>{getAccountIcon(item.type)}</Text>
            </View>
            <View style={styles.accountInfo}>
              <Text style={styles.accountName}>{item.name}</Text>
              <View style={styles.accountTypeContainer}>
                <View
                  style={[
                    styles.accountTypeBadge,
                    { backgroundColor: getAccountTypeColor(item.type) + '20' }
                  ]}
                >
                  <Text
                    style={[
                      styles.accountTypeText,
                      { color: getAccountTypeColor(item.type) }
                    ]}
                  >
                    {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                  </Text>
                </View>
                {item.isArchived && (
                  <View style={styles.archivedBadge}>
                    <Text style={styles.archivedText}>Archived</Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          <View style={styles.accountBalance}>
            <Text style={styles.balanceLabel}>Current Balance</Text>
            <Text
              style={[
                styles.balanceAmount,
                { color: currentBalance >= 0 ? '#10B981' : '#EF4444' }
              ]}
            >
              {formatCurrency(currentBalance, item.currencyCode)}
            </Text>
            <Text style={styles.transactionCount}>
              {transactionCount} transaction{transactionCount !== 1 ? 's' : ''}
            </Text>
          </View>

          <View style={styles.accountActions}>
            <Button
              title="Edit"
              variant="secondary"
              size="small"
              onPress={() => handleEditAccount(item)}
              style={styles.actionButton}
            />
            <Button
              title="Delete"
              variant="danger"
              size="small"
              onPress={() => handleDeleteAccount(item)}
              style={styles.actionButton}
            />
          </View>
        </TouchableOpacity>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header
          title="Accounts"
          showBackButton
          onBackPress={() => navigation.goBack()}
        />
        <View style={styles.loadingContainer}>
          <LoadingSpinner size="large" />
          <Text style={styles.loadingText}>Loading accounts...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Accounts"
        showBackButton
        onBackPress={() => navigation.goBack()}
      />

      {accounts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <EmptyState
            title="No accounts yet"
            message="Create your first account to start tracking your finances"
            actionLabel="Add Account"
            onAction={handleAddAccount}
          />
        </View>
      ) : (
        <>
          {/* Summary Card */}
          <Card style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Account Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Accounts:</Text>
              <Text style={styles.summaryValue}>{accounts.length}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Active:</Text>
              <Text style={styles.summaryValue}>
                {accounts.filter(acc => !acc.isArchived).length}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Balance:</Text>
              <Text
                style={[
                  styles.summaryValue,
                  styles.totalBalance,
                  {
                    color: accounts.reduce((total, acc) => total + calculateAccountBalance(acc), 0) >= 0
                      ? '#10B981'
                      : '#EF4444'
                  }
                ]}
              >
                {formatCurrency(
                  accounts.reduce((total, acc) => total + calculateAccountBalance(acc), 0),
                  accounts[0]?.currencyCode || 'BDT'
                )}
              </Text>
            </View>
          </Card>

          {/* Accounts List */}
          <FlatList
            data={accounts}
            renderItem={renderAccount}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
              />
            }
            showsVerticalScrollIndicator={false}
          />
        </>
      )}

      {/* Floating Action Button */}
      <FloatingActionButton
        onPress={handleAddAccount}
        icon="+"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  summaryCard: {
    margin: 16,
    marginBottom: 8,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#64748b',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  totalBalance: {
    fontSize: 18,
    fontWeight: '700',
  },
  listContainer: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 100,
  },
  accountCard: {
    marginBottom: 12,
  },
  accountContent: {
    padding: 0,
  },
  accountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  accountIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  accountIcon: {
    fontSize: 24,
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  accountTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  accountTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  accountTypeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  archivedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#fbbf24',
  },
  archivedText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#92400e',
  },
  accountBalance: {
    alignItems: 'center',
    marginBottom: 20,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  transactionCount: {
    fontSize: 12,
    color: '#64748b',
  },
  accountActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
});

export default AccountManagerScreen;
