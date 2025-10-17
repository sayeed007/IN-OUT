// src/screens/auth/components/SummaryStep.tsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../../app/providers/ThemeProvider';

interface SummaryStepProps {
  currency: string;
  account: {
    name: string;
    type: string;
    balance: string;
  };
}

export const SummaryStep: React.FC<SummaryStepProps> = ({
  currency,
  account,
}) => {
  const { theme } = useTheme();

  return (
    <>
      <Text style={[styles.stepTitle, { color: theme.colors.text }]}>You're All Set!</Text>
      <Text style={[styles.stepDescription, { color: theme.colors.textSecondary }]}>
        Review your setup and start tracking your finances.
      </Text>

      <View style={styles.stepContent}>
        <View style={[styles.summaryItem, { borderBottomColor: theme.colors.border }]}>
          <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Currency:</Text>
          <Text style={[styles.summaryValue, { color: theme.colors.text }]}>{currency}</Text>
        </View>
        <View style={[styles.summaryItem, { borderBottomColor: theme.colors.border }]}>
          <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>First Account:</Text>
          <Text style={[styles.summaryValue, { color: theme.colors.text }]}>{account.name}</Text>
        </View>
        <View style={[styles.summaryItem, { borderBottomColor: theme.colors.border }]}>
          <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Account Type:</Text>
          <Text style={[styles.summaryValue, { color: theme.colors.text }]}>{account.type}</Text>
        </View>
        <View style={[styles.summaryItem, { borderBottomColor: theme.colors.border }]}>
          <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Starting Balance:</Text>
          <Text style={[styles.summaryValue, { color: theme.colors.text }]}>{account.balance || '0'} {currency}</Text>
        </View>

        <Text style={[styles.readyText, { color: theme.colors.success[600] }]}>
          🎉 You're ready to start managing your finances!
        </Text>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  stepTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  stepDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  stepContent: {
    gap: 16,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  summaryLabel: {
    fontSize: 16,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  readyText: {
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 20,
  },
});