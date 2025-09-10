// src/screens/categories/CategoryManagerScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeContainer } from '../../components/layout/SafeContainer';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { FloatingActionButton } from '../../components/ui/FloatingActionButton';
import { Header } from '../../components/layout/Header';
import { Chip } from '../../components/ui/Chip';
import {
  useGetCategoriesQuery,
  useDeleteCategoryMutation,
  useGetTransactionsQuery,
} from '../../state/api';
import type { Category, TransactionType } from '../../types/global';

interface Props {
  navigation: any;
}

const CategoryManagerScreen: React.FC<Props> = ({ navigation }) => {
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

  const handleDeleteCategory = (category: Category) => {
    // Check if category has transactions
    const categoryTransactions = allTransactions.filter(
      tx => tx.categoryId === category.id
    );

    if (categoryTransactions.length > 0) {
      Alert.alert(
        'Cannot Delete Category',
        `This category is used in ${categoryTransactions.length} transaction(s). Please reassign or delete these transactions first.`,
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete "${category.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => confirmDelete(category),
        },
      ]
    );
  };

  const confirmDelete = async (category: Category) => {
    try {
      await deleteCategory(category.id).unwrap();
    } catch (error) {
      Alert.alert('Error', 'Failed to delete category');
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
                { backgroundColor: item.color + '20' }
              ]}
            >
              <Text style={[styles.categoryIcon, { color: item.color }]}>
                {item.icon}
              </Text>
            </View>
            <View style={styles.categoryInfo}>
              <Text style={styles.categoryName}>{item.name}</Text>
              <View style={styles.categoryTypeContainer}>
                <Chip
                  label={item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                  style={[
                    styles.categoryTypeBadge,
                    { 
                      backgroundColor: item.type === 'income' ? '#10B981' : '#EF4444' + '20',
                    }
                  ]}
                  textStyle={{
                    color: item.type === 'income' ? '#10B981' : '#EF4444',
                    fontSize: 12,
                    fontWeight: '500'
                  }}
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
      <SafeContainer style={styles.container}>
        <Header 
          title="Categories"
          showBackButton
          onBackPress={() => navigation.goBack()}
        />
        <View style={styles.loadingContainer}>
          <LoadingSpinner size="large" />
          <Text style={styles.loadingText}>Loading categories...</Text>
        </View>
      </SafeContainer>
    );
  }

  return (
    <SafeContainer style={styles.container}>
      <Header 
        title="Categories"
        showBackButton
        onBackPress={() => navigation.goBack()}
      />

      {/* Type Filter */}
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Filter by type:</Text>
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
            title={selectedType === 'all' ? 'No categories yet' : `No ${selectedType} categories`}
            message="Create your first category to organize your transactions"
            actionLabel="Add Category"
            onAction={handleAddCategory}
          />
        </View>
      ) : (
        <>
          {/* Summary Card */}
          <Card style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Category Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Categories:</Text>
              <Text style={styles.summaryValue}>{filteredCategories.length}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Income Categories:</Text>
              <Text style={styles.summaryValue}>
                {categories.filter(cat => cat.type === 'income').length}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Expense Categories:</Text>
              <Text style={styles.summaryValue}>
                {categories.filter(cat => cat.type === 'expense').length}
              </Text>
            </View>
          </Card>

          {/* Categories List */}
          <FlatList
            data={filteredCategories}
            renderItem={renderCategory}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
              />
            }
            showsVerticalScrollIndicator={false}
          />
        </>
      )}

      {/* Floating Action Button */}
      <FloatingActionButton
        onPress={handleAddCategory}
        icon="+"
      />
    </SafeContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
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
  filterContainer: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
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
  },
  summaryCard: {
    margin: 16,
    marginBottom: 8,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
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
    color: '#64748b',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  listContainer: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 100,
  },
  categoryCard: {
    marginBottom: 12,
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
