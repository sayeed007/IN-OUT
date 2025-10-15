// src/screens/categories/CategoryManagerScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Button } from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import Chip from '../../components/ui/Chip';
import { GradientHeader } from '../../components/ui/GradientHeader';
import BottomSpacing from '../../components/ui/BottomSpacing';
import {
  useGetCategoriesQuery,
  useDeleteCategoryMutation,
  useGetTransactionsQuery,
} from '../../state/api';
import type { Category, TransactionType } from '../../types/global';
import { showToast } from '../../utils/helpers/toast';
import { useTheme } from '../../app/providers/ThemeProvider';

interface Props {
  navigation: any;
}

const CategoryManagerScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedType, setSelectedType] = useState<TransactionType | 'all'>('all');

  const { data: categories = [], isLoading, refetch } = useGetCategoriesQuery();
  const { data: allTransactions = [] } = useGetTransactionsQuery({});
  const [deleteCategory] = useDeleteCategoryMutation();

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

  const handleAddCategory = () => {
    navigation.navigate('CategoryForm');
  };

  const handleEditCategory = (category: Category) => {
    navigation.navigate('CategoryForm', { categoryId: category.id });
  };

  const handleDeleteCategory = async (category: Category) => {
    // Check if category has transactions
    const categoryTransactions = allTransactions.filter(
      tx => tx.categoryId === category.id
    );

    if (categoryTransactions.length > 0) {
      showToast.error(`This category is used in ${categoryTransactions.length} transaction(s). Please reassign or delete these transactions first.`, 'Cannot Delete Category');
      return;
    }

    try {
      await deleteCategory(category.id).unwrap();
      showToast.success(`Category "${category.name}" deleted successfully`);
    } catch (error) {
      showToast.error('Failed to delete category');
    }
  };

  // Filter categories by type
  const filteredCategories = selectedType === 'all'
    ? categories
    : categories.filter(cat => cat.type === selectedType);

  const getCategoryUsageCount = (categoryId: string) => {
    return allTransactions.filter(tx => tx.categoryId === categoryId).length;
  };

  const getCategoryUsageAmount = (categoryId: string) => {
    return allTransactions
      .filter(tx => tx.categoryId === categoryId)
      .reduce((total, tx) => total + tx.amount, 0);
  };

  const renderCategory = ({ item }: { item: Category }) => {
    const usageCount = getCategoryUsageCount(item.id);
    const usageAmount = getCategoryUsageAmount(item.id);

    return (
      <Card style={styles.categoryCard}>
        <TouchableOpacity
          style={styles.categoryContent}
          onPress={() => handleEditCategory(item)}
          activeOpacity={0.7}
        >
          <View style={styles.categoryHeader}>
            <View
              style={[
                styles.categoryIconContainer,
                getCategoryIconBgStyle(item.color)
              ]}
            >
              <Text style={[styles.categoryIcon, getCategoryIconColorStyle(item.color)]}>
                {item.icon}
              </Text>
            </View>
            <View style={styles.categoryInfo}>
              <Text style={styles.categoryName}>{item.name}</Text>
              <View style={styles.categoryTypeContainer}>
                <Chip
                  label={item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                  style={StyleSheet.flatten([
                    styles.categoryTypeBadge,
                    getCategoryTypeBadgeStyle(item.type)
                  ])}
                  textStyle={getCategoryTypeTextStyle(item.type)}
                />
              </View>
            </View>
          </View>

          <View style={styles.categoryStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{usageCount}</Text>
              <Text style={styles.statLabel}>Transactions</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                ${usageAmount.toLocaleString()}
              </Text>
              <Text style={styles.statLabel}>Total Amount</Text>
            </View>
          </View>

          <View style={styles.categoryActions}>
            <Button
              title="Edit"
              variant="secondary"
              size="small"
              onPress={() => handleEditCategory(item)}
              style={styles.actionButton}
            />
            <Button
              title="Delete"
              variant="danger"
              size="small"
              onPress={() => handleDeleteCategory(item)}
              style={styles.actionButton}
              disabled={usageCount > 0}
            />
          </View>
        </TouchableOpacity>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <GradientHeader
          title="Categories"
          subtitle={`${categories.length} total categor${categories.length !== 1 ? 'ies' : 'y'}`}
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

  const incomeCount = categories.filter(cat => cat.type === 'income').length;
  const expenseCount = categories.filter(cat => cat.type === 'expense').length;

  return (
    <View style={styles.container}>
      <GradientHeader
        title="Categories"
        subtitle={`${incomeCount} income, ${expenseCount} expense`}
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
        rightIcon="add-circle-outline"
        onRightPress={handleAddCategory}
      />

      <ScrollView
        style={[styles.content, { backgroundColor: theme.colors.background }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary[500]]}
            tintColor={theme.colors.primary[500]}
          />
        }
      >
        {/* Type Filter */}
        <View style={[styles.filterContainer, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
          <Text style={[styles.filterLabel, { color: theme.colors.text }]}>Filter by type:</Text>
          <View style={styles.filterChips}>
            {([
              { key: 'all', label: 'All' },
              { key: 'income', label: 'Income' },
              { key: 'expense', label: 'Expense' },
            ] as const).map((filter) => (
              <Chip
                key={filter.key}
                label={filter.label}
                selected={selectedType === filter.key}
                onPress={() => setSelectedType(filter.key)}
                style={styles.filterChip}
              />
            ))}
          </View>
        </View>

        {filteredCategories.length === 0 ? (
          <View style={styles.emptyContainer}>
            <EmptyState
              icon="pricetags-outline"
              title={selectedType === 'all' ? 'No categories yet' : `No ${selectedType} categories`}
              description="Create your first category to organize your transactions"
              actionLabel="Add Category"
              onActionPress={handleAddCategory}
            />
          </View>
        ) : (
          <>
            {/* Summary Card */}
            <Card style={styles.summaryCard}>
              <Text style={[styles.summaryTitle, { color: theme.colors.text }]}>Category Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Total Categories:</Text>
                <Text style={[styles.summaryValue, { color: theme.colors.text }]}>{filteredCategories.length}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Income Categories:</Text>
                <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
                  {incomeCount}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Expense Categories:</Text>
                <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
                  {expenseCount}
                </Text>
              </View>
            </Card>

            {/* Categories List */}
            {filteredCategories.map((item) => renderCategory({ item }))}
          </>
        )}

        <BottomSpacing />
      </ScrollView>
    </View>
  );
};

// Helper functions for dynamic styles
const getCategoryTypeBadgeStyle = (categoryType: string) => ({
  backgroundColor: categoryType === 'income' ? '#10B981' + '20' : '#EF4444' + '20',
});

const getCategoryTypeTextStyle = (categoryType: string) => ({
  color: categoryType === 'income' ? '#10B981' : '#EF4444',
  fontSize: 12,
  fontWeight: '500' as '500',
});

const getCategoryIconBgStyle = (color: string) => ({
  backgroundColor: color + '20',
});

const getCategoryIconColorStyle = (color: string) => ({
  color: color,
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    flex: 1,
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
  filterContainer: {
    padding: 16,
    borderBottomWidth: 1,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
  },
  filterChips: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 400,
  },
  summaryCard: {
    marginHorizontal: 12,
    marginVertical: 8,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  categoryCard: {
    marginHorizontal: 12,
    marginVertical: 6,
  },
  categoryContent: {
    padding: 0,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryIcon: {
    fontSize: 24,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  categoryTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryTypeBadge: {
    alignSelf: 'flex-start',
  },
  categoryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingVertical: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  categoryActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
});

export default CategoryManagerScreen;
