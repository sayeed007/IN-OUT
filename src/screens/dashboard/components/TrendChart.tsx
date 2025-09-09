import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { CartesianChart, Line, useChartPressState } from 'victory-native';
import { Circle, useFont } from '@shopify/react-native-skia';
import { useTheme } from '../../../app/providers/ThemeProvider';
import Card from '../../../components/ui/Card';

const { width: screenWidth } = Dimensions.get('window');
const chartWidth = screenWidth - 64; // Account for padding
const chartHeight = 250;

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
  const { state, isActive } = useChartPressState({ x: 0, y: { income: 0, expense: 0 } });
  const font = useFont(require('../../../assets/fonts/Roboto-Regular.ttf'), 12);

  // Calculate cumulative data
  let cumulativeIncome = 0;
  let cumulativeExpense = 0;
  const chartData = trendData.map((d, index) => {
    cumulativeIncome += (d.income || 0);
    cumulativeExpense += (d.expense || 0);
    return {
      x: index,
      income: Number(cumulativeIncome) || 0,
      expense: Number(cumulativeExpense) || 0,
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

  if (chartData.length === 0) {
    return (
      <Card style={styles.trendCard}>
        <Text style={[styles.chartTitle, { color: theme.colors.text }]}>
          No data available
        </Text>
      </Card>
    );
  }

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
            chartPressState={state}
            xAxis={{
              font,
              tickCount: 5,
              lineColor: theme.colors.textSecondary,
              lineWidth: 0.1,
              labelColor: theme.colors.textSecondary,
              formatXLabel: (value) => {
                const index = Math.round(value);
                return trendData[index]?.month || '';
              },
            }}
            yAxis={[{
              // yKeys=["income", "expense"],
              font,
              tickCount: 5,
              lineColor: theme.colors.textSecondary,
              lineWidth: 0.1,
              labelColor: theme.colors.textSecondary,
              formatYLabel: (value) => {
                if (value >= 1000) return `$${(value / 1000).toFixed(0)}k`;
                return `$${value.toFixed(0)}`;
              }
            }]}
          >
            {({ points }) => (
              <>
                {/* Income Line */}
                <Line
                  points={points.income}
                  color={theme.colors.income.main}
                  strokeWidth={2}
                  animate={{ type: "timing", duration: 300 }}
                />
                {/* Expense Line */}
                <Line
                  points={points.expense}
                  color={theme.colors.expense.main}
                  strokeWidth={2}
                  animate={{ type: "timing", duration: 300 }}
                />

                {/* Active point indicators */}
                {isActive && (
                  <>
                    <Circle
                      cx={state.x.position}
                      cy={state.y.income.position}
                      r={4}
                      color={theme.colors.income.main}
                    />
                    <Circle
                      cx={state.x.position}
                      cy={state.y.expense.position}
                      r={4}
                      color={theme.colors.expense.main}
                    />
                  </>
                )}
              </>
            )}
          </CartesianChart>
        </View>

        {/* Active data tooltip */}
        {isActive && state.x.value !== null && state.y.income.value !== null && state.y.expense.value !== null && (
          <View style={[styles.tooltip, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.tooltipMonth, { color: theme.colors.text }]}>
              {trendData[Math.round(state.x.value.value)]?.fullMonth || trendData[Math.round(state.x.value.value)]?.month}
            </Text>
            <Text style={[styles.tooltipValue, { color: theme.colors.income.main }]}>
              Income: ${Math.round(state.y.income.value.value || 0).toLocaleString()}
            </Text>
            <Text style={[styles.tooltipValue, { color: theme.colors.expense.main }]}>
              Expenses: ${Math.round(state.y.expense.value.value || 0).toLocaleString()}
            </Text>
          </View>
        )}

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
    </Card >
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
    height: chartHeight + 35, // Extra space for legend
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
  tooltip: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    minWidth: 120,
  },
  tooltipMonth: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    textAlign: 'center',
  },
  tooltipValue: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
  },
});

export default TrendChart;