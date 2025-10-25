// src/screens/budgets/components/BudgetCreationModal.tsx
import React, { useState, useEffect } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Switch,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../app/providers/ThemeProvider';
import { GradientHeader } from '../../../components/ui/GradientHeader';
import { useAddBudgetMutation, useGetCategoriesQuery } from '../../../state/api';
import type { Budget, Category } from '../../../types/global';
import Card from '../../../components/ui/Card';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import dayjs from 'dayjs';
import { showToast } from '../../../utils/helpers/toast';
import { getCurrentPeriodId, formatPeriodLabel } from '../../../utils/helpers/dateUtils';

interface BudgetCreationModalProps {
  visible: boolean;
  onClose: () => void;
  onBudgetCreated: (budget: Budget) => void;
  selectedPeriod?: string; // YYYY-MM-DD format
  periodStartDay: number; // 1-28
  preselectedCategoryId?: string;
}

const BudgetCreationModal: React.FC<BudgetCreationModalProps> = ({
  visible,
  onClose,
  onBudgetCreated,
  selectedPeriod,
  periodStartDay,
  preselectedCategoryId,
}) => {
  const { theme } = useTheme();

  const [categoryId, setCategoryId] = useState(preselectedCategoryId || '');
  const [amount, setAmount] = useState('');
  const [rollover, setRollover] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const periodId = selectedPeriod || getCurrentPeriodId(periodStartDay);

  const { data: categories = [], isLoading: loadingCategories } = useGetCategoriesQuery();
  const [addBudget] = useAddBudgetMutation();

  // Filter to only expense categories
  const expenseCategories = categories.filter(cat => cat.type === 'expense' && !cat.isArchived);

  const selectedCategory = expenseCategories.find(cat => cat.id === categoryId);

  useEffect(() => {
    if (preselectedCategoryId) {
      setCategoryId(preselectedCategoryId);
    }
  }, [preselectedCategoryId]);

  const resetForm = () => {
    setCategoryId(preselectedCategoryId || '');
    setAmount('');
    setRollover(false);
    setIsCreating(false);
    setShowCategoryPicker(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleCreateBudget = async () => {
    if (!categoryId) {
      showToast.error('Please select a category');
      return;
    }

    if (!amount.trim() || parseFloat(amount) <= 0) {
      showToast.error('Please enter a valid budget amount');
      return;
    }

    setIsCreating(true);
    try {
      const budgetAmount = parseFloat(amount);
      const newBudget = await addBudget({
        categoryId,
        periodId,
        periodStartDay,
        amount: budgetAmount,
        rollover,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }).unwrap();

      onBudgetCreated(newBudget);
      resetForm();
      onClose();
      showToast.success('Budget created successfully!');
    } catch (error) {
      console.error('Failed to create budget:', error);
      showToast.error('Failed to create budget. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleCategorySelect = (category: Category) => {
    setCategoryId(category.id);
    setShowCategoryPicker(false);
  };

  const getCategoryIcon = (iconName: string) => {
    return iconName || 'pricetag-outline';
  };

  const isFormValid = categoryId && amount.trim() && parseFloat(amount) > 0;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f8fafc',
    },
    content: {
      flex: 1,
      paddingHorizontal: 12,
    },
    scrollContent: {
      flexGrow: 1,
      paddingBottom: 40,
    },
    createButtonText: {
      fontSize: 16,
      fontWeight: '600',
    },
    createButtonTextDisabled: {
      opacity: 0.4,
    },
    section: {
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 12,
    },
    inputCard: {
      padding: 0,
    },
    monthInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      backgroundColor: theme.colors.primary[50] || `${theme.colors.primary[500]}10`,
      borderRadius: 12,
    },
    monthIcon: {
      marginRight: 12,
    },
    monthText: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.colors.primary[600] || theme.colors.primary[500],
    },
    categorySelector: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 12,
      backgroundColor: theme.colors.surface,
      overflow: 'hidden',
    },
    categoryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 16,
    },
    categoryIconContainer: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 14,
    },
    categoryText: {
      flex: 1,
      fontSize: 16,
      fontWeight: '500',
      color: theme.colors.text,
    },
    categoryPlaceholder: {
      color: theme.colors.textSecondary,
      fontWeight: '400',
    },
    categoryList: {
      maxHeight: 280,
    },
    categoryItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    categoryItemSelected: {
      backgroundColor: theme.colors.primary[50] || `${theme.colors.primary[500]}08`,
    },
    categoryItemCentered: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    amountInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 12,
      backgroundColor: theme.colors.surface,
      paddingHorizontal: 16,
      paddingVertical: 4,
    },
    currencySymbol: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.primary[500],
      marginRight: 8,
    },
    amountInput: {
      flex: 1,
      paddingVertical: 14,
      fontSize: 20,
      fontWeight: '700',
      color: theme.colors.text,
      backgroundColor: 'transparent',
    },
    rolloverContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    rolloverText: {
      flex: 1,
      marginRight: 16,
    },
    rolloverTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 4,
    },
    rolloverDescription: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      lineHeight: 18,
    },
    infoCard: {
      padding: 14,
      backgroundColor: theme.colors.info[50] || `${theme.colors.info[500]}10`,
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    infoIcon: {
      marginRight: 10,
      marginTop: 2,
    },
    infoText: {
      flex: 1,
      fontSize: 13,
      lineHeight: 18,
      color: theme.colors.info[700] || theme.colors.info[500],
    },
    flex: {
      flex: 1,
    },
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <GradientHeader
          title="Create Budget"
          subtitle={formatPeriodLabel(periodId, periodStartDay)}
          showBackButton={true}
          onBackPress={handleClose}
          rightElement={
            isCreating ? (
              <LoadingSpinner size="small" color={theme.colors.onPrimary} />
            ) : (
              <TouchableOpacity
                onPress={handleCreateBudget}
                disabled={!isFormValid}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text
                  style={[
                    styles.createButtonText,
                    { color: theme.colors.onPrimary },
                    !isFormValid && styles.createButtonTextDisabled
                  ]}
                >
                  Create
                </Text>
              </TouchableOpacity>
            )
          }
        />

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Month Info */}
            <View style={styles.section}>
              <View style={styles.monthInfo}>
                <Icon
                  name="calendar"
                  size={20}
                  color={theme.colors.primary[600] || theme.colors.primary[500]}
                  style={styles.monthIcon}
                />
                <Text style={styles.monthText}>
                  Budget for {formatPeriodLabel(periodId, periodStartDay)}
                </Text>
              </View>
            </View>

            {/* Category Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Category</Text>
              <Card style={styles.inputCard}>
                <View style={styles.categorySelector}>
                  <TouchableOpacity
                    style={styles.categoryButton}
                    onPress={() => setShowCategoryPicker(!showCategoryPicker)}
                  >
                    {selectedCategory ? (
                      <>
                        <View style={[
                          styles.categoryIconContainer,
                          { backgroundColor: selectedCategory.color }
                        ]}>
                          <Icon
                            name={getCategoryIcon(selectedCategory.icon)}
                            size={22}
                            color="#FFFFFF"
                          />
                        </View>
                        <Text style={styles.categoryText}>{selectedCategory.name}</Text>
                      </>
                    ) : (
                      <>
                        <View style={[
                          styles.categoryIconContainer,
                          { backgroundColor: theme.colors.textSecondary + '20' }
                        ]}>
                          <Icon
                            name="pricetag-outline"
                            size={22}
                            color={theme.colors.textSecondary}
                          />
                        </View>
                        <Text style={[styles.categoryText, styles.categoryPlaceholder]}>
                          Select a category
                        </Text>
                      </>
                    )}
                    <Icon
                      name={showCategoryPicker ? 'chevron-up' : 'chevron-down'}
                      size={22}
                      color={theme.colors.textSecondary}
                    />
                  </TouchableOpacity>

                  {showCategoryPicker && (
                    <ScrollView style={styles.categoryList} nestedScrollEnabled>
                      {loadingCategories ? (
                        <View style={styles.categoryItemCentered}>
                          <LoadingSpinner size="small" />
                        </View>
                      ) : expenseCategories.length > 0 ? (
                        expenseCategories.map((category) => (
                          <TouchableOpacity
                            key={category.id}
                            style={[
                              styles.categoryItem,
                              categoryId === category.id && styles.categoryItemSelected
                            ]}
                            onPress={() => handleCategorySelect(category)}
                          >
                            <View style={[
                              styles.categoryIconContainer,
                              { backgroundColor: category.color }
                            ]}>
                              <Icon
                                name={getCategoryIcon(category.icon)}
                                size={22}
                                color="#FFFFFF"
                              />
                            </View>
                            <Text style={styles.categoryText}>{category.name}</Text>
                            {categoryId === category.id && (
                              <Icon
                                name="checkmark-circle"
                                size={22}
                                color={theme.colors.primary[500]}
                              />
                            )}
                          </TouchableOpacity>
                        ))
                      ) : (
                        <View style={styles.categoryItemCentered}>
                          <Text style={[styles.categoryText, styles.categoryPlaceholder]}>
                            No expense categories available
                          </Text>
                        </View>
                      )}
                    </ScrollView>
                  )}
                </View>
              </Card>
            </View>

            {/* Budget Amount */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Budget Amount</Text>
              <Card style={styles.inputCard}>
                <View style={styles.amountInputContainer}>
                  <Text style={styles.currencySymbol}>$</Text>
                  <TextInput
                    style={styles.amountInput}
                    value={amount}
                    onChangeText={setAmount}
                    placeholder="0.00"
                    placeholderTextColor={theme.colors.textSecondary}
                    keyboardType="numeric"
                    returnKeyType="done"
                  />
                </View>
              </Card>
            </View>

            {/* Rollover Option */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Settings</Text>
              <Card style={styles.inputCard}>
                <View style={styles.rolloverContainer}>
                  <View style={styles.rolloverText}>
                    <Text style={styles.rolloverTitle}>Rollover Unused Balance</Text>
                    <Text style={styles.rolloverDescription}>
                      Carry over unused budget to next month
                    </Text>
                  </View>
                  <Switch
                    value={rollover}
                    onValueChange={setRollover}
                    trackColor={{
                      false: theme.colors.border,
                      true: theme.colors.primary[200] || `${theme.colors.primary[500]}40`
                    }}
                    thumbColor={rollover ? theme.colors.primary[500] : theme.colors.textSecondary}
                    ios_backgroundColor={theme.colors.border}
                  />
                </View>
              </Card>
            </View>

            {/* Info Card */}
            <View style={styles.infoCard}>
              <Icon
                name="information-circle"
                size={20}
                color={theme.colors.info[600] || theme.colors.info[500]}
                style={styles.infoIcon}
              />
              <Text style={styles.infoText}>
                Set a spending limit for this category. You'll receive alerts when approaching or exceeding your budget.
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

export default BudgetCreationModal;
