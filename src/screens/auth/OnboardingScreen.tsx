// src/screens/auth/OnboardingScreen.tsx
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { RootStackScreenProps } from '../../app/navigation/types';
import { Button, Card, Input } from '../../components/ui';
import AppInitializationService from '../../services/storage/appInitialization';
import { getSupportedCurrencies } from '../../utils/helpers/currencyUtils';
import { validateAccountName, validateRequired } from '../../utils/helpers/validationUtils';

type Props = RootStackScreenProps<'Onboarding'>;

interface OnboardingData {
  currency: string;
  firstAccountName: string;
  firstAccountType: 'cash' | 'bank' | 'wallet' | 'card';
  firstAccountBalance: string;
}

const OnboardingScreen: React.FC<Props> = ({ navigation }) => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    currency: 'BDT',
    firstAccountName: 'Cash',
    firstAccountType: 'cash',
    firstAccountBalance: '0',
  });

  const appInit = AppInitializationService.getInstance();
  const currencies = getSupportedCurrencies();

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = async () => {
    try {
      setIsLoading(true);

      // Validate data
      const currencyValid = validateRequired(data.currency);
      const accountNameValid = validateAccountName(data.firstAccountName);
      const balanceValid = !isNaN(parseFloat(data.firstAccountBalance)) && parseFloat(data.firstAccountBalance) >= 0;

      if (!currencyValid.isValid || !accountNameValid.isValid || !balanceValid) {
        Alert.alert('Error', 'Please check your inputs and try again.');
        return;
      }

      // Initialize database with user preferences
      const db = await appInit.initializeDatabase(data.currency);

      // Add user's first account
      const firstAccount = {
        name: data.firstAccountName,
        type: data.firstAccountType,
        openingBalance: parseFloat(data.firstAccountBalance) || 0,
        currencyCode: data.currency,
        isArchived: false,
      };

      // Update database with first account
      await appInit.updateDatabase({
        ...db,
        accounts: [...db.accounts, {
          ...firstAccount,
          id: `acc_${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }],
      });

      // Save initial app settings
      await appInit.updateAppSettings({
        currencyCode: data.currency,
        onboardingComplete: true,
        theme: 'system',
        dateFormat: 'MM/DD/YYYY',
        firstDayOfWeek: 0,
      });

      // Mark onboarding as complete
      await appInit.completeOnboarding();

      // Navigate to main app
      navigation.replace('Main', { screen: 'Dashboard' });

    } catch (error) {
      console.error('Onboarding completion failed:', error);
      Alert.alert('Error', 'Failed to complete setup. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
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
            variant={data.currency === currency.code ? 'primary' : 'secondary'}
            onPress={() => setData({ ...data, currency: currency.code })}
            style={styles.currencyButton}
          />
        ))}
      </View>
    </>

  );

  const renderStep2 = () => (
    <Card style={styles.card}>
      <Text style={styles.stepTitle}>Create Your First Account</Text>
      <Text style={styles.stepDescription}>
        Add your first account to start tracking transactions.
      </Text>

      <View style={styles.stepContent}>
        <Input
          label="Account Name"
          value={data.firstAccountName}
          onChangeText={(text) => setData({ ...data, firstAccountName: text })}
          placeholder="e.g., Cash, Bank Account"
          inputStyle={styles.input}
        />

        <Text style={styles.inputLabel}>Account Type:</Text>
        <View style={styles.accountTypeContainer}>
          {[
            { key: 'cash', label: '💵 Cash' },
            { key: 'bank', label: '🏦 Bank' },
            { key: 'wallet', label: '👛 Wallet' },
            { key: 'card', label: '💳 Card' },
          ].map((type) => (
            <Button
              key={type.key}
              title={type.label}
              variant={data.firstAccountType === type.key ? 'primary' : 'secondary'}
              onPress={() => setData({ ...data, firstAccountType: type.key as any })}
              style={styles.typeButton}
            />
          ))}
        </View>

        <Input
          label="Starting Balance (Optional)"
          value={data.firstAccountBalance}
          onChangeText={(text) => setData({ ...data, firstAccountBalance: text })}
          placeholder="0.00"
          keyboardType="numeric"
          inputStyle={styles.input}
        />
      </View>
    </Card>
  );

  const renderStep3 = () => (
    <Card style={styles.card}>
      <Text style={styles.stepTitle}>You're All Set!</Text>
      <Text style={styles.stepDescription}>
        Review your setup and start tracking your finances.
      </Text>

      <View style={styles.stepContent}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Currency:</Text>
          <Text style={styles.summaryValue}>{data.currency}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>First Account:</Text>
          <Text style={styles.summaryValue}>{data.firstAccountName}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Account Type:</Text>
          <Text style={styles.summaryValue}>{data.firstAccountType}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Starting Balance:</Text>
          <Text style={styles.summaryValue}>{data.firstAccountBalance || '0'} {data.currency}</Text>
        </View>

        <Text style={styles.readyText}>
          🎉 You're ready to start managing your finances!
        </Text>
      </View>
    </Card>
  );

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      default:
        return renderStep1();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Setup</Text>
        <View style={styles.stepIndicator}>
          {[1, 2, 3].map((stepNumber) => (
            <View
              key={stepNumber}
              style={[
                styles.stepDot,
                stepNumber <= step && styles.stepDotActive,
              ]}
            />
          ))}
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={true}
      >
        {renderStepContent()}
      </ScrollView>

      <View style={styles.footer}>
        {step > 1 && (
          <Button
            title="Back"
            variant="secondary"
            onPress={handleBack}
            style={styles.footerButton}
            disabled={isLoading}
          />
        )}
        <Button
          title={step === 3 ? 'Complete Setup' : 'Next'}
          onPress={handleNext}
          style={styles.footerButtonFullScreen}
          loading={isLoading}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 12,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#cbd5e1',
  },
  stepDotActive: {
    backgroundColor: '#3b82f6',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 20, // Extra bottom padding to prevent cropping
  },
  card: {
    marginBottom: 20,
  },
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
  input: {
    marginBottom: 16,
  },
  currencyList: {
    maxHeight: 320,
  },
  currencyButton: {
    marginBottom: 8,
  },
  accountTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  typeButton: {
    flex: 1,
    minWidth: '45%',
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
  footer: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    gap: 12,
  },
  footerButton: {
    minWidth: 100,
  },
  footerButtonFullScreen: {
    minWidth: 100,
    flex: 1,
  },
});

export default OnboardingScreen;
