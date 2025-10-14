// src/screens/transactions/AddTransactionScreen.tsx
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeContainer } from '../../components/layout/SafeContainer';
import Icon from 'react-native-vector-icons/Ionicons';
import type { TabScreenProps } from '../../app/navigation/types';
import { AccountSelector } from '../../components/forms/AccountSelector';
import { CategorySelector } from '../../components/forms/CategorySelector';
import { DatePicker } from '../../components/forms/DatePicker';
import { TagInput } from '../../components/forms/TagInput';
import { Header } from '../../components/layout/Header';
import { AccountCreationModal } from '../../components/modals/AccountCreationModal';
import { CategoryCreationModal } from '../../components/modals/CategoryCreationModal';
import { Button } from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import {
  useAddTransactionMutation,
  useGetAccountsQuery,
  useGetCategoriesQuery,
} from '../../state/api';
import type { Transaction, TransactionType } from '../../types/global';
import { validateTransaction } from '../../utils/helpers/validationUtils';
import Animated from 'react-native-reanimated';
import { showToast } from '../../utils/helpers/toast';

type Props = TabScreenProps<'Add'>;

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

export const AddTransactionScreen: React.FC<Props> = ({ navigation, route }) => {
  const { type: initialType, accountId, categoryId } = route?.params || {};

  const [transactionType, setTransactionType] = useState<TransactionType>(initialType || 'expense');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['essentials']));

  // Quick add modals state
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const { data: accounts = [] } = useGetAccountsQuery();
  const { data: categories = [] } = useGetCategoriesQuery();
  const [addTransaction] = useAddTransactionMutation();

  // Get user preferences for smart defaults
  const getSmartDefaults = () => {
    // This could come from user preferences/recent transactions
    // For now, just use the first account and first matching category
    const defaultAccount = accounts[0];
    const recentCategory = categories.find(cat => cat.type === transactionType);

    return {
      accountId: accountId || defaultAccount?.id || '',
      categoryId: categoryId || recentCategory?.id || '',
      date: new Date().toISOString(),
    };
  };

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
  } = useForm<TransactionForm>({
    defaultValues: {
      type: transactionType,
      amount: '',
      ...getSmartDefaults(),
      accountIdTo: '',
      note: '',
      tags: [],
    },
  });

  const watchedAmount = watch('amount');
  const watchedAccountId = watch('accountId');
  const watchedAccountIdTo = watch('accountIdTo');
  const watchedCategoryId = watch('categoryId');

  // Update form when route params change (e.g., coming from dashboard quick actions)
  useFocusEffect(
    useCallback(() => {
      if (initialType && initialType !== transactionType) {
        // Route params have a type, update the form
        setTransactionType(initialType);
        setValue('type', initialType);

        const defaultAccount = accounts[0];
        const defaultCategory = categories.find(cat => cat.type === initialType);

        reset({
          type: initialType,
          amount: '',
          accountId: accountId || defaultAccount?.id || '',
          categoryId: categoryId || defaultCategory?.id || '',
          accountIdTo: '',
          date: new Date().toISOString(),
          note: '',
          tags: [],
        });
      } else if (!initialType && !accountId && !categoryId && accounts.length > 0) {
        // Only reset if no route params were provided (meaning user navigated naturally)
        const defaultAccount = accounts[0];
        const defaultCategory = categories.find(cat => cat.type === transactionType);

        reset({
          type: transactionType,
          amount: '',
          accountId: defaultAccount?.id || '',
          categoryId: defaultCategory?.id || '',
          accountIdTo: '',
          date: new Date().toISOString(),
          note: '',
          tags: [],
        });
      }
    }, [reset, transactionType, initialType, accountId, categoryId, accounts, categories, setValue])
  );


  // Calculate form completion - use useMemo to prevent infinite re-renders
  const formSteps = useMemo(() => {
    return [
      {
        id: 'amount',
        title: 'Amount',
        required: true,
        completed: !!watchedAmount && parseFloat(watchedAmount) > 0,
      },
      {
        id: 'account',
        title: 'Account',
        required: true,
        completed: !!watchedAccountId,
      },
      {
        id: 'transferAccount',
        title: 'To Account',
        required: transactionType === 'transfer',
        completed: transactionType !== 'transfer' || !!watchedAccountIdTo,
      },
      {
        id: 'category',
        title: 'Category',
        required: transactionType !== 'transfer',
        completed: transactionType === 'transfer' || !!watchedCategoryId,
      },
    ];
  }, [watchedAmount, watchedAccountId, watchedAccountIdTo, watchedCategoryId, transactionType]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const handleTypeChange = (type: TransactionType) => {
    setTransactionType(type);
    setValue('type', type);

    // Auto-set smart defaults when type changes
    if (type !== 'transfer' && !watchedCategoryId) {
      const suggestedCategory = categories.find(cat => cat.type === type);
      if (suggestedCategory) {
        setValue('categoryId', suggestedCategory.id);
      }
    }
  };


  const handleQuickAddAccount = () => {
    setShowAccountModal(true);
  };

  const handleQuickAddCategory = () => {
    setShowCategoryModal(true);
  };

  const handleAccountCreated = (account: any) => {
    // Auto-select the newly created account
    setValue('accountId', account.id);
  };

  const handleCategoryCreated = (category: any) => {
    // Auto-select the newly created category
    setValue('categoryId', category.id);
  };

  const onSubmit = async (data: TransactionForm) => {
    try {
      setIsSubmitting(true);

      // Convert amount to number
      const amount = parseFloat(data.amount);
      if (isNaN(amount) || amount <= 0) {
        showToast.error('Please enter a valid amount');
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
        currencyCode: accounts.find(acc => acc.id === data.accountId)?.currencyCode || 'BDT',
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
        showToast.error(errorMessages, 'Validation Error');
        return;
      }

      // Submit transaction
      await addTransaction(transactionData).unwrap();

      showToast.success('Transaction added successfully!');

      // Reset form to allow adding another transaction
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

    } catch (error) {
      console.error('Failed to add transaction:', error);
      showToast.error('Failed to add transaction. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = () => {
    const requiredSteps = formSteps.filter(step => step.required);
    return requiredSteps.every(step => step.completed);
  };

  const filteredCategories = categories.filter(category =>
    transactionType === 'transfer' ? false : category.type === transactionType
  );


  return (
    <SafeContainer style={styles.container}>
      {/* Header with Progress */}
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
          {/* Quick Type Selector - Always visible */}
          <Card style={styles.card}>
            <View style={styles.typeSelector}>
              {(['income', 'expense', 'transfer'] as TransactionType[]).map((type) => (
                <Button
                  key={type}
                  title={type.charAt(0).toUpperCase() + type.slice(1)}
                  variant={transactionType === type ? 'primary' : 'secondary'}
                  onPress={() => handleTypeChange(type)}
                  style={styles.typeButton}
                  textStyle={styles.typeButtonText}
                  size='small'
                />
              ))}
            </View>
          </Card>

          {/* Essential Information - Always expanded */}
          <Card style={styles.card}>

            {/* Title - Essential Details */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Essential Details</Text>
              <Controller
                control={control}
                name="date"
                render={({ field: { value, onChange } }) => (
                  <DatePicker
                    date={new Date(value)}
                    onDateChange={(date) => onChange(date.toISOString())}
                    showLabel={false}
                    compact={true}
                    placeholder="Today"
                  />
                )}
              />
            </View>

            {/* Amount Input */}
            <Controller
              control={control}
              name="amount"
              rules={{ required: 'Amount is required' }}
              render={({ field: { value, onChange } }) => (
                <Input
                  label="Amount"
                  value={value}
                  onChangeText={onChange}
                  placeholder="0.00"
                  keyboardType="numeric"
                  inputStyle={styles.amountInput}
                />
              )}
            />

            {/* Account Selection with Floating Label */}
            <Controller
              control={control}
              name="accountId"
              rules={{ required: 'Account is required' }}
              render={({ field: { value, onChange } }) => (
                <AccountSelector
                  accounts={accounts}
                  selectedAccountId={value}
                  onSelectAccount={onChange}
                  compact={true}
                  floatingLabel={true}
                  label="Account"
                  onQuickAdd={handleQuickAddAccount}
                />
              )}
            />

            {/* Transfer To Account */}
            {transactionType === 'transfer' && (
              <Controller
                control={control}
                name="accountIdTo"
                rules={{ required: 'Destination account is required' }}
                render={({ field: { value, onChange } }) => (
                  <AccountSelector
                    accounts={accounts.filter(acc => acc.id !== watchedAccountId)}
                    selectedAccountId={value}
                    onSelectAccount={onChange}
                    compact={true}
                    floatingLabel={true}
                    label="To Account"
                    onQuickAdd={handleQuickAddAccount}
                  />
                )}
              />
            )}

            {/* Category Selection with Floating Label */}
            {transactionType !== 'transfer' && (
              <Controller
                control={control}
                name="categoryId"
                rules={{ required: 'Category is required' }}
                render={({ field: { value, onChange } }) => (
                  <CategorySelector
                    categories={filteredCategories}
                    selectedCategoryId={value}
                    onSelectCategory={onChange}
                    compact={true}
                    floatingLabel={true}
                    label="Category"
                    onQuickAdd={handleQuickAddCategory}
                  />
                )}
              />
            )}
          </Card>

          {/* Optional Details - Collapsible */}
          <Card style={styles.card}>
            <TouchableOpacity
              style={styles.collapsibleHeader}
              onPress={() => toggleSection('optional')}
            >
              <Text style={styles.sectionTitle}>Optional Details</Text>
              <Icon
                name={expandedSections.has('optional') ? 'chevron-up' : 'chevron-down'}
                size={20}
                color="#6b7280"
              />
            </TouchableOpacity>

            {expandedSections.has('optional') && (
              <Animated.View style={styles.collapsibleContent}>

                {/* Note */}
                <Controller
                  control={control}
                  name="note"
                  render={({ field: { value, onChange } }) => (
                    <Input
                      label="Note"
                      value={value}
                      onChangeText={onChange}
                      placeholder="Add a note (optional)"
                      multiline
                      numberOfLines={2}
                      inputStyle={styles.noteInput}
                    />
                  )}
                />

                {/* Tags */}
                <Controller
                  control={control}
                  name="tags"
                  render={({ field: { value, onChange } }) => (
                    <TagInput
                      tags={value}
                      onTagsChange={onChange}
                      placeholder="Add tags (optional)"
                    />
                  )}
                />
              </Animated.View>
            )}
          </Card>

        </ScrollView>

        {/* Floating Action Button */}
        <View style={styles.floatingButton}>
          <Button
            title={isFormValid() ? "Save Transaction" : "Complete Required Fields"}
            onPress={handleSubmit(onSubmit)}
            loading={isSubmitting}
            disabled={!isFormValid()}
            style={StyleSheet.flatten([
              styles.submitButton,
              !isFormValid() && styles.submitButtonDisabled
            ])}
          />
        </View>
      </KeyboardAvoidingView>

      {/* Account Creation Modal */}
      <AccountCreationModal
        visible={showAccountModal}
        onClose={() => setShowAccountModal(false)}
        onAccountCreated={handleAccountCreated}
      />

      {/* Category Creation Modal */}
      <CategoryCreationModal
        visible={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onCategoryCreated={handleCategoryCreated}
        type={transactionType}
      />
    </SafeContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  progressContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  card: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  typeButton: {
    flex: 1,
  },
  typeButtonText: {
    fontSize: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  collapsibleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  collapsibleContent: {
    marginTop: 12,
  },
  noteInput: {
    marginBottom: 12,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 8,
  },
  quickActionText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  submitButton: {
    width: '100%',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
  },
  amountInput: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 0,
  },
});
