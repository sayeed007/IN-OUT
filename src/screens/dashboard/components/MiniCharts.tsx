import React from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../../app/providers/ThemeProvider';
import Card from '../../../components/ui/Card';
import { Account } from '../../../types/global';

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
}

interface MiniChartsProps {
  trendData: TrendData[];
  categoryData: CategoryData[];
  accounts: Account[];
}

const MiniCharts: React.FC<MiniChartsProps> = ({
  trendData,
  categoryData,
  accounts,
}) => {
  const { theme } = useTheme();

  // Create trend line path for income/expense
  const createTrendPath = (data: number[]) => {
    if (data.length === 0) return '';

    const maxValue = Math.max(...data, 1);
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * chartWidth;
      const y = chartHeight - (value / maxValue) * chartHeight;
      return `${x},${y}`;
    });

    return `M ${points.join(' L ')}`;
  };

  const incomeData = trendData.map(d => d.income);
  const expenseData = trendData.map(d => d.expense);

  const incomePath = createTrendPath(incomeData);
  const expensePath = createTrendPath(expenseData);

  // Calculate total balance
  const totalBalance = accounts.reduce((sum, account) => sum + account.openingBalance, 0);

  return (
    <View style={styles.container}>
      {/* Income vs Expense Trend */}
      <Card style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <Text style={[styles.chartTitle, { color: theme.colors.text }]}>
            Income vs Expenses
          </Text>
          <Text style={[styles.chartSubtitle, { color: theme.colors.textSecondary }]}>
            Last 12 months
          </Text>
        </View>

        <View style={styles.chartContainer}>
          <Svg width={chartWidth} height={chartHeight} style={styles.chart}>
            {/* Income line */}
            <Path
              d={incomePath}
              stroke={theme.colors.success[500]}
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Expense line */}
            <Path
              d={expensePath}
              stroke={theme.colors.error[500]}
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>

          {/* Legend */}
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: theme.colors.success[500] }]} />
              <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>
                Income
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: theme.colors.error[500] }]} />
              <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>
                Expenses
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
                  color: account.openingBalance >= 0 ? theme.colors.success[500] : theme.colors.error[500]
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
            {categoryData.slice(0, 4).map((category, index) => {
              const percentage = categoryData.length > 0
                ? (category.amount / categoryData.reduce((sum, c) => sum + c.amount, 0)) * 100
                : 0;

              const barColor = theme.colors.chart[(index + 1) as keyof typeof theme.colors.chart] || theme.colors.primary[500];

              return (
                <View key={category.categoryId} style={styles.categoryItem}>
                  <View style={styles.categoryInfo}>
                    <View style={[styles.categoryDot, { backgroundColor: barColor }]} />
                    <Text style={[styles.categoryName, { color: theme.colors.text }]}>
                      Category {index + 1}
                    </Text>
                  </View>
                  <View style={styles.categoryAmount}>
                    <Text style={[styles.categoryValue, { color: theme.colors.text }]}>
                      ${category.amount.toFixed(0)}
                    </Text>
                    <Text style={[styles.categoryPercentage, { color: theme.colors.textSecondary }]}>
                      {percentage.toFixed(0)}%
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </Card>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  chartCard: {
    marginBottom: 12,
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfCard: {
    flex: 1,
    marginHorizontal: 6,
    padding: 16,
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
    fontSize: 20,
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
});

export default MiniCharts;
