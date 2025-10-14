// src/screens/settings/AccountManagerScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { SafeContainer } from '../../components/layout/SafeContainer';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import { Spacing } from '../../theme';
import { useTheme } from '../../app/providers/ThemeProvider';
import { useGetAccountsQuery, useDeleteAccountMutation } from '../../state/api';
import { AccountItem } from './components/AccountItem';
import type { Account } from '../../types/global';
import BottomSpacing from '../../components/ui/BottomSpacing';
import { showToast } from '../../utils/helpers/toast';


export const AccountManagerScreen: React.FC = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const [showArchived, setShowArchived] = useState(false);

  const { data: accounts = [], isLoading } = useGetAccountsQuery();
  const [deleteAccount] = useDeleteAccountMutation();

  const handleAddAccount = () => {
    navigation.navigate('AccountForm', { accountId: undefined });
  };

  const handleEditAccount = (accountId: string) => {
    navigation.navigate('AccountForm', { accountId });
  };

  const handleDeleteAccount = async (account: Account) => {
    try {
      await deleteAccount(account.id).unwrap();
      showToast.success(`Account "${account.name}" deleted successfully`);
    } catch (error) {
      showToast.error('Failed to delete account. Please try again.');
    }
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

        {/* Header with Add Button */}
        <View style={styles.header}>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            {activeAccounts.length} active account{activeAccounts.length !== 1 ? 's' : ''}
            {archivedAccounts.length > 0 && `, ${archivedAccounts.length} archived`}
          </Text>
          <TouchableOpacity style={[styles.addButton, { backgroundColor: theme.colors.primary[500] }]} onPress={handleAddAccount}>
            <Icon name="add" size={18} color={theme.colors.neutral[0]} />
            <Text style={[styles.addButtonText, { color: theme.colors.neutral[0] }]}>Add</Text>
          </TouchableOpacity>
        </View>

        {/* Show Archived Toggle */}
        {archivedAccounts.length > 0 && (
          <TouchableOpacity
            style={[styles.toggleButton, { backgroundColor: theme.colors.neutral[100] }]}
            onPress={() => setShowArchived(!showArchived)}
          >
            <Text style={[styles.toggleButtonText, { color: theme.colors.primary[500] }]}>
              {showArchived ? 'Hide' : 'Show'} Archived Accounts
            </Text>
            <Icon
              name={showArchived ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={theme.colors.primary[500]}
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
            description={showArchived
              ? "No archived accounts to display"
              : "Get started by adding your first account"
            }
            actionLabel={!showArchived ? "Add Account" : undefined}
            onActionPress={!showArchived ? handleAddAccount : undefined}
          />
        )}

        {/* Bottom spacing for tab bar */}
        <BottomSpacing />
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
    color: '#6B7280', // This will be used statically since it's in the loading component
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280', // Will be overridden by theme in component
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 4,
  },
  addButtonText: {
    fontSize: 14,
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
    borderRadius: 8,
  },
  toggleButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  accountList: {
    paddingHorizontal: Spacing.base,
    gap: 12,
  },
});

