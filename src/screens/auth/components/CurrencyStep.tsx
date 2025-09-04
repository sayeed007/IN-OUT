// src/screens/auth/components/CurrencyStep.tsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '../../../components/ui';
import { getSupportedCurrencies } from '../../../utils/helpers/currencyUtils';

interface CurrencyStepProps {
  selectedCurrency: string;
  onCurrencySelect: (currency: string) => void;
}

export const CurrencyStep: React.FC<CurrencyStepProps> = ({
  selectedCurrency,
  onCurrencySelect,
}) => {
  const currencies = getSupportedCurrencies();

  return (
    <>
      <Text style={styles.stepTitle}>Welcome to Expense Tracker!</Text>
      <Text style={styles.stepDescription}>
        Let's set up your account in a few simple steps to get you started tracking your income and expenses.
      </Text>

      <View style={styles.stepContent}>
        <Text style={styles.inputLabel}>Select your primary currency:</Text>
        {currencies.map((currency) => (
          <Button
            key={currency.code}
            title={`${currency.symbol} ${currency.name} (${currency.code})`}
            variant={selectedCurrency === currency.code ? 'primary' : 'secondary'}
            onPress={() => onCurrencySelect(currency.code)}
            style={styles.currencyButton}
          />
        ))}
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
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  currencyButton: {
    marginBottom: 8,
  },
});