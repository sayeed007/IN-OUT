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
import { SafeContainer } from '../../../components/layout/SafeContainer';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../app/providers/ThemeProvider';
import { useAddBudgetMutation, useGetCategoriesQuery } from '../../../state/api';
import type { Budget, Category } from '../../../types/global';
import Card from '../../../components/ui/Card';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import dayjs from 'dayjs';
import { showToast } from '../../../utils/helpers/toast';

interface BudgetFormProps {
  visible: boolean;
  onClose: () => void;
  onBudgetCreated: (budget: Budget) => void;
  selectedMonth?: string;
  preselectedCategoryId?: string;
}

const BudgetForm: React.FC<BudgetFormProps> = ({
  visible,
  onClose,
  onBudgetCreated,
  selectedMonth,
  preselectedCategoryId,
}) => {
  const { theme } = useTheme();
  
  const [categoryId, setCategoryId] = useState(preselectedCategoryId || '');
  const [amount, setAmount] = useState('');
  const [rollover, setRollover] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  
  const month = selectedMonth || dayjs().format('YYYY-MM');
  
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
        month,
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

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    title: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
    },
    headerButton: {
      padding: 4,
      minWidth: 60,
    },
    cancelText: {
      fontSize: 16,
      color: theme.colors.textSecondary,
    },
    saveText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.primary[500],
      textAlign: 'right',
    },
    saveTextDisabled: {
      color: theme.colors.textTertiary,
    },
    scrollContent: {
      flexGrow: 1,
      padding: 20,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 12,
    },
    inputCard: {
      padding: 16,
    },
    monthInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      backgroundColor: theme.colors.primary[50] || `${theme.colors.primary[500]}10`,
      borderRadius: 12,
      marginBottom: 8,
    },
    monthIcon: {
      marginRight: 12,
    },
    monthText: {
      fontSize: 16,
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
      paddingVertical: 14,
    },
    categoryIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    categoryText: {
      flex: 1,
      fontSize: 16,
      color: theme.colors.text,
    },
    categoryPlaceholder: {
      color: theme.colors.textSecondary,
    },
    categoryList: {
      maxHeight: 300,
    },
    categoryItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    amountInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 12,
      backgroundColor: theme.colors.surface,
      paddingHorizontal: 16,
    },
    currencySymbol: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.primary[500],
      marginRight: 8,
    },
    amountInput: {
      flex: 1,
      paddingVertical: 14,
      fontSize: 18,
      fontWeight: '600',
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
    },
    rolloverText: {
      flex: 1,
      marginRight: 16,
    },
    rolloverTitle: {
      fontSize: 16,
      fontWeight: '500',
      color: theme.colors.text,
      marginBottom: 4,
    },
    rolloverDescription: {
      fontSize: 13,
      color: theme.colors.textSecondary,
    },
    flex: {
      flex: 1,
    },
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeContainer style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.headerButton}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Create Budget</Text>
          <TouchableOpacity
            onPress={handleCreateBudget}
            style={styles.headerButton}
            disabled={isCreating || !categoryId || !amount.trim()}
          >
            {isCreating ? (
              <LoadingSpinner size="small" color={theme.colors.primary[500]} />
            ) : (
              <Text style={[
                styles.saveText,
                (isCreating || !categoryId || !amount.trim()) && styles.saveTextDisabled
              ]}>
                Create
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Month Info */}
            <View style={styles.section}>
              <View style={styles.monthInfo}>
                <Icon
                  name="calendar-outline"
                  size={20}
                  color={theme.colors.primary[600] || theme.colors.primary[500]}
                  style={styles.monthIcon}
                />
                <Text style={styles.monthText}>
                  {dayjs(month).format('MMMM YYYY')}
                </Text>
              </View>
            </View>

            {/* Category Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Category</Text>
              <Card>
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
                            size={20}
                            color="#FFFFFF"
                          />
                        </View>
                        <Text style={styles.categoryText}>{selectedCategory.name}</Text>
                      </>
                    ) : (
                      <Text style={[styles.categoryText, styles.categoryPlaceholder]}>
                        Select a category
                      </Text>
                    )}
                    <Icon
                      name={showCategoryPicker ? 'chevron-up' : 'chevron-down'}
                      size={20}
                      color={theme.colors.textSecondary}
                    />
                  </TouchableOpacity>

                  {showCategoryPicker && (
                    <ScrollView style={styles.categoryList} nestedScrollEnabled>
                      {loadingCategories ? (
                        <View style={[styles.categoryItem, { justifyContent: 'center' }]}>
                          <LoadingSpinner size="small" />
                        </View>
                      ) : expenseCategories.length > 0 ? (
                        expenseCategories.map((category) => (
                          <TouchableOpacity
                            key={category.id}
                            style={styles.categoryItem}
                            onPress={() => handleCategorySelect(category)}
                          >
                            <View style={[
                              styles.categoryIconContainer,
                              { backgroundColor: category.color }
                            ]}>
                              <Icon
                                name={getCategoryIcon(category.icon)}
                                size={20}
                                color="#FFFFFF"
                              />
                            </View>
                            <Text style={styles.categoryText}>{category.name}</Text>
                            {categoryId === category.id && (
                              <Icon
                                name="checkmark"
                                size={20}
                                color={theme.colors.primary[500]}
                              />
                            )}
                          </TouchableOpacity>
                        ))
                      ) : (
                        <View style={[styles.categoryItem, { justifyContent: 'center' }]}>
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
              <Text style={styles.sectionTitle}>Options</Text>
              <Card>
                <View style={styles.rolloverContainer}>
                  <View style={styles.rolloverText}>
                    <Text style={styles.rolloverTitle}>Enable Rollover</Text>
                    <Text style={styles.rolloverDescription}>
                      Unused budget amount carries over to next month
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
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeContainer>
    </Modal>
  );
};

export default BudgetForm;
