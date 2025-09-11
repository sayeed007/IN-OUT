import React from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTheme } from '../../../app/providers/ThemeProvider';
import Card from '../../../components/ui/Card';
import { Category, TransactionType } from '../../../types/global';

interface CategoryData {
  categoryId: string;
  amount: number;
  type: TransactionType;
}

interface CategoryBreakdownProps {
  categoryData: {
    income: CategoryData[];
    expense: CategoryData[];
  };
  categories: Category[];
}

const CategoryBreakdown: React.FC<CategoryBreakdownProps> = ({
  categoryData,
  categories,
}) => {
  const { theme } = useTheme();

  // Helper function to get category name
  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Unknown Category';
  };

  const containerStyles = {
    color: theme.colors.expense.main,
    marginTop: categoryData.income.length > 0 ? 12 : 0,
  };

  return (
    <Card style={styles.halfCard}>
      <View style={styles.chartHeader}>
        <Text style={[styles.chartTitle, { color: theme.colors.text }]}>
          Top Categories
        </Text>
        <Text style={[styles.chartSubtitle, { color: theme.colors.textSecondary }]}>
          This month
        </Text>
      </View>

      <View style={styles.categoryList}>
        {/* Income Categories */}
        {categoryData.income.length > 0 && (
          <>
            <Text style={[styles.categorySection, { color: theme.colors.income.main }]}>
              Income
            </Text>
            {categoryData.income.slice(0, 2).map((category) => {
              const totalIncome = categoryData.income.reduce((sum, c) => sum + c.amount, 0);
              const percentage = totalIncome > 0 ? (category.amount / totalIncome) * 100 : 0;

              return (
                <View key={`income-${category.categoryId}`} style={styles.categoryItem}>
                  <View style={styles.categoryInfo}>
                    <View style={[styles.categoryDot, { backgroundColor: theme.colors.income.main }]} />
                    <Text style={[styles.categoryName, { color: theme.colors.text }]}>
                      {getCategoryName(category.categoryId)}
                    </Text>
                  </View>
                  <View style={styles.categoryAmount}>
                    <Text style={[styles.categoryValue, { color: theme.colors.income.main }]}>
                      ${category.amount.toFixed(0)}
                    </Text>
                    <Text style={[styles.categoryPercentage, { color: theme.colors.textSecondary }]}>
                      {percentage.toFixed(0)}%
                    </Text>
                  </View>
                </View>
              );
            })}
          </>
        )}

        {/* Expense Categories */}
        {categoryData.expense.length > 0 && (
          <>
            <Text style={[styles.categorySection, containerStyles]}>
              Expenses
            </Text>
            {categoryData.expense.slice(0, 2).map((category) => {
              const totalExpense = categoryData.expense.reduce((sum, c) => sum + c.amount, 0);
              const percentage = totalExpense > 0 ? (category.amount / totalExpense) * 100 : 0;

              return (
                <View key={`expense-${category.categoryId}`} style={styles.categoryItem}>
                  <View style={styles.categoryInfo}>
                    <View style={[styles.categoryDot, { backgroundColor: theme.colors.expense.main }]} />
                    <Text style={[styles.categoryName, { color: theme.colors.text }]}>
                      {getCategoryName(category.categoryId)}
                    </Text>
                  </View>
                  <View style={styles.categoryAmount}>
                    <Text style={[styles.categoryValue, { color: theme.colors.expense.main }]}>
                      ${category.amount.toFixed(0)}
                    </Text>
                    <Text style={[styles.categoryPercentage, { color: theme.colors.textSecondary }]}>
                      {percentage.toFixed(0)}%
                    </Text>
                  </View>
                </View>
              );
            })}
          </>
        )}

        {/* Empty state */}
        {categoryData.income.length === 0 && categoryData.expense.length === 0 && (
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
            No categories with transactions
          </Text>
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  halfCard: {
    flex: 1,
  },
  chartHeader: {
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  chartSubtitle: {
    fontSize: 12,
  },
  categoryList: {
    gap: 8,
  },
  categorySection: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  categoryAmount: {
    alignItems: 'flex-end',
  },
  categoryValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  categoryPercentage: {
    fontSize: 10,
  },
  emptyText: {
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: 8,
  },
});

export default CategoryBreakdown;