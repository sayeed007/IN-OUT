import React from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import dayjs from 'dayjs';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../../app/providers/ThemeProvider';
import Card from '../../../components/ui/Card';
import { Transaction, Category, Account } from '../../../types/global';

interface RecentTransactionsProps {
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  onSeeAll: () => void;
  maxItems?: number;
}

const RecentTransactions: React.FC<RecentTransactionsProps> = ({
  transactions,
  categories,
  accounts,
  onSeeAll,
  maxItems = 3,
}) => {
  const { theme } = useTheme();
  const navigation = useNavigation();

  // Helper function to get meaningful transaction description
  const getTransactionDescription = (transaction: Transaction) => {
    if (transaction.note) {
      return transaction.note;
    }

    if (transaction.categoryId) {
      const category = categories.find(cat => cat.id === transaction.categoryId);
      if (category) {
        return category.name;
      }
    }

    if (transaction.type === 'transfer') {
      const fromAccount = accounts.find(acc => acc.id === transaction.accountId);
      const toAccount = accounts.find(acc => acc.id === transaction.accountIdTo);
      if (fromAccount && toAccount) {
        return `Transfer: ${fromAccount.name} → ${toAccount.name}`;
      }
    }

    return `${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}`;
  };

  const handleTransactionPress = (transaction: Transaction) => {
    navigation.navigate('ModalStack', {
      screen: 'TransactionDetail',
      params: { transactionId: transaction.id },
    });
  };

  const renderTransactionItem = ({ item }: { item: Transaction }) => (
    <TouchableOpacity
      style={[
        styles.transactionItem,
        { borderBottomColor: theme.colors.border }
      ]}
      onPress={() => handleTransactionPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.transactionInfo}>
        <Text style={[styles.transactionNote, { color: theme.colors.text }]}>
          {getTransactionDescription(item)}
        </Text>
        <Text style={[styles.transactionDate, { color: theme.colors.textSecondary }]}>
          {dayjs(item.date).format('MMM D')}
        </Text>
      </View>
      <Text style={[
        styles.transactionAmount,
        {
          color: item.type === 'income'
            ? theme.colors.success[500]
            : item.type === 'expense'
              ? theme.colors.error[500]
              : theme.colors.text
        }
      ]}>
        {item.type === 'income' ? '+' : item.type === 'expense' ? '-' : ''}
        ${item.amount.toFixed(2)}
      </Text>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Recent Transactions
      </Text>
      <TouchableOpacity
        onPress={onSeeAll}
        activeOpacity={0.7}
      >
        <Text style={[styles.seeAllText, { color: theme.colors.primary[500] }]}>
          See All
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (transactions.length === 0) {
    return null;
  }

  return (
    <Card style={styles.container}>
      <FlatList
        data={transactions.slice(0, maxItems)}
        keyExtractor={(item) => item.id}
        renderItem={renderTransactionItem}
        ListHeaderComponent={renderHeader}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
      />
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionNote: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 14,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default RecentTransactions;
