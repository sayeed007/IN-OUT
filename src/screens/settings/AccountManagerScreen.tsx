// src/screens/settings/AccountManagerScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { SafeContainer } from '../../components/layout/SafeContainer';
import Card from '../../components/ui/Card';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import { Spacing } from '../../theme';
import { useGetAccountsQuery, useDeleteAccountMutation } from '../../state/api';
import { formatCurrency } from '../../features/transactions/utils/transactionUtils';
import type { Account } from '../../types/global';

const AccountItem: React.FC<{
  account: Account;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ account, onEdit, onDelete }) => {
  const getAccountTypeIcon = (type: Account['type']) => {
    switch (type) {
      case 'bank': return 'card-outline';
      case 'cash': return 'wallet-outline';
      case 'card': return 'card-outline';
      case 'wallet': return 'wallet-outline';
      default: return 'ellipse-outline';
    }
  };

  const getAccountTypeLabel = (type: Account['type']) => {
    switch (type) {
      case 'bank': return 'Bank Account';
      case 'cash': return 'Cash';
      case 'card': return 'Credit/Debit Card';
      case 'wallet': return 'Digital Wallet';
      case 'other': return 'Other';
      default: return type;
    }
  };

  return (
    <Card style={styles.accountCard}>
      <View style={styles.accountHeader}>
        <View style={styles.accountInfo}>
          <Icon 
            name={getAccountTypeIcon(account.type)} 
            size={24} 
            color="#6366F1" 
            style={styles.accountIcon}
          />
          <View style={styles.accountDetails}>
            <Text style={styles.accountName}>{account.name}</Text>
            <Text style={styles.accountType}>{getAccountTypeLabel(account.type)}</Text>
          </View>
        </View>
        <View style={styles.accountActions}>
          <Text style={[
            styles.accountBalance,
            account.openingBalance >= 0 ? styles.positiveBalance : styles.negativeBalance
          ]}>
            {formatCurrency(account.openingBalance, account.currencyCode)}
          </Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton} onPress={onEdit}>
              <Icon name="pencil" size={16} color="#6B7280" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={onDelete}>
              <Icon name="trash-outline" size={16} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      {account.isArchived && (
        <View style={styles.archivedBadge}>
          <Text style={styles.archivedText}>Archived</Text>
        </View>
      )}
    </Card>
  );
};

export const AccountManagerScreen: React.FC = () => {
  const navigation = useNavigation();
  const [showArchived, setShowArchived] = useState(false);
  
  const { data: accounts = [], isLoading, error, refetch } = useGetAccountsQuery();
  const [deleteAccount] = useDeleteAccountMutation();

  const handleAddAccount = () => {
    navigation.navigate('AccountForm' as any, { accountId: undefined });
  };

  const handleEditAccount = (accountId: string) => {
    navigation.navigate('AccountForm' as any, { accountId });
  };

  const handleDeleteAccount = (account: Account) => {
    Alert.alert(
      'Delete Account',
      `Are you sure you want to delete "${account.name}"? This action cannot be undone and will also delete all associated transactions.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAccount(account.id).unwrap();
              Alert.alert('Success', 'Account deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete account. Please try again.');
            }
          }
        }
      ]
    );
  };

  const filteredAccounts = accounts.filter(account => 
    showArchived ? true : !account.isArchived
  );

  const activeAccounts = accounts.filter(account => !account.isArchived);
  const archivedAccounts = accounts.filter(account => account.isArchived);

  if (isLoading) {
    return (
      <SafeContainer>
        <View style={styles.loadingContainer}>
          <LoadingSpinner size="large" />
          <Text style={styles.loadingText}>Loading accounts...</Text>
        </View>
      </SafeContainer>
    );
  }

  return (
    <SafeContainer>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Manage Accounts</Text>
          <Text style={styles.subtitle}>
            {activeAccounts.length} active account{activeAccounts.length !== 1 ? 's' : ''}
            {archivedAccounts.length > 0 && `, ${archivedAccounts.length} archived`}
          </Text>
        </View>

        {/* Add Account Button */}
        <TouchableOpacity style={styles.addButton} onPress={handleAddAccount}>
          <Icon name="add-circle" size={24} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Add New Account</Text>
        </TouchableOpacity>

        {/* Show Archived Toggle */}
        {archivedAccounts.length > 0 && (
          <TouchableOpacity 
            style={styles.toggleButton} 
            onPress={() => setShowArchived(!showArchived)}
          >
            <Text style={styles.toggleButtonText}>
              {showArchived ? 'Hide' : 'Show'} Archived Accounts
            </Text>
            <Icon 
              name={showArchived ? 'chevron-up' : 'chevron-down'} 
              size={20} 
              color="#6366F1" 
            />
          </TouchableOpacity>
        )}

        {/* Account List */}
        {filteredAccounts.length > 0 ? (
          <View style={styles.accountList}>
            {filteredAccounts.map((account) => (
              <AccountItem
                key={account.id}
                account={account}
                onEdit={() => handleEditAccount(account.id)}
                onDelete={() => handleDeleteAccount(account)}
              />
            ))}
          </View>
        ) : (
          <EmptyState
            icon="wallet-outline"
            title="No accounts found"
            subtitle={showArchived 
              ? "No archived accounts to display" 
              : "Get started by adding your first account"
            }
            actionText={!showArchived ? "Add Account" : undefined}
            onAction={!showArchived ? handleAddAccount : undefined}
          />
        )}
      </ScrollView>
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
    color: '#6B7280',
  },
  header: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.base,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366F1',
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.base,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.base,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  toggleButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6366F1',
  },
  accountList: {
    paddingHorizontal: Spacing.base,
    gap: 12,
  },
  accountCard: {
    padding: 16,
  },
  accountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  accountInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  accountIcon: {
    marginRight: 12,
  },
  accountDetails: {
    flex: 1,
  },
  accountName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  accountType: {
    fontSize: 14,
    color: '#6B7280',
  },
  accountActions: {
    alignItems: 'flex-end',
  },
  accountBalance: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  positiveBalance: {
    color: '#10B981',
  },
  negativeBalance: {
    color: '#EF4444',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
  },
  archivedBadge: {
    marginTop: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#FEF3C7',
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  archivedText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#92400E',
  },
});