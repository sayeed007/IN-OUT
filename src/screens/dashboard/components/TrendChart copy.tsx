import React from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { Circle, G, Path, Line } from 'react-native-svg';
import { useTheme } from '../../../app/providers/ThemeProvider';
import Card from '../../../components/ui/Card';

const { width: screenWidth } = Dimensions.get('window');
const chartWidth = screenWidth - 64; // Account for padding
const chartHeight = 120;

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

  // Format money for y-axis labels
  const formatMoney = (value: number) => {
    if (value >= 1000) {
      return '$' + (value / 1000).toFixed(0) + 'k';
    }
    return '$' + value.toFixed(0);
  };

  // Calculate cumulative data
  let cumulativeIncome = 0;
  const incomeData: number[] = trendData.map(d => {
    cumulativeIncome += d.income;
    return cumulativeIncome;
  });

  let cumulativeExpense = 0;
  const expenseData: number[] = trendData.map(d => {
    cumulativeExpense += d.expense;
    return cumulativeExpense;
  });

  // Shared maxValue for normalization
  const maxValue = Math.max(
    ...incomeData,
    ...expenseData,
    1
  );

  // Create trend line path and points for income/expense
  const createTrendData = (data: number[]) => {
    if (data.length === 0) return { path: '', points: [] };

    const points = data.map((value, index) => {
      const x = (index / Math.max(data.length - 1, 1)) * chartWidth;
      const y = chartHeight - (value / maxValue) * (chartHeight - 20); // Leave margin for dots
      return { x, y, value };
    });

    const pathString = points.length > 0 ? `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}` : '';
    return { path: pathString, points };
  };

  const incomeChart = createTrendData(incomeData);
  const expenseChart = createTrendData(expenseData);

  // Y-axis ticks
  const tickCount = 6;
  const tickLabels = Array.from({ length: tickCount }, (_, i) =>
    formatMoney(maxValue * i / (tickCount - 1))
  );

  // X-axis labels with 5-day interval
  const interval = Math.max(1, Math.floor(trendData.length / 5));
  const xAxisLabels = trendData.filter((_, index) => index % interval === 0 || index === trendData.length - 1).map(d => d.month);

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
        <View style={styles.chartWithAxis}>
          <View style={styles.yAxis}>
            {tickLabels.map((label, index) => (
              <Text
                key={index}
                style={[styles.yLabel, { color: theme.colors.textSecondary }]}
              >
                {label}
              </Text>
            ))}
          </View>
          <Svg width={chartWidth} height={chartHeight} style={styles.chart}>
            {/* Grid lines */}
            {tickLabels.map((_, index) => {
              const y = (index / (tickCount - 1)) * chartHeight;
              return (
                <Line
                  key={`grid-${index}`}
                  x1="0"
                  y1={y}
                  x2={chartWidth}
                  y2={y}
                  stroke={theme.colors.textSecondary}
                  strokeWidth="0.5"
                  strokeOpacity="0.3"
                />
              );
            })}
            {xAxisLabels.map((_, index) => {
              const x = (index / (xAxisLabels.length - 1)) * chartWidth;
              return (
                <Line
                  key={`grid-x-${index}`}
                  x1={x}
                  y1="0"
                  x2={x}
                  y2={chartHeight}
                  stroke={theme.colors.textSecondary}
                  strokeWidth="0.5"
                  strokeOpacity="0.3"
                />
              );
            })}

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
        </View>

        {/* X-axis labels with 5-day interval */}
        <View style={styles.xAxisLabels}>
          {xAxisLabels.map((label, index) => (
            <Text
              key={index}
              style={[styles.xLabel, { color: theme.colors.textSecondary }]}
            >
              {label}
            </Text>
          ))}
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
  },
  chartWithAxis: {
    flexDirection: 'row',
  },
  yAxis: {
    width: 40,
    height: chartHeight,
    justifyContent: 'space-between',
    flexDirection: 'column-reverse',
    paddingRight: 4,
    alignItems: 'flex-end',
  },
  yLabel: {
    fontSize: 8,
  },
  chart: {
    marginBottom: 12,
  },
  xAxisLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: chartWidth,
    marginLeft: 40, // Offset by y-axis width
    marginBottom: 12,
  },
  xLabel: {
    fontSize: 8,
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
    fontSize: 10,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 8,
    fontWeight: '600',
    textAlign: 'right',
    marginLeft: 4,
  },
});

export default TrendChart;