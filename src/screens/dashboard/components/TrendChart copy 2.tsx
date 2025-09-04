import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { CartesianChart, Line } from 'victory-native';
import { useTheme } from '../../../app/providers/ThemeProvider';
import Card from '../../../components/ui/Card';

const { width: screenWidth } = Dimensions.get('window');
const chartWidth = screenWidth - 64; // Account for padding
const chartHeight = 200;

interface TrendData {
  month: string;
  fullMonth: string;
  income: number;
  expense: number;
}

interface TrendChartProps {
  trendData: TrendData[];
}

const TrendChart: React.FC<TrendChartProps> = ({ trendData }) => {
  const { theme } = useTheme();

  // Calculate cumulative data
  let cumulativeIncome = 0;
  let cumulativeExpense = 0;
  const chartData = trendData.map((d, index) => {
    cumulativeIncome += d.income;
    cumulativeExpense += d.expense;
    return {
      x: index,
      income: cumulativeIncome,
      expense: cumulativeExpense,
    };
  });

  // X-axis tick values with 5-day interval
  const interval = Math.max(1, Math.floor(trendData.length / 5));
  const tickValues = [];
  for (let i = 0; i < trendData.length; i += interval) {
    tickValues.push(i);
  }
  if (tickValues[tickValues.length - 1] !== trendData.length - 1) {
    tickValues.push(trendData.length - 1);
  }

  const chartStyle = {
    height: chartHeight,
    width: chartWidth,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
  };

  return (
    <Card style={styles.trendCard}>
      <View style={styles.chartHeader}>
        <Text style={[styles.chartTitle, { color: theme.colors.text }]}>
          Income vs Expenses
        </Text>
        <Text style={[styles.chartSubtitle, { color: theme.colors.textSecondary }]}>
          Cumulative Monthly Breakdown
        </Text>
      </View>

      <View style={styles.chartContainer}>
        <View style={{ ...chartStyle }}>
          <CartesianChart
            data={chartData}
            xKey="x"
            yKeys={["income", "expense"]}
            padding={{ left: 10, right: 10, top: 10, bottom: 10 }}
            axisOptions={{
              font: null,
              tickCount: 5,
              lineColor: theme.colors.textSecondary,
              lineWidth: 0.1,
              labelColor: theme.colors.textSecondary,
              formatXLabel: (value) => trendData[value]?.month || '',
              formatYLabel: (value) => `$${Math.round(value / 1000)}k`,
            }}
          >
            {({ points }) => (
              <>
                {/* Income Line */}
                <Line
                  points={points.income}
                  color={theme.colors.income.main}
                  strokeWidth={2}
                />
                {/* Expense Line */}
                <Line
                  points={points.expense}
                  color={theme.colors.expense.main}
                  strokeWidth={2}
                />
              </>
            )}
          </CartesianChart>
        </View>

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
  );
};

const styles = StyleSheet.create({
  trendCard: {
    marginVertical: 12,
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
  chartContainer: {
    alignItems: 'center',
    height: chartHeight + 80, // Extra space for legend
    width: '100%',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginTop: 12,
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
  summaryValue: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'right',
    marginLeft: 4,
  },
});

export default TrendChart;