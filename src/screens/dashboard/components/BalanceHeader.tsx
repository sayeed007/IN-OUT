// src/screens/dashboard/components/BalanceHeader.tsx
import React from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTheme } from '../../../app/providers/ThemeProvider';
import { formatCurrency } from '../../../utils/helpers/currencyUtils';

interface BalanceHeaderProps {
  totalBalance: number;
  monthlyChange: number;
  currencyCode?: string;
}

export const BalanceHeader: React.FC<BalanceHeaderProps> = ({
  totalBalance,
  monthlyChange,
  currencyCode = 'BDT'
}) => {
  const { theme } = useTheme();
  const isPositive = monthlyChange >= 0;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.primary[500] }]}>
      <Text style={[styles.label, { color: theme.colors.onPrimary + 'CC' }]}>
        Total Balance
      </Text>
      <Text style={[styles.balance, { color: theme.colors.onPrimary }]}>
        {formatCurrency(totalBalance, currencyCode)}
      </Text>
      <View style={styles.changeContainer}>
        <Text style={[styles.changeText, { color: theme.colors.onPrimary + 'E6' }]}>
          {isPositive ? '+' : ''}{formatCurrency(monthlyChange, currencyCode)} this month
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderRadius: 20,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  balance: {
    fontSize: 36,
    fontWeight: '700',
    marginBottom: 8,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  changeText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
