import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Card from '../../../components/ui/Card';
import { useTheme } from '../../../app/providers/ThemeProvider';
import { formatCurrency } from '../../../utils/helpers/currencyUtils';
import type { Account } from '../../../types/global';

interface AccountItemProps {
  account: Account;
  onEdit: () => void;
  onDelete: () => void;
}

export const AccountItem: React.FC<AccountItemProps> = ({ account, onEdit, onDelete }) => {
  const { theme } = useTheme();

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

  const getAccountTypeColor = (type: Account['type']) => {
    switch (type) {
      case 'bank': return theme.colors.primary[500];
      case 'cash': return theme.colors.success[500];
      case 'card': return theme.colors.info[500];
      case 'wallet': return theme.colors.secondary[500];
      default: return theme.colors.neutral[500];
    }
  };

  const styles = StyleSheet.create({
    accountCard: {
      padding: 0,
      marginVertical: 4,
    },
    cardContent: {
      padding: 16,
    },
    mainRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    leftSection: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: `${getAccountTypeColor(account.type)}15`,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    accountDetails: {
      flex: 1,
      marginRight: 12,
    },
    accountName: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 2,
    },
    accountType: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      fontWeight: '500',
    },
    rightSection: {
      alignItems: 'flex-end',
    },
    accountBalance: {
      fontSize: 16,
      fontWeight: '700',
      marginBottom: 6,
    },
    positiveBalance: {
      color: theme.colors.success[600],
    },
    negativeBalance: {
      color: theme.colors.error[600],
    },
    actionButtons: {
      flexDirection: 'row',
      gap: 8,
    },
    actionButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surfaceVariant,
    },
    editButton: {
      backgroundColor: `${theme.colors.primary[500]}15`,
    },
    deleteButton: {
      backgroundColor: `${theme.colors.error[500]}15`,
    },
    archivedBadge: {
      position: 'absolute',
      top: 8,
      right: 8,
      paddingVertical: 3,
      paddingHorizontal: 6,
      backgroundColor: theme.colors.warning[50],
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.warning[500],
    },
    archivedText: {
      fontSize: 10,
      fontWeight: '600',
      color: theme.colors.warning[700],
      textTransform: 'uppercase',
      letterSpacing: 0.3,
    },
    archivedOverlay: {
      opacity: 0.7,
    },
  });

  return (
    <Card
      variant="elevated"
      padding="none"
      borderRadius="medium"
      style={StyleSheet.flatten([styles.accountCard, account.isArchived && styles.archivedOverlay])}
    >
      <View style={styles.cardContent}>
        <View style={styles.mainRow}>
          <View style={styles.leftSection}>
            <View style={styles.iconContainer}>
              <Icon
                name={getAccountTypeIcon(account.type)}
                size={22}
                color={getAccountTypeColor(account.type)}
              />
            </View>
            <View style={styles.accountDetails}>
              <Text style={styles.accountName}>{account.name}</Text>
              <Text style={styles.accountType}>{getAccountTypeLabel(account.type)}</Text>
            </View>
          </View>

          <View style={styles.rightSection}>
            <Text style={[
              styles.accountBalance,
              account.openingBalance >= 0 ? styles.positiveBalance : styles.negativeBalance
            ]}>
              {formatCurrency(account.openingBalance, account.currencyCode)}
            </Text>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, styles.editButton]}
                onPress={onEdit}
                activeOpacity={0.7}
              >
                <Icon
                  name="pencil"
                  size={16}
                  color={theme.colors.primary[600]}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={onDelete}
                activeOpacity={0.7}
              >
                <Icon
                  name="trash-outline"
                  size={16}
                  color={theme.colors.error[600]}
                />
              </TouchableOpacity>
            </View>
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