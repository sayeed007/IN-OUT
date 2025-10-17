// src/screens/transactions/TransactionDetailScreen.tsx
import React, { useState } from 'react';
import {
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import type { ModalStackScreenProps } from '../../types/navigation';
import { useTheme } from '../../app/providers/ThemeProvider';
import { Button } from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Chip from '../../components/ui/Chip';
import { GradientHeader } from '../../components/ui/GradientHeader';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ConfirmationModal from '../../components/modals/ConfirmationModal';
import {
  useDeleteTransactionMutation,
  useGetAccountsQuery,
  useGetCategoriesQuery,
  useGetTransactionQuery,
} from '../../state/api';
import { formatCurrency } from '../../utils/helpers/currencyUtils';
import { formatDisplayDate, formatTime } from '../../utils/helpers/dateUtils';
import { showToast } from '../../utils/helpers/toast';
import { getTransactionTypeColor } from '../../utils/helpers/transactionUtils';

type Props = ModalStackScreenProps<'TransactionDetail'>;

const TransactionDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { transactionId } = route.params;
  const { theme } = useTheme();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const { data: transaction, isLoading, error } = useGetTransactionQuery(transactionId);
  const { data: accounts = [] } = useGetAccountsQuery();
  const { data: categories = [] } = useGetCategoriesQuery();
  const [deleteTransaction] = useDeleteTransactionMutation();

  const handleEdit = () => {
    if (transaction) {
      navigation.navigate('EditTransaction', {
        transactionId: transaction.id,
      });
    }
  };

  const handleDeletePress = () => {
    setShowDeleteConfirmation(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setIsDeleting(true);
      setShowDeleteConfirmation(false);
      await deleteTransaction(transactionId).unwrap();
      showToast.success('Transaction deleted successfully');
      navigation.goBack();
    } catch (deleteError) {
      showToast.error('Failed to delete transaction');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirmation(false);
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

  const getCategory = (categoryId: string | null) => {
    return categoryId ? categories.find(cat => cat.id === categoryId) : null;
  };

  const getAmountDisplay = () => {
    if (!transaction) return '';

    const prefix = transaction.type === 'income' ? '+' : transaction.type === 'expense' ? '-' : '';
    return `${prefix}${formatCurrency(transaction.amount, transaction.currencyCode)}`;
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <GradientHeader
          title="Transaction Details"
          subtitle="Loading..."
          showBackButton
          onBackPress={() => navigation.goBack()}
        />
        <View style={styles.loadingContainer}>
          <LoadingSpinner size="large" />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Loading transaction...
          </Text>
        </View>
      </View>
    );
  }

  if (error || !transaction) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <GradientHeader
          title="Transaction Details"
          subtitle="Error loading transaction"
          showBackButton
          onBackPress={() => navigation.goBack()}
        />
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.colors.error[500] }]}>
            Failed to load transaction details
          </Text>
          <Button
            title="Go Back"
            onPress={() => navigation.goBack()}
            variant="secondary"
          />
        </View>
      </View>
    );
  }

  const account = getAccount(transaction.accountId);
  const accountTo = transaction.accountIdTo ? getAccount(transaction.accountIdTo) : null;
  const category = getCategory(transaction?.categoryId || '');
  console.log(category);

  const getTransactionSubtitle = () => {
    const typeText = transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1);
    return `${typeText} - ${formatDisplayDate(transaction.date)}`;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <GradientHeader
        title="Transaction Details"
        subtitle={getTransactionSubtitle()}
        showBackButton
        onBackPress={() => navigation.goBack()}
        rightElement={
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
                { color: getTransactionTypeColor(transaction.type) }
              ]}
            >
              {getAmountDisplay()}
            </Text>
            <Chip
              label={transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
              style={StyleSheet.flatten([styles.typeChip, { backgroundColor: `${getTransactionTypeColor(transaction.type) + 15}` }])}
              textStyle={{ color: getTransactionTypeColor(transaction.type) }}
            />
          </View>

          <View style={styles.dateSection}>
            <Text style={[styles.dateText, { color: theme.colors.text }]}>
              {formatDisplayDate(transaction.date)}
            </Text>
            <Text style={[styles.timeText, { color: theme.colors.textSecondary }]}>
              {formatTime(transaction.date)}
            </Text>
          </View>
        </Card>

        {/* Account Information */}
        <Card style={styles.card}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {transaction.type === 'transfer' ? 'Accounts' : 'Account'}
          </Text>

          <View style={styles.accountSection}>
            <View style={styles.accountInfo}>
              <Text style={[styles.accountLabel, { color: theme.colors.textSecondary }]}>
                {transaction.type === 'transfer' ? 'From' : 'Account'}
              </Text>
              <Text style={[styles.accountName, { color: theme.colors.text }]}>
                {account?.name || 'Unknown Account'}
              </Text>
              <Text style={[styles.accountType, { color: theme.colors.textSecondary }]}>
                {account?.type.charAt(0).toUpperCase() + (account?.type.slice(1) || '')}
              </Text>
            </View>

            {transaction.type === 'transfer' && accountTo && (
              <>
                <View style={styles.transferArrow}>
                  <Text style={[styles.arrowText, { color: theme.colors.textSecondary }]}>→</Text>
                </View>
                <View style={styles.accountInfo}>
                  <Text style={[styles.accountLabel, { color: theme.colors.textSecondary }]}>To</Text>
                  <Text style={[styles.accountName, { color: theme.colors.text }]}>
                    {accountTo.name}
                  </Text>
                  <Text style={[styles.accountType, { color: theme.colors.textSecondary }]}>
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
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Category</Text>
            <View style={styles.categorySection}>
              <View style={[styles.categoryIcon, { backgroundColor: category.color + '20' }]}>
                <Icon name={category.icon} size={24} color={category.color} />
              </View>
              <View style={styles.categoryInfo}>
                <Text style={[styles.categoryName, { color: theme.colors.text }]}>
                  {category.name}
                </Text>
                <Text style={[styles.categoryType, { color: theme.colors.textSecondary }]}>
                  {category.type.charAt(0).toUpperCase() + category.type.slice(1)}
                </Text>
              </View>
            </View>
          </Card>
        )}

        {/* Note */}
        {transaction.note && (
          <Card style={styles.card}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Note</Text>
            <Text style={[styles.noteText, { color: theme.colors.text }]}>
              {transaction.note}
            </Text>
          </Card>
        )}

        {/* Tags */}
        {transaction.tags.length > 0 && (
          <Card style={styles.card}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Tags</Text>
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
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Details</Text>
          <View style={styles.metadataContainer}>
            <View style={styles.metadataRow}>
              <Text style={[styles.metadataLabel, { color: theme.colors.textSecondary }]}>
                Transaction ID
              </Text>
              <Text style={[styles.metadataValue, { color: theme.colors.text }]}>
                {transaction.id.slice(-8)}
              </Text>
            </View>
            <View style={styles.metadataRow}>
              <Text style={[styles.metadataLabel, { color: theme.colors.textSecondary }]}>
                Created
              </Text>
              <Text style={[styles.metadataValue, { color: theme.colors.text }]}>
                {formatDisplayDate(transaction.createdAt)}
              </Text>
            </View>
            {transaction.createdAt !== transaction.updatedAt && (
              <View style={styles.metadataRow}>
                <Text style={[styles.metadataLabel, { color: theme.colors.textSecondary }]}>
                  Last Modified
                </Text>
                <Text style={[styles.metadataValue, { color: theme.colors.text }]}>
                  {formatDisplayDate(transaction.updatedAt)}
                </Text>
              </View>
            )}
          </View>
        </Card>
      </ScrollView>

      {/* Action Buttons */}
      <View style={[
        styles.actionButtons,
        {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border
        }
      ]}>
        <Button
          title="Edit"
          onPress={handleEdit}
          variant="secondary"
          style={styles.actionButton}
        />
        <Button
          title="Delete"
          onPress={handleDeletePress}
          variant="danger"
          style={styles.actionButton}
          loading={isDeleting}
        />
      </View>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        visible={showDeleteConfirmation}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        confirmStyle="destructive"
        icon="trash-outline"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
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
    marginBottom: 4,
  },
  timeText: {
    fontSize: 14,
  },
  card: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
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
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  accountName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  accountType: {
    fontSize: 14,
  },
  transferArrow: {
    marginHorizontal: 16,
  },
  arrowText: {
    fontSize: 20,
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
    marginBottom: 2,
  },
  categoryType: {
    fontSize: 14,
  },
  noteText: {
    fontSize: 16,
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
  },
  metadataValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
});

export default TransactionDetailScreen;
