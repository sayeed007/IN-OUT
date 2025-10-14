// src/screens/settings/CategoryManagerScreen.tsx
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../app/providers/ThemeProvider';
import { SafeContainer } from '../../components/layout/SafeContainer';
import BottomSpacing from '../../components/ui/BottomSpacing';
import Chip from '../../components/ui/Chip';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useGetCategoriesQuery, useUpdateCategoryMutation } from '../../state/api';
import { Spacing } from '../../theme';
import type { Category, TransactionType } from '../../types/global';
import { CategoryItem } from './components/CategoryItem';
import { showToast } from '../../utils/helpers/toast';

export const CategoryManagerScreen: React.FC = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const [showArchived, setShowArchived] = useState(false);
  const [filterType, setFilterType] = useState<'all' | TransactionType>('all');

  const { data: categories = [], isLoading } = useGetCategoriesQuery();
  const [updateCategory] = useUpdateCategoryMutation();

  const handleAddCategory = () => {
    navigation.navigate('CategoryForm' as any, { categoryId: undefined });
  };

  const handleEditCategory = (categoryId: string) => {
    navigation.navigate('CategoryForm' as any, { categoryId });
  };

  const handleToggleArchive = async (category: Category) => {
    const action = category.isArchived ? 'unarchive' : 'archive';

    try {
      await updateCategory({
        id: category.id,
        isArchived: !category.isArchived,
        updatedAt: new Date().toISOString(),
      }).unwrap();
      showToast.success(`Category "${category.name}" ${action}d successfully`);
    } catch (error) {
      showToast.error(`Failed to ${action} category. Please try again.`);
    }
  };

  // Filter categories
  const filteredCategories = categories.filter(category => {
    if (!showArchived && category.isArchived) return false;
    if (filterType === 'all') return true;
    return category.type === filterType;
  });

  const activeCategories = categories.filter(cat => !cat.isArchived);
  const archivedCategories = categories.filter(cat => cat.isArchived);
  const incomeCategories = filteredCategories.filter(cat => cat.type === 'income');
  const expenseCategories = filteredCategories.filter(cat => cat.type === 'expense');

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      color: theme.colors.textSecondary,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: Spacing.base,
      paddingBottom: Spacing.sm,
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.textSecondary,
    },
    addButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 8,
      backgroundColor: theme.colors.primary[500],
      gap: 4,
    },
    addButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.neutral[0],
    },
    filtersCard: {
      marginHorizontal: Spacing.base,
      marginBottom: Spacing.base,
      padding: Spacing.base,
    },
    filtersTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 16,
    },
    filterGroup: {
      marginBottom: 16,
    },
    filterLabel: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.textSecondary,
      marginBottom: 8,
    },
    chipContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 8,
      paddingHorizontal: 12,
      paddingVertical: 4,
    },
    filterChip: {
      paddingHorizontal: 16,
    },
    toggleButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginHorizontal: Spacing.base,
      marginBottom: Spacing.base,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      backgroundColor: theme.colors.neutral[100],
    },
    toggleButtonText: {
      fontSize: 16,
      fontWeight: '500',
      color: theme.colors.primary[500],
    },
    categoryList: {
      paddingHorizontal: Spacing.base,
      gap: 12,
    },
    categorySection: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 12,
    },
  });

  if (isLoading) {
    return (
      <SafeContainer>
        <View style={styles.loadingContainer}>
          <LoadingSpinner size="large" />
          <Text style={styles.loadingText}>Loading categories...</Text>
        </View>
      </SafeContainer>
    );
  }

  return (
    <SafeContainer>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header with Add Button */}
        <View style={styles.header}>
          <Text style={styles.subtitle}>
            {activeCategories.length} active categor{activeCategories.length !== 1 ? 'ies' : 'y'}
            {archivedCategories.length > 0 && `, ${archivedCategories.length} archived`}
          </Text>
          <TouchableOpacity style={styles.addButton} onPress={handleAddCategory}>
            <Icon name="add" size={18} color={theme.colors.neutral[0]} />
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>

        {/* Show Archived Toggle */}
        {archivedCategories.length > 0 && (
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => setShowArchived(!showArchived)}
          >
            <Text style={styles.toggleButtonText}>
              {showArchived ? 'Hide' : 'Show'} Archived Categories
            </Text>
            <Icon
              name={showArchived ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={theme.colors.primary[500]}
            />
          </TouchableOpacity>
        )}

        {/* Filter Controls */}
        <View style={styles.chipContainer}>
          <Chip
            label="All"
            selected={filterType === 'all'}
            onPress={() => setFilterType('all')}
            style={styles.filterChip}
          />
          <Chip
            label="Income"
            selected={filterType === 'income'}
            onPress={() => setFilterType('income')}
            style={styles.filterChip}
          />
          <Chip
            label="Expense"
            selected={filterType === 'expense'}
            onPress={() => setFilterType('expense')}
            style={styles.filterChip}
          />
        </View>

        {/* Category List */}
        {filteredCategories.length > 0 ? (
          <View style={styles.categoryList}>
            {filterType === 'all' ? (
              <>
                {incomeCategories.length > 0 && (
                  <View style={styles.categorySection}>
                    <Text style={styles.sectionTitle}>
                      Income Categories ({incomeCategories.length})
                    </Text>
                    {incomeCategories.map((category) => (
                      <CategoryItem
                        key={category.id}
                        category={category}
                        onEdit={() => handleEditCategory(category.id)}
                        onToggleArchive={() => handleToggleArchive(category)}
                      />
                    ))}
                  </View>
                )}

                {expenseCategories.length > 0 && (
                  <View style={styles.categorySection}>
                    <Text style={styles.sectionTitle}>
                      Expense Categories ({expenseCategories.length})
                    </Text>
                    {expenseCategories.map((category) => (
                      <CategoryItem
                        key={category.id}
                        category={category}
                        onEdit={() => handleEditCategory(category.id)}
                        onToggleArchive={() => handleToggleArchive(category)}
                      />
                    ))}
                  </View>
                )}
              </>
            ) : (
              filteredCategories.map((category) => (
                <CategoryItem
                  key={category.id}
                  category={category}
                  onEdit={() => handleEditCategory(category.id)}
                  onToggleArchive={() => handleToggleArchive(category)}
                />
              ))
            )}
          </View>
        ) : (
          <EmptyState
            icon="pricetag-outline"
            title="No categories found"
            description={
              filterType !== 'all'
                ? `No ${filterType} categories found with current filters`
                : showArchived
                  ? "No archived categories to display"
                  : "Get started by adding your first category"
            }
            actionLabel={filterType === 'all' && !showArchived ? "Add Category" : undefined}
            onActionPress={filterType === 'all' && !showArchived ? handleAddCategory : undefined}
          />
        )}

        {/* Bottom spacing for tab bar */}
        <BottomSpacing />
      </ScrollView>
    </SafeContainer>
  );
};