// src/screens/settings/AccountManagerScreen.tsx
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../app/providers/ThemeProvider';
import BottomSpacing from '../../components/ui/BottomSpacing';
import EmptyState from '../../components/ui/EmptyState';
import { GradientHeader } from '../../components/ui/GradientHeader';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useDeleteAccountMutation, useGetAccountsQuery } from '../../state/api';
import type { Account } from '../../types/global';
import { showToast } from '../../utils/helpers/toast';
import { AccountItem } from './components/AccountItem';


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
      <View style={styles.container}>
        <GradientHeader
          title="Manage Accounts"
          subtitle={`${activeAccounts.length} active account${activeAccounts.length !== 1 ? 's' : ''}`}
          showBackButton={true}
          onBackPress={() => navigation.goBack()}
          rightIcon="add-circle-outline"
          onRightPress={handleAddAccount}
        />
        <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
          <LoadingSpinner size="large" />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Loading accounts...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <GradientHeader
        title="Accounts"
        subtitle={`${activeAccounts.length} active, ${archivedAccounts.length} archived`}
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
        rightIcon="add-circle-outline"
        onRightPress={handleAddAccount}
      />
      <ScrollView
        style={[styles.content, { backgroundColor: theme.colors.background }]}
        showsVerticalScrollIndicator={false}
      >

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
    paddingHorizontal: 12,
    paddingTop: 8,
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
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 4,
    marginVertical: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  toggleButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  accountList: {
    paddingHorizontal: 4,
    gap: 12,
  },
});

