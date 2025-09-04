import React from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Circle, G, Path } from 'react-native-svg';
import { useTheme } from '../../../app/providers/ThemeProvider';
import Card from '../../../components/ui/Card';
import { Account, Category } from '../../../types/global';

const { width: screenWidth } = Dimensions.get('window');
const chartWidth = screenWidth - 64; // Account for padding
const chartHeight = 120;

interface TrendData {
  month: string;
  fullMonth: string;
  income: number;
  expense: number;
}

interface CategoryData {
  categoryId: string;
  amount: number;
  type: 'income' | 'expense';
}

interface MiniChartsProps {
  trendData: TrendData[];
  categoryData: {
    income: CategoryData[];
    expense: CategoryData[];
  };
  accounts: Account[];
  categories: Category[];
}

const MiniCharts: React.FC<MiniChartsProps> = ({
  trendData,
  categoryData,
  accounts,
  categories,
}) => {
  const { theme } = useTheme();
  console.log(trendData, categoryData);

  // Helper function to get category name
  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Unknown Category';
  };

  // Create trend line path and points for income/expense
  const createTrendData = (data: number[]) => {
    if (data.length === 0) return { path: '', points: [] };

    const maxValue = Math.max(...data.filter(d => d > 0), ...trendData.map(d => Math.max(d.income, d.expense)), 1);
    const points = data.map((value, index) => {
      const x = (index / Math.max(data.length - 1, 1)) * chartWidth;
      const y = chartHeight - (value / maxValue) * (chartHeight - 20); // Leave margin for dots
      return { x, y, value };
    });

    const pathString = points.length > 0 ? `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}` : '';
    return { path: pathString, points };
  };

  const incomeData = trendData.map(d => d.income);
  const expenseData = trendData.map(d => d.expense);

  const incomeChart = createTrendData(incomeData);
  const expenseChart = createTrendData(expenseData);

  // Calculate total balance
  const totalBalance = accounts.reduce((sum, account) => sum + account.openingBalance, 0);

  const containerStyles = {
    color: theme.colors.expense.main,
    marginTop: categoryData.income.length > 0 ? 12 : 0,
  };

  return (
    <>
      {/* Income vs Expense Trend */}
      <Card style={styles.trendCard}>
        <View style={styles.chartHeader}>
          <Text style={[styles.chartTitle, { color: theme.colors.text }]}>
            Income vs Expenses
          </Text>
          <Text style={[styles.chartSubtitle, { color: theme.colors.textSecondary }]}>
            Daily breakdown
          </Text>
        </View>

        <View style={styles.chartContainer}>
          <Svg width={chartWidth} height={chartHeight} style={styles.chart}>
            {/* Income line */}
            {incomeChart.path && (
              <G>
                <Path
                  d={incomeChart.path}
                  stroke={theme.colors.income.main}
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Income data points */}
                {incomeChart.points.map((point, index) => (
                  <Circle
                    key={`income-${index}`}
                    cx={point.x}
                    cy={point.y}
                    r={point.value > 0 ? 4 : 2}
                    fill={theme.colors.income.main}
                    stroke="white"
                    strokeWidth="2"
                    opacity={point.value > 0 ? 1 : 0.3}
                  />
                ))}
              </G>
            )}

            {/* Expense line */}
            {expenseChart.path && (
              <G>
                <Path
                  d={expenseChart.path}
                  stroke={theme.colors.expense.main}
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Expense data points */}
                {expenseChart.points.map((point, index) => (
                  <Circle
                    key={`expense-${index}`}
                    cx={point.x}
                    cy={point.y}
                    r={point.value > 0 ? 4 : 2}
                    fill={theme.colors.expense.main}
                    stroke="white"
                    strokeWidth="2"
                    opacity={point.value > 0 ? 1 : 0.3}
                  />
                ))}
              </G>
            )}
          </Svg>

          {/* Legend */}
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: theme.colors.income.main }]} />
              <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>
                Income
              </Text>
              <Text style={[styles.summaryValue, { color: theme.colors.income.main }]}>
                (Avg: ${(trendData.reduce((sum, d) => sum + d.income, 0) / trendData.length).toFixed(0)})
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: theme.colors.expense.main }]} />
              <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>
                Expenses
              </Text>
              <Text style={[styles.summaryValue, { color: theme.colors.expense.main }]}>
                (Avg: ${(trendData.reduce((sum, d) => sum + d.expense, 0) / trendData.length).toFixed(0)})
              </Text>
            </View>
          </View>
        </View>
      </Card>

      {/* Account Overview & Category Breakdown Row */}
      <View style={styles.row}>

        {/* Account Overview */}
        <Card style={styles.halfCard}>
          <View style={styles.chartHeader}>
            <Text style={[styles.chartTitle, { color: theme.colors.text }]}>
              Accounts
            </Text>
            <Text style={[styles.totalBalance, { color: theme.colors.primary[500] }]}>
              ${totalBalance.toFixed(2)}
            </Text>
          </View>

          <View style={styles.accountsList}>
            {accounts.slice(0, 3).map((account) => (
              <View key={account.id} style={styles.accountItem}>
                <View style={styles.accountInfo}>
                  <Text style={[styles.accountName, { color: theme.colors.text }]}>
                    {account.name}
                  </Text>
                  <Text style={[styles.accountType, { color: theme.colors.textSecondary }]}>
                    {account.type}
                  </Text>
                </View>
                <Text style={[styles.accountBalance, {
                  color: account.openingBalance >= 0 ? theme.colors.income.main : theme.colors.expense.main
                }]}>
                  ${Math.abs(account.openingBalance).toFixed(2)}
                </Text>
              </View>
            ))}

            {accounts.length > 3 && (
              <TouchableOpacity style={styles.seeMoreButton}>
                <Text style={[styles.seeMoreText, { color: theme.colors.primary[500] }]}>
                  +{accounts.length - 3} more accounts
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </Card>

        {/* Category Breakdown */}
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
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  trendCard: {
    marginVertical: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
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
  totalBalance: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
  },
  chartContainer: {
    alignItems: 'center',
  },
  chart: {
    marginBottom: 12,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    fontWeight: '500',
  },
  dataSummary: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    gap: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 11,
    flex: 1,
  },
  summaryValue: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'right',
    marginLeft: 4,
  },
  accountsList: {
    gap: 8,
  },
  accountItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: 14,
    fontWeight: '500',
  },
  accountType: {
    fontSize: 11,
    textTransform: 'capitalize',
  },
  accountBalance: {
    fontSize: 14,
    fontWeight: '600',
  },
  seeMoreButton: {
    marginTop: 4,
    paddingVertical: 4,
  },
  seeMoreText: {
    fontSize: 12,
    fontWeight: '500',
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

export default MiniCharts;
