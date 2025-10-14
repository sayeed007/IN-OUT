// src/screens/transactions/TransactionDetailScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
} from 'react-native';
import { SafeContainer } from '../../components/layout/SafeContainer';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Header } from '../../components/layout/Header';
import { Chip } from '../../components/ui/Chip';
import {
  useGetTransactionQuery,
  useDeleteTransactionMutation,
  useGetAccountsQuery,
  useGetCategoriesQuery,
} from '../../state/api';
import { formatCurrency } from '../../utils/helpers/currencyUtils';
import { formatDisplayDate, formatTime } from '../../utils/helpers/dateUtils';
import type { TransactionScreenProps } from '../../app/navigation/types';
import { showToast } from '../../utils/helpers/toast';

type Props = TransactionScreenProps<'TransactionDetail'>;

const TransactionDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { transactionId } = route.params;
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: transaction, isLoading, error } = useGetTransactionQuery(transactionId);
  const { data: accounts = [] } = useGetAccountsQuery();
  const { data: categories = [] } = useGetCategoriesQuery();
  const [deleteTransaction] = useDeleteTransactionMutation();

  const handleEdit = () => {
    if (transaction) {
      navigation.navigate('AddTransaction', {
        type: transaction.type,
        editTransaction: transaction,
      });
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteTransaction(transactionId).unwrap();
      showToast.success('Transaction deleted successfully');
      navigation.goBack();
    } catch (deleteError) {
      showToast.error('Failed to delete transaction');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleShare = async () => {
    if (!transaction) return;

    const account = accounts.find(acc => acc.id === transaction.accountId);
    const category = categories.find(cat => cat.id === transaction.categoryId);
    const accountTo = transaction.accountIdTo ? accounts.find(acc => acc.id === transaction.accountIdTo) : null;

    let message = `Transaction Details:\n\n`;
    message += `Type: ${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}\n`;
    message += `Amount: ${formatCurrency(transaction.amount, transaction.currencyCode)}\n`;
    message += `Date: ${formatDisplayDate(transaction.date)} at ${formatTime(transaction.date)}\n`;
    
    if (account) {
      message += `${transaction.type === 'transfer' ? 'From ' : ''}Account: ${account.name}\n`;
    }
    
    if (accountTo) {
      message += `To Account: ${accountTo.name}\n`;
    }
    
    if (category) {
      message += `Category: ${category.name}\n`;
    }
    
    if (transaction.note) {
      message += `Note: ${transaction.note}\n`;
    }
    
    if (transaction.tags.length > 0) {
      message += `Tags: ${transaction.tags.join(', ')}\n`;
    }

    try {
      await Share.share({
        message,
        title: 'Transaction Details',
      });
    } catch (shareError) {
      console.error('Failed to share transaction:', shareError);
    }
  };

  const getAccount = (accountId: string) => {
    return accounts.find(acc => acc.id === accountId);
  };

  const getCategory = (categoryId?: string) => {
    if (!categoryId) return null;
    return categories.find(cat => cat.id === categoryId);
  };

  const getTransactionTypeColor = () => {
    if (!transaction) return '#6B7280';
    
    switch (transaction.type) {
      case 'income':
        return '#10B981';
      case 'expense':
        return '#EF4444';
      case 'transfer':
        return '#3B82F6';
      default:
        return '#6B7280';
    }
  };

  const getAmountDisplay = () => {
    if (!transaction) return '';
    
    const prefix = transaction.type === 'income' ? '+' : transaction.type === 'expense' ? '-' : '';
    return `${prefix}${formatCurrency(transaction.amount, transaction.currencyCode)}`;
  };

  if (isLoading) {
    return (
      <SafeContainer style={styles.container}>
        <Header 
          title="Transaction Details"
          showBackButton
          onBackPress={() => navigation.goBack()}
        />
        <View style={styles.loadingContainer}>
          <LoadingSpinner size="large" />
          <Text style={styles.loadingText}>Loading transaction...</Text>
        </View>
      </SafeContainer>
    );
  }

  if (error || !transaction) {
    return (
      <SafeContainer style={styles.container}>
        <Header 
          title="Transaction Details"
          showBackButton
          onBackPress={() => navigation.goBack()}
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Failed to load transaction details
          </Text>
          <Button
            title="Go Back"
            onPress={() => navigation.goBack()}
            variant="secondary"
          />
        </View>
      </SafeContainer>
    );
  }

  const account = getAccount(transaction.accountId);
  const accountTo = transaction.accountIdTo ? getAccount(transaction.accountIdTo) : null;
  const category = getCategory(transaction.categoryId);

  return (
    <SafeContainer style={styles.container}>
      <Header 
        title="Transaction Details"
        showBackButton
        onBackPress={() => navigation.goBack()}
        rightComponent={
          <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
            <Text style={styles.shareIcon}>📤</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {/* Main Transaction Info */}
        <Card style={styles.mainCard}>
          <View style={styles.amountSection}>
            <Text 
              style={[
                styles.amountText, 
                { color: getTransactionTypeColor() }
              ]}
            >
              {getAmountDisplay()}
            </Text>
            <Chip 
              label={transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
              style={[styles.typeChip, { backgroundColor: `${getTransactionTypeColor()}15` }]}
              textStyle={{ color: getTransactionTypeColor() }}
            />
          </View>

          <View style={styles.dateSection}>
            <Text style={styles.dateText}>
              {formatDisplayDate(transaction.date)}
            </Text>
            <Text style={styles.timeText}>
              {formatTime(transaction.date)}
            </Text>
          </View>
        </Card>

        {/* Account Information */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>
            {transaction.type === 'transfer' ? 'Accounts' : 'Account'}
          </Text>
          
          <View style={styles.accountSection}>
            <View style={styles.accountInfo}>
              <Text style={styles.accountLabel}>
                {transaction.type === 'transfer' ? 'From' : 'Account'}
              </Text>
              <Text style={styles.accountName}>
                {account?.name || 'Unknown Account'}
              </Text>
              <Text style={styles.accountType}>
                {account?.type.charAt(0).toUpperCase() + (account?.type.slice(1) || '')}
              </Text>
            </View>

            {transaction.type === 'transfer' && accountTo && (
              <>
                <View style={styles.transferArrow}>
                  <Text style={styles.arrowText}>→</Text>
                </View>
                <View style={styles.accountInfo}>
                  <Text style={styles.accountLabel}>To</Text>
                  <Text style={styles.accountName}>{accountTo.name}</Text>
                  <Text style={styles.accountType}>
                    {accountTo.type.charAt(0).toUpperCase() + accountTo.type.slice(1)}
                  </Text>
                </View>
              </>
            )}
          </View>
        </Card>

        {/* Category Information */}
        {transaction.type !== 'transfer' && category && (
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Category</Text>
            <View style={styles.categorySection}>
              <View style={[styles.categoryIcon, { backgroundColor: category.color + '20' }]}>
                <Text style={[styles.categoryIconText, { color: category.color }]}>
                  {category.icon}
                </Text>
              </View>
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryName}>{category.name}</Text>
                <Text style={styles.categoryType}>
                  {category.type.charAt(0).toUpperCase() + category.type.slice(1)}
                </Text>
              </View>
            </View>
          </Card>
        )}

        {/* Note */}
        {transaction.note && (
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Note</Text>
            <Text style={styles.noteText}>{transaction.note}</Text>
          </Card>
        )}

        {/* Tags */}
        {transaction.tags.length > 0 && (
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Tags</Text>
            <View style={styles.tagsContainer}>
              {transaction.tags.map((tag, index) => (
                <Chip 
                  key={index}
                  label={tag}
                  style={styles.tagChip}
                />
              ))}
            </View>
          </Card>
        )}

        {/* Transaction Metadata */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Details</Text>
          <View style={styles.metadataContainer}>
            <View style={styles.metadataRow}>
              <Text style={styles.metadataLabel}>Transaction ID</Text>
              <Text style={styles.metadataValue}>{transaction.id.slice(-8)}</Text>
            </View>
            <View style={styles.metadataRow}>
              <Text style={styles.metadataLabel}>Created</Text>
              <Text style={styles.metadataValue}>
                {formatDisplayDate(transaction.createdAt)}
              </Text>
            </View>
            {transaction.createdAt !== transaction.updatedAt && (
              <View style={styles.metadataRow}>
                <Text style={styles.metadataLabel}>Last Modified</Text>
                <Text style={styles.metadataValue}>
                  {formatDisplayDate(transaction.updatedAt)}
                </Text>
              </View>
            )}
          </View>
        </Card>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <Button
          title="Edit"
          onPress={handleEdit}
          variant="secondary"
          style={styles.actionButton}
        />
        <Button
          title="Delete"
          onPress={handleDelete}
          variant="danger"
          style={styles.actionButton}
          loading={isDeleting}
        />
      </View>
    </SafeContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 20,
  },
  shareButton: {
    padding: 8,
  },
  shareIcon: {
    fontSize: 20,
  },
  mainCard: {
    marginBottom: 16,
    alignItems: 'center',
  },
  amountSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  amountText: {
    fontSize: 36,
    fontWeight: '700',
    marginBottom: 8,
  },
  typeChip: {
    alignSelf: 'center',
  },
  dateSection: {
    alignItems: 'center',
  },
  dateText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 4,
  },
  timeText: {
    fontSize: 14,
    color: '#64748b',
  },
  card: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  accountSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accountInfo: {
    flex: 1,
  },
  accountLabel: {
    fontSize: 12,
    color: '#64748b',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  accountName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 2,
  },
  accountType: {
    fontSize: 14,
    color: '#64748b',
  },
  transferArrow: {
    marginHorizontal: 16,
  },
  arrowText: {
    fontSize: 20,
    color: '#64748b',
  },
  categorySection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryIconText: {
    fontSize: 20,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 2,
  },
  categoryType: {
    fontSize: 14,
    color: '#64748b',
  },
  noteText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagChip: {
    backgroundColor: '#f3f4f6',
  },
  metadataContainer: {
    gap: 8,
  },
  metadataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metadataLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  metadataValue: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
});

export default TransactionDetailScreen;
