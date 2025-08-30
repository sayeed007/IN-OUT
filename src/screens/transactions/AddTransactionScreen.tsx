// src/screens/transactions/AddTransactionScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Header } from '../../components/layout/Header';
import { AmountKeypad } from '../../components/forms/AmountKeypad';
import { AccountSelector } from '../../components/forms/AccountSelector';
import { CategorySelector } from '../../components/forms/CategorySelector';
import { DatePicker } from '../../components/forms/DatePicker';
import { TagInput } from '../../components/forms/TagInput';
import {
  useGetAccountsQuery,
  useGetCategoriesQuery,
  useAddTransactionMutation,
} from '../../state/api';
import { validateTransaction } from '../../utils/helpers/validationUtils';
import { formatCurrency } from '../../utils/helpers/currencyUtils';
import type { Transaction, TransactionType } from '../../types/global';
import type { AddScreenProps } from '../../app/navigation/types';

type Props = AddScreenProps<'AddTransaction'>;

interface TransactionForm {
  type: TransactionType;
  amount: string;
  accountId: string;
  accountIdTo?: string;
  categoryId?: string;
  date: string;
  note: string;
  tags: string[];
}

const AddTransactionScreen: React.FC<Props> = ({ navigation, route }) => {
  const { type: initialType, accountId, categoryId } = route?.params || {};
  
  const [transactionType, setTransactionType] = useState<TransactionType>(initialType || 'expense');
  const [showAmountKeypad, setShowAmountKeypad] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: accounts = [] } = useGetAccountsQuery();
  const { data: categories = [] } = useGetCategoriesQuery();
  const [addTransaction] = useAddTransactionMutation();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<TransactionForm>({
    defaultValues: {
      type: transactionType,
      amount: '',
      accountId: accountId || '',
      accountIdTo: '',
      categoryId: categoryId || '',
      date: new Date().toISOString(),
      note: '',
      tags: [],
    },
  });

  const watchedAmount = watch('amount');
  const watchedAccountId = watch('accountId');
  const watchedType = watch('type');

  useEffect(() => {
    setValue('type', transactionType);
    // Clear category for transfers
    if (transactionType === 'transfer') {
      setValue('categoryId', '');
    }
    // Clear accountIdTo for non-transfers
    if (transactionType !== 'transfer') {
      setValue('accountIdTo', '');
    }
  }, [transactionType, setValue]);

  const handleTypeChange = (type: TransactionType) => {
    setTransactionType(type);
    setValue('type', type);
  };

  const handleAmountChange = (amount: string) => {
    setValue('amount', amount);
  };

  const onSubmit = async (data: TransactionForm) => {
    try {
      setIsSubmitting(true);

      // Convert amount to number
      const amount = parseFloat(data.amount);
      if (isNaN(amount) || amount <= 0) {
        Alert.alert('Error', 'Please enter a valid amount');
        return;
      }

      // Prepare transaction data
      const transactionData: Partial<Transaction> = {
        type: data.type,
        amount,
        accountId: data.accountId,
        accountIdTo: data.type === 'transfer' ? data.accountIdTo : null,
        categoryId: data.type !== 'transfer' ? data.categoryId : null,
        date: data.date,
        note: data.note || undefined,
        tags: data.tags,
        attachmentIds: [],
        currencyCode: accounts.find(acc => acc.id === data.accountId)?.currencyCode || 'USD',
      };

      // Validate transaction
      const validationResults = validateTransaction({
        type: data.type,
        amount,
        accountId: data.accountId,
        accountIdTo: data.accountIdTo,
        categoryId: data.categoryId,
        date: data.date,
        note: data.note,
      });

      // Check for validation errors
      const hasErrors = Object.values(validationResults).some(result => !result.isValid);
      if (hasErrors) {
        const errorMessages = Object.values(validationResults)
          .flatMap(result => result.errors)
          .join('\n');
        Alert.alert('Validation Error', errorMessages);
        return;
      }

      // Submit transaction
      await addTransaction(transactionData).unwrap();

      Alert.alert(
        'Success',
        'Transaction added successfully!',
        [
          {
            text: 'Add Another',
            onPress: () => {
              reset({
                type: transactionType,
                amount: '',
                accountId: data.accountId, // Keep same account
                accountIdTo: '',
                categoryId: data.type !== 'transfer' ? data.categoryId : '', // Keep same category if not transfer
                date: new Date().toISOString(),
                note: '',
                tags: [],
              });
            },
          },
          {
            text: 'Done',
            style: 'default',
            onPress: () => navigation.goBack(),
          },
        ]
      );

    } catch (error) {
      console.error('Failed to add transaction:', error);
      Alert.alert('Error', 'Failed to add transaction. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCategories = categories.filter(category => 
    transactionType === 'transfer' ? false : category.type === transactionType
  );

  const getSelectedAccount = () => {
    return accounts.find(acc => acc.id === watchedAccountId);
  };

  const getAmountDisplay = () => {
    if (!watchedAmount) return '$0.00';
    const amount = parseFloat(watchedAmount) || 0;
    const selectedAccount = getSelectedAccount();
    return formatCurrency(amount, selectedAccount?.currencyCode || 'USD');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header 
        title="Add Transaction"
        showBackButton
        onBackPress={() => navigation.goBack()}
      />

      <KeyboardAvoidingView 
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Transaction Type Selector */}
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Transaction Type</Text>
            <View style={styles.typeSelector}>
              {(['income', 'expense', 'transfer'] as TransactionType[]).map((type) => (
                <Button
                  key={type}
                  title={type.charAt(0).toUpperCase() + type.slice(1)}
                  variant={transactionType === type ? 'primary' : 'secondary'}
                  onPress={() => handleTypeChange(type)}
                  style={styles.typeButton}
                />
              ))}
            </View>
          </Card>

          {/* Amount Display */}
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Amount</Text>
            <Text style={styles.amountDisplay}>{getAmountDisplay()}</Text>
            <Button
              title="Enter Amount"
              variant="secondary"
              onPress={() => setShowAmountKeypad(true)}
            />
            {errors.amount && (
              <Text style={styles.errorText}>{errors.amount.message}</Text>
            )}
          </Card>

          {/* Account Selection */}
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>
              {transactionType === 'transfer' ? 'From Account' : 'Account'}
            </Text>
            <Controller
              control={control}
              name="accountId"
              rules={{ required: 'Account is required' }}
              render={({ field: { value, onChange } }) => (
                <AccountSelector
                  accounts={accounts}
                  selectedAccountId={value}
                  onSelectAccount={onChange}
                />
              )}
            />
            {errors.accountId && (
              <Text style={styles.errorText}>{errors.accountId.message}</Text>
            )}
          </Card>

          {/* Transfer To Account */}
          {transactionType === 'transfer' && (
            <Card style={styles.card}>
              <Text style={styles.sectionTitle}>To Account</Text>
              <Controller
                control={control}
                name="accountIdTo"
                rules={{ required: 'Destination account is required' }}
                render={({ field: { value, onChange } }) => (
                  <AccountSelector
                    accounts={accounts.filter(acc => acc.id !== watchedAccountId)}
                    selectedAccountId={value}
                    onSelectAccount={onChange}
                  />
                )}
              />
              {errors.accountIdTo && (
                <Text style={styles.errorText}>{errors.accountIdTo.message}</Text>
              )}
            </Card>
          )}

          {/* Category Selection */}
          {transactionType !== 'transfer' && (
            <Card style={styles.card}>
              <Text style={styles.sectionTitle}>Category</Text>
              <Controller
                control={control}
                name="categoryId"
                rules={{ required: 'Category is required' }}
                render={({ field: { value, onChange } }) => (
                  <CategorySelector
                    categories={filteredCategories}
                    selectedCategoryId={value}
                    onSelectCategory={onChange}
                  />
                )}
              />
              {errors.categoryId && (
                <Text style={styles.errorText}>{errors.categoryId.message}</Text>
              )}
            </Card>
          )}

          {/* Date Selection */}
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Date</Text>
            <Controller
              control={control}
              name="date"
              rules={{ required: 'Date is required' }}
              render={({ field: { value, onChange } }) => (
                <DatePicker
                  date={new Date(value)}
                  onDateChange={(date) => onChange(date.toISOString())}
                />
              )}
            />
          </Card>

          {/* Note */}
          <Card style={styles.card}>
            <Controller
              control={control}
              name="note"
              render={({ field: { value, onChange } }) => (
                <Input
                  label="Note (Optional)"
                  value={value}
                  onChangeText={onChange}
                  placeholder="Add a note for this transaction"
                  multiline
                  numberOfLines={3}
                />
              )}
            />
          </Card>

          {/* Tags */}
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Tags</Text>
            <Controller
              control={control}
              name="tags"
              render={({ field: { value, onChange } }) => (
                <TagInput
                  tags={value}
                  onTagsChange={onChange}
                  placeholder="Add tags to categorize this transaction"
                />
              )}
            />
          </Card>
        </ScrollView>

        {/* Submit Button */}
        <View style={styles.footer}>
          <Button
            title="Save Transaction"
            onPress={handleSubmit(onSubmit)}
            loading={isSubmitting}
            disabled={!watchedAmount || parseFloat(watchedAmount) <= 0}
            style={styles.submitButton}
          />
        </View>
      </KeyboardAvoidingView>

      {/* Amount Keypad Modal */}
      <AmountKeypad
        visible={showAmountKeypad}
        amount={watchedAmount}
        onAmountChange={handleAmountChange}
        onClose={() => setShowAmountKeypad(false)}
        currencyCode={getSelectedAccount()?.currencyCode || 'USD'}
      />
    </SafeAreaView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
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
  typeSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  typeButton: {
    flex: 1,
  },
  amountDisplay: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 16,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginTop: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  submitButton: {
    width: '100%',
  },
});

export default AddTransactionScreen;
