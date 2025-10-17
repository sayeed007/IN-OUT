// src/screens/auth/components/CurrencyStep.tsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '../../../components/ui';
import { getSupportedCurrencies } from '../../../utils/helpers/currencyUtils';
import { useTheme } from '../../../app/providers/ThemeProvider';

interface CurrencyStepProps {
  selectedCurrency: string;
  onCurrencySelect: (currency: string) => void;
}

export const CurrencyStep: React.FC<CurrencyStepProps> = ({
  selectedCurrency,
  onCurrencySelect,
}) => {
  const currencies = getSupportedCurrencies();
  const { theme } = useTheme();

  return (
    <>
      <Text style={[styles.stepTitle, { color: theme.colors.text }]}>Welcome to Expense Tracker!</Text>
      <Text style={[styles.stepDescription, { color: theme.colors.textSecondary }]}>
        Let's set up your account in a few simple steps to get you started tracking your income and expenses.
      </Text>

      <View style={styles.stepContent}>
        <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Select your primary currency:</Text>
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
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  currencyButton: {
    marginBottom: 8,
  },
});