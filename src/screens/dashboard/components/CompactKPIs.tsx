// src/screens/dashboard/components/CompactKPIs.tsx
import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../app/providers/ThemeProvider';
import { formatCurrency } from '../../../utils/helpers/currencyUtils';

interface CompactKPIsProps {
  income: number;
  expense: number;
  net: number;
  onIncomePress?: () => void;
  onExpensePress?: () => void;
  currencyCode?: string;
}

export const CompactKPIs: React.FC<CompactKPIsProps> = ({
  income,
  expense,
  net,
  onIncomePress,
  onExpensePress,
  currencyCode = 'BDT'
}) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      {/* Income */}
      <TouchableOpacity
        style={styles.kpiItem}
        onPress={onIncomePress}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, { backgroundColor: theme.colors.success[500] + '15' }]}>
          <Icon name="arrow-down" size={16} color={theme.colors.success[500]} />
        </View>
        <View style={styles.kpiContent}>
          <Text style={[styles.kpiLabel, { color: theme.colors.textSecondary }]}>
            Income
          </Text>
          <Text style={[styles.kpiValue, { color: theme.colors.success[500] }]}>
            {formatCurrency(income, currencyCode)}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Divider */}
      <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

      {/* Expense */}
      <TouchableOpacity
        style={styles.kpiItem}
        onPress={onExpensePress}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, { backgroundColor: theme.colors.error[500] + '15' }]}>
          <Icon name="arrow-up" size={16} color={theme.colors.error[500]} />
        </View>
        <View style={styles.kpiContent}>
          <Text style={[styles.kpiLabel, { color: theme.colors.textSecondary }]}>
            Expense
          </Text>
          <Text style={[styles.kpiValue, { color: theme.colors.error[500] }]}>
            {formatCurrency(expense, currencyCode)}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Divider */}
      <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

      {/* Net */}
      <View style={styles.kpiItem}>
        <View style={[
          styles.iconContainer,
          { backgroundColor: (net >= 0 ? theme.colors.primary[500] : theme.colors.warning[500]) + '15' }
        ]}>
          <Icon
            name={net >= 0 ? 'trending-up' : 'trending-down'}
            size={16}
            color={net >= 0 ? theme.colors.primary[500] : theme.colors.warning[500]}
          />
        </View>
        <View style={styles.kpiContent}>
          <Text style={[styles.kpiLabel, { color: theme.colors.textSecondary }]}>
            Net
          </Text>
          <Text style={[
            styles.kpiValue,
            { color: net >= 0 ? theme.colors.primary[500] : theme.colors.warning[500] }
          ]}>
            {formatCurrency(net, currencyCode)}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  kpiItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  kpiContent: {
    flex: 1,
  },
  kpiLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 2,
  },
  kpiValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  divider: {
    width: 1,
    marginHorizontal: 8,
  },
});
