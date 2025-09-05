import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../app/providers/ThemeProvider';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  amount?: number;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  amount,
}) => {
  const { theme } = useTheme();

  const formatAmount = () => {
    if (amount) {
      const isNegative = amount < 0;
      const absAmount = Math.abs(amount);
      const prefix = isNegative ? '-' : '+';
      return `${prefix}$${absAmount.toFixed(2)}`;
    } else {
      return '+0';
    }
  };

  const getAmountColor = () => {
    if (!amount) return theme.colors.textSecondary;
    if (amount > 0) return theme.colors.income.main;
    if (amount < 0) return theme.colors.expense.main;
    return theme.colors.textSecondary;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.leftSection}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            {subtitle}
          </Text>
        )}
      </View>

      {amount !== undefined && (
        <View style={styles.rightSection}>
          <Text
            style={[
              styles.amount,
              {
                color: getAmountColor(),
              },
            ]}
          >
            {formatAmount()}
          </Text>
          <Text style={[styles.netLabel, { color: theme.colors.textTertiary }]}>
            net
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // paddingVertical: 8,
    marginTop: 8,
    marginBottom: 4,
  },
  leftSection: {
    flex: 1,
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
  },
  amount: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  netLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

export default SectionHeader;
