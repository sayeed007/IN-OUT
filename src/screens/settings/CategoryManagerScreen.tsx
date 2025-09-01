// src/screens/settings/CategoryManagerScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { SafeContainer } from '../../components/layout/SafeContainer';
import Card from '../../components/ui/Card';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import Chip from '../../components/ui/Chip';
import { Spacing } from '../../theme';
import { useGetCategoriesQuery, useUpdateCategoryMutation } from '../../state/api';
import type { Category } from '../../types/global';

const CategoryItem: React.FC<{
  category: Category;
  onEdit: () => void;
  onToggleArchive: () => void;
}> = ({ category, onEdit, onToggleArchive }) => {
  return (
    <Card style={styles.categoryCard}>
      <View style={styles.categoryHeader}>
        <View style={styles.categoryInfo}>
          <View style={[styles.categoryColorDot, { backgroundColor: category.color }]} />
          <View style={styles.categoryDetails}>
            <Text style={styles.categoryName}>{category.name}</Text>
            <View style={styles.categoryMeta}>
              <Chip 
                label={category.type === 'income' ? 'Income' : 'Expense'}
                selected={true}
                style={[
                  styles.typeChip,
                  category.type === 'income' ? styles.incomeChip : styles.expenseChip
                ]}
                textStyle={styles.typeChipText}
              />
              {category.icon && (
                <Text style={styles.categoryIcon}>{category.icon}</Text>
              )}
            </View>
          </View>
        </View>
        <View style={styles.categoryActions}>
          <TouchableOpacity style={styles.actionButton} onPress={onEdit}>
            <Icon name="pencil" size={16} color="#6B7280" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, category.isArchived && styles.archiveActiveButton]} 
            onPress={onToggleArchive}
          >
            <Icon 
              name={category.isArchived ? "archive" : "archive-outline"} 
              size={16} 
              color={category.isArchived ? "#EF4444" : "#6B7280"} 
            />
          </TouchableOpacity>
        </View>
      </View>
      {category.isArchived && (
        <View style={styles.archivedBadge}>
          <Text style={styles.archivedText}>Archived</Text>
        </View>
      )}
    </Card>
  );
};

export const CategoryManagerScreen: React.FC = () => {
  const navigation = useNavigation();
  const [showArchived, setShowArchived] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  
  const { data: categories = [], isLoading, error, refetch } = useGetCategoriesQuery();
  const [updateCategory] = useUpdateCategoryMutation();

  const handleAddCategory = () => {
    navigation.navigate('CategoryForm' as any, { categoryId: undefined });
  };

  const handleEditCategory = (categoryId: string) => {
    navigation.navigate('CategoryForm' as any, { categoryId });
  };

  const handleToggleArchive = async (category: Category) => {
    const action = category.isArchived ? 'unarchive' : 'archive';
    
    Alert.alert(
      `${action.charAt(0).toUpperCase() + action.slice(1)} Category`,
      `Are you sure you want to ${action} "${category.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: action.charAt(0).toUpperCase() + action.slice(1),
          onPress: async () => {
            try {
              await updateCategory({
                id: category.id,
                isArchived: !category.isArchived,
                updatedAt: new Date().toISOString(),
              }).unwrap();
            } catch (error) {
              Alert.alert('Error', `Failed to ${action} category. Please try again.`);
            }
          }
        }
      ]
    );
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
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Manage Categories</Text>
          <Text style={styles.subtitle}>
            {activeCategories.length} active categor{activeCategories.length !== 1 ? 'ies' : 'y'}
            {archivedCategories.length > 0 && `, ${archivedCategories.length} archived`}
          </Text>
        </View>

        {/* Add Category Button */}
        <TouchableOpacity style={styles.addButton} onPress={handleAddCategory}>
          <Icon name="add-circle" size={24} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Add New Category</Text>
        </TouchableOpacity>

        {/* Filter Controls */}
        <Card style={styles.filtersCard}>
          <Text style={styles.filtersTitle}>Filters</Text>
          
          {/* Type Filter */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Type</Text>
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
          </View>

          {/* Show Archived Toggle */}
          {archivedCategories.length > 0 && (
            <TouchableOpacity 
              style={styles.toggleContainer}
              onPress={() => setShowArchived(!showArchived)}
            >
              <Text style={styles.toggleText}>
                {showArchived ? 'Hide' : 'Show'} Archived Categories
              </Text>
              <Icon 
                name={showArchived ? 'chevron-up' : 'chevron-down'} 
                size={20} 
                color="#6366F1" 
              />
            </TouchableOpacity>
          )}
        </Card>

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
            subtitle={
              filterType !== 'all' 
                ? `No ${filterType} categories found with current filters`
                : showArchived 
                  ? "No archived categories to display" 
                  : "Get started by adding your first category"
            }
            actionText={filterType === 'all' && !showArchived ? "Add Category" : undefined}
            onAction={filterType === 'all' && !showArchived ? handleAddCategory : undefined}
          />
        )}
      </ScrollView>
    </SafeContainer>
  );
};

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
    color: '#6B7280',
  },
  header: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.base,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366F1',
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.base,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  filtersCard: {
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.base,
    padding: Spacing.base,
  },
  filtersTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  filterGroup: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6366F1',
  },
  categoryList: {
    paddingHorizontal: Spacing.base,
  },
  categorySection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  categoryCard: {
    padding: 16,
    marginBottom: 12,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  categoryInfo: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'flex-start',
  },
  categoryColorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
    marginTop: 2,
  },
  categoryDetails: {
    flex: 1,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  categoryMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typeChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  incomeChip: {
    backgroundColor: '#D1FAE5',
  },
  expenseChip: {
    backgroundColor: '#FEE2E2',
  },
  typeChipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  categoryIcon: {
    fontSize: 16,
  },
  categoryActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
  },
  archiveActiveButton: {
    backgroundColor: '#FEE2E2',
  },
  archivedBadge: {
    marginTop: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#FEF3C7',
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  archivedText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#92400E',
  },
});