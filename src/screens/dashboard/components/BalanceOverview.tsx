// src/screens/dashboard/components/BalanceOverview.tsx
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

interface BalanceOverviewProps {
  totalBalance: number;
  net: number;
  income: number;
  expense: number;
  onIncomePress?: () => void;
  onExpensePress?: () => void;
  currencyCode?: string;
}

export const BalanceOverview: React.FC<BalanceOverviewProps> = ({
  totalBalance,
  net,
  income,
  expense,
  onIncomePress,
  onExpensePress,
  currencyCode = 'BDT'
}) => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      {/* First Row: Total Balance & Net */}
      <View style={styles.row}>

        {/* Total Balance */}
        <View style={StyleSheet.flatten([styles.card, { backgroundColor: theme.colors.surface, borderLeftWidth: 4, borderLeftColor: theme.colors.primary[500] }])}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary[500] + '15' }]}>
              <Icon name="wallet" size={20} color={theme.colors.primary[500]} />
            </View>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
              Total Balance
            </Text>
          </View>
          <Text style={[styles.amount, { color: theme.colors.text }]} numberOfLines={1}>
            {formatCurrency(totalBalance, currencyCode)}
          </Text>
        </View>

        {/* Net Income */}
        <View style={StyleSheet.flatten([
          styles.card,
          {
            backgroundColor: theme.colors.surface,
            borderLeftWidth: 4,
            borderLeftColor: net >= 0 ? theme.colors.success[500] : theme.colors.error[500]
          }
        ])}>
          <View style={styles.cardHeader}>
            <View style={[
              styles.iconContainer,
              {
                backgroundColor: net >= 0
                  ? theme.colors.success[500] + '15'
                  : theme.colors.error[500] + '15'
              }
            ]}>
              <Icon
                name={net >= 0 ? 'trending-up' : 'trending-down'}
                size={20}
                color={net >= 0 ? theme.colors.success[500] : theme.colors.error[500]}
              />
            </View>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
              Net Income
            </Text>
          </View>
          <Text
            style={[
              styles.amount,
              { color: net >= 0 ? theme.colors.success[500] : theme.colors.error[500] }
            ]}
            numberOfLines={1}
          >
            {formatCurrency(net, currencyCode)}
          </Text>
        </View>
      </View>

      {/* Second Row: Income & Expense */}
      <View style={styles.row}>
        {/* Income */}
        <TouchableOpacity
          style={StyleSheet.flatten([styles.card, { backgroundColor: theme.colors.surface, borderLeftWidth: 4, borderLeftColor: theme.colors.success[500] }])}
          onPress={onIncomePress}
          activeOpacity={0.7}
        >
          <View style={styles.cardHeader}>
            <View style={[styles.iconContainer, { backgroundColor: theme.colors.success[500] + '15' }]}>
              <Icon name="arrow-down" size={20} color={theme.colors.success[500]} />
            </View>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
              Income
            </Text>
          </View>
          <Text style={[styles.amount, { color: theme.colors.success[500] }]} numberOfLines={1}>
            {formatCurrency(income, currencyCode)}
          </Text>
        </TouchableOpacity>

        {/* Expense */}
        <TouchableOpacity
          style={StyleSheet.flatten([styles.card, { backgroundColor: theme.colors.surface, borderLeftWidth: 4, borderLeftColor: theme.colors.error[500] }])}
          onPress={onExpensePress}
          activeOpacity={0.7}
        >
          <View style={styles.cardHeader}>
            <View style={[styles.iconContainer, { backgroundColor: theme.colors.error[500] + '15' }]}>
              <Icon name="arrow-up" size={20} color={theme.colors.error[500]} />
            </View>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
              Expense
            </Text>
          </View>
          <Text style={[styles.amount, { color: theme.colors.error[500] }]} numberOfLines={1}>
            {formatCurrency(expense, currencyCode)}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  card: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  amount: {
    fontSize: 20,
    fontWeight: '700',
  },
});
