// src/screens/auth/components/SummaryStep.tsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

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
  return (
    <>
      <Text style={styles.stepTitle}>You're All Set!</Text>
      <Text style={styles.stepDescription}>
        Review your setup and start tracking your finances.
      </Text>

      <View style={styles.stepContent}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Currency:</Text>
          <Text style={styles.summaryValue}>{currency}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>First Account:</Text>
          <Text style={styles.summaryValue}>{account.name}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Account Type:</Text>
          <Text style={styles.summaryValue}>{account.type}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Starting Balance:</Text>
          <Text style={styles.summaryValue}>{account.balance || '0'} {currency}</Text>
        </View>

        <Text style={styles.readyText}>
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
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
  },
  stepDescription: {
    fontSize: 16,
    color: '#64748b',
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
    borderBottomColor: '#e2e8f0',
  },
  summaryLabel: {
    fontSize: 16,
    color: '#64748b',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
  },
  readyText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#059669',
    textAlign: 'center',
    marginTop: 20,
  },
});