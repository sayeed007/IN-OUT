// src/screens/transactions/AddTransactionScreen.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useFocusEffect } from '@react-navigation/native';
import {
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import type { TabScreenProps } from '../../app/navigation/types';
import { AccountSelector } from '../../components/forms/AccountSelector';
import { AmountKeypad } from '../../components/forms/AmountKeypad';
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
import { formatCurrency } from '../../utils/helpers/currencyUtils';
import { validateTransaction } from '../../utils/helpers/validationUtils';

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
  const [showAmountKeypad, setShowAmountKeypad] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['essentials']));
  const amountLabelAnimation = useRef(new Animated.Value(0)).current;

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

  // Reset form when screen comes into focus (user navigates back)
  // But skip reset if user came with route params (intentional pre-fill)
  useFocusEffect(
    useCallback(() => {
      // Only reset if no route params were provided (meaning user navigated naturally)
      if (!initialType && !accountId && !categoryId && accounts.length > 0) {
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
    }, [reset, transactionType, initialType, accountId, categoryId, accounts, categories])
  );

  useEffect(() => {
    Animated.timing(amountLabelAnimation, {
      toValue: watchedAmount ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [watchedAmount, amountLabelAnimation]);

  const amountLabelStyle = {
    fontSize: amountLabelAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 12],
    }),
    color: amountLabelAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: ['#9CA3AF', '#6366F1'],
    }),
    transform: [{
      translateY: amountLabelAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -12],
      })
    }]
  };

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

  const handleAmountChange = (amount: string) => {
    setValue('amount', amount);
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

  const isFormValid = () => {
    const requiredSteps = formSteps.filter(step => step.required);
    return requiredSteps.every(step => step.completed);
  };

  const getCompletionPercentage = () => {
    const requiredSteps = formSteps.filter(step => step.required);
    const completedSteps = requiredSteps.filter(step => step.completed);
    return (completedSteps.length / requiredSteps.length) * 100;
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
      {/* Header with Progress */}
      <Header
        title="Add Transaction"
        showBackButton
        onBackPress={() => navigation.goBack()}
      />

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${getCompletionPercentage()}%` }
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {Math.round(getCompletionPercentage())}% complete
        </Text>
      </View>

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
          <Card style={styles.card} padding='small'>
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
          <Card style={styles.card} padding='small'>

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

            {/* Amount - Floating Label Design */}
            <View style={styles.floatingInputContainer}>
              <Animated.Text style={[
                styles.floatingInputLabel,
                amountLabelStyle
              ]}>
                Amount
              </Animated.Text>
              <TouchableOpacity
                style={styles.floatingAmountInput}
                onPress={() => setShowAmountKeypad(true)}
              >
                <Text style={[
                  styles.amountDisplay,
                  !watchedAmount && styles.amountPlaceholder
                ]}>
                  {watchedAmount ? getAmountDisplay() : ''}
                </Text>
              </TouchableOpacity>
            </View>

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
          <Card style={styles.card} padding='small'>
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
            // style={[
            //   styles.submitButton,
            //   { opacity: isFormValid() ? 1 : 0.6 }
            // ]}
            style={StyleSheet.flatten([
              styles.submitButton,
              !isFormValid() && styles.submitButtonDisabled
            ])}
          />
        </View>
      </KeyboardAvoidingView>

      {/* Amount Keypad Modal */}
      {showAmountKeypad && (
        <AmountKeypad
          value={watchedAmount}
          onChange={handleAmountChange}
          onDone={() => setShowAmountKeypad(false)}
          currencyCode={getSelectedAccount()?.currencyCode || 'USD'}
        />
      )}

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
        transactionType={transactionType}
      />
    </SafeAreaView>
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
  amountDisplay: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'left',
  },
  amountPlaceholder: {
    color: '#9ca3af',
    fontSize: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  floatingInputContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  floatingInputLabel: {
    position: 'absolute',
    left: 16,
    top: 16,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 4,
    zIndex: 1,
  },
  floatingAmountInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    minHeight: 56,
    justifyContent: 'center',
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
    padding: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
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
});



// {/* Quick Actions for common scenarios */ }
// <Card style={styles.card} padding='small'>
//   <Text style={styles.sectionTitle}>Quick Actions</Text>
//   <View style={styles.quickActions}>
//     <Button
//       title="Copy Last Transaction"
//       variant="outline"
//       size="small"
//       textStyle={styles.quickActionText}
//       onPress={() => {/* Copy last similar transaction */ }}
//     />
//     <Button
//       title="Save as Template"
//       variant="outline"
//       size="small"
//       textStyle={styles.quickActionText}
//       onPress={() => {/* Save current as template */ }}
//     />
//   </View>
// </Card>