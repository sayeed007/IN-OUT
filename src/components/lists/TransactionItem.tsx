import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../app/providers/ThemeProvider';
import { Transaction } from '../../types/global';

interface TransactionItemProps {
  transaction: Transaction;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
  categories?: any[];
  accounts?: any[];
}

export const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction,
  onPress,
  onEdit,
  onDelete,
  categories = [],
  accounts = [],
}) => {
  const { theme } = useTheme();

  // Helper function to get meaningful transaction description
  const getTransactionDescription = () => {
    if (transaction.note) {
      return transaction.note;
    }

    if (transaction.categoryId && categories.length > 0) {
      const category = categories.find(cat => cat.id === transaction.categoryId);
      if (category) {
        return category.name;
      }
    }

    if (transaction.type === 'transfer' && accounts.length > 0) {
      const fromAccount = accounts.find(acc => acc.id === transaction.accountId);
      const toAccount = accounts.find(acc => acc.id === transaction.accountIdTo);
      if (fromAccount && toAccount) {
        return `${fromAccount.name} → ${toAccount.name}`;
      }
    }

    return `${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}`;
  };

  const getTransactionIcon = () => {
    switch (transaction.type) {
      case 'income':
        return 'arrow-down-circle';
      case 'expense':
        return 'arrow-up-circle';
      case 'transfer':
        return 'swap-horizontal';
      default:
        return 'ellipse';
    }
  };

  const getTransactionColor = () => {
    switch (transaction.type) {
      case 'income':
        return theme.colors.success[500];
      case 'expense':
        return theme.colors.error[500];
      case 'transfer':
        return theme.colors.primary[500];
      default:
        return theme.colors.textSecondary;
    }
  };

  const formatAmount = (amount: number) => {
    const prefix = transaction.type === 'expense' ? '-' : '+';
    const absAmount = Math.abs(amount);
    return `${prefix}$${absAmount.toFixed(2)}`;
  };

  const handleLongPress = () => {
    Alert.alert(
      'Transaction Options',
      'What would you like to do with this transaction?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Edit', onPress: onEdit },
        { text: 'Delete', onPress: onDelete, style: 'destructive' },
      ]
    );
  };

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: theme.colors.surface }]}
      onPress={onPress}
      onLongPress={handleLongPress}
      activeOpacity={0.7}
    >
      {/* Transaction Icon */}
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: getTransactionColor() + '20',
          },
        ]}
      >
        <Icon
          name={getTransactionIcon()}
          size={20}
          color={getTransactionColor()}
        />
      </View>

      {/* Transaction Details */}
      <View style={styles.detailsContainer}>
        <View style={styles.mainDetails}>
          <Text
            style={[styles.note, { color: theme.colors.text }]}
            numberOfLines={1}
          >
            {getTransactionDescription()}
          </Text>
          <Text
            style={[
              styles.amount,
              {
                color: getTransactionColor(),
              },
            ]}
          >
            {formatAmount(transaction.amount)}
          </Text>
        </View>

        <View style={styles.subDetails}>
          <Text
            style={[styles.type, { color: theme.colors.textSecondary }]}
            numberOfLines={1}
          >
            {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
            {transaction.tags && transaction.tags.length > 0 && (
              <Text style={[styles.tags, { color: theme.colors.textTertiary }]}>
                {' • ' + transaction.tags.slice(0, 2).join(', ')}
                {transaction.tags.length > 2 && ` +${transaction.tags.length - 2} more`}
              </Text>
            )}
          </Text>
          <Text style={[styles.time, { color: theme.colors.textSecondary }]}>
            {new Date(transaction.date).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      </View>

      {/* Attachment Indicator */}
      {transaction.attachmentIds && transaction.attachmentIds.length > 0 && (
        <View style={styles.attachmentIndicator}>
          <Text style={[styles.attachmentIcon, { color: theme.colors.textTertiary }]}>
            📎
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginVertical: 6,
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailsContainer: {
    flex: 1,
  },
  mainDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  note: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    marginRight: 12,
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  subDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  type: {
    flex: 1,
    fontSize: 14,
    marginRight: 12,
  },
  tags: {
    fontSize: 12,
  },
  time: {
    fontSize: 12,
  },
  attachmentIndicator: {
    marginLeft: 8,
  },
  attachmentIcon: {
    fontSize: 16,
  },
});

export default TransactionItem;
