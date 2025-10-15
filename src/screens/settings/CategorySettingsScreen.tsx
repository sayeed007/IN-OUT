// src/screens/settings/CategorySettingsScreen.tsx
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
import BottomSpacing from '../../components/ui/BottomSpacing';
import Chip from '../../components/ui/Chip';
import EmptyState from '../../components/ui/EmptyState';
import { GradientHeader } from '../../components/ui/GradientHeader';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useGetCategoriesQuery, useUpdateCategoryMutation } from '../../state/api';
import type { Category, TransactionType } from '../../types/global';
import { showToast } from '../../utils/helpers/toast';
import { CategoryItem } from './components/CategoryItem';

export const CategorySettingsScreen: React.FC = () => {
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
      backgroundColor: '#f8fafc',
    },
    content: {
      flex: 1,
      paddingHorizontal: 12,
      paddingTop: 8,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: 16,
      fontSize: 14,
    },
    chipContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    filterChip: {
      paddingHorizontal: 16,
    },
    toggleButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginHorizontal: 4,
      marginVertical: 8,
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
      paddingHorizontal: 4,
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
      <View style={styles.container}>
        <GradientHeader
          title="Manage Categories"
          subtitle={`${activeCategories.length} active categor${activeCategories.length !== 1 ? 'ies' : 'y'}`}
          showBackButton={true}
          onBackPress={() => navigation.goBack()}
          rightIcon="add-circle-outline"
          onRightPress={handleAddCategory}
        />
        <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
          <LoadingSpinner size="large" />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Loading categories...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <GradientHeader
        title="Manage Categories"
        subtitle={`${activeCategories.length} active, ${archivedCategories.length} archived`}
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
        rightIcon="add-circle-outline"
        onRightPress={handleAddCategory}
      />
      <ScrollView
        style={[styles.content, { backgroundColor: theme.colors.background }]}
        showsVerticalScrollIndicator={false}
      >

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
    </View>
  );
};