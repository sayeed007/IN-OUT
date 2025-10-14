// src/screens/auth/OnboardingScreen.tsx
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import type { RootStackScreenProps } from '../../app/navigation/types';
import { SafeContainer } from '../../components/layout/SafeContainer';
import { Button } from '../../components/ui';
import AppInitializationService from '../../services/storage/appInitialization';
import { validateRequired } from '../../utils/helpers/validationUtils';
import { CurrencyStep } from './components/CurrencyStep';
import { AccountSetupStep } from './components/AccountSetupStep';
import { SummaryStep } from './components/SummaryStep';
import { showToast } from '../../utils/helpers/toast';

type Props = RootStackScreenProps<'Onboarding'>;

interface OnboardingData {
  currency: string;
  firstAccount: {
    name: string;
    type: 'cash' | 'bank' | 'wallet' | 'card' | 'other';
    balance: string;
  };
}

const OnboardingScreen: React.FC<Props> = ({ navigation }) => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    currency: 'BDT',
    firstAccount: {
      name: 'Cash',
      type: 'cash',
      balance: '0',
    },
  });

  const appInit = AppInitializationService.getInstance();

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
      const accountNameValid = validateRequired(data.firstAccount.name);
      const balanceValid = !isNaN(parseFloat(data.firstAccount.balance)) && parseFloat(data.firstAccount.balance) >= 0;

      if (!currencyValid.isValid || !accountNameValid.isValid || !balanceValid) {
        showToast.error('Please check your inputs and try again.');
        return;
      }

      // Initialize database with user preferences
      const db = await appInit.initializeDatabase(data.currency);

      // Check if the selected account already exists in seeded accounts
      const existingAccount = db.accounts.find(acc => acc.name === data.firstAccount.name && acc.type === data.firstAccount.type);
      
      let updatedAccounts;
      if (existingAccount) {
        // Update the existing seeded account with the user's balance
        updatedAccounts = db.accounts.map(acc => 
          acc.id === existingAccount.id 
            ? { 
                ...acc, 
                openingBalance: parseFloat(data.firstAccount.balance) || 0,
                updatedAt: new Date().toISOString(),
              }
            : acc
        );
      } else {
        // Add new custom account
        const newAccount = {
          name: data.firstAccount.name,
          type: data.firstAccount.type,
          openingBalance: parseFloat(data.firstAccount.balance) || 0,
          currencyCode: data.currency,
          isArchived: false,
          id: `acc_${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        updatedAccounts = [...db.accounts, newAccount];
      }

      // Update database with accounts
      await appInit.updateDatabase({
        ...db,
        accounts: updatedAccounts,
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
      showToast.error('Failed to complete setup. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <CurrencyStep
      selectedCurrency={data.currency}
      onCurrencySelect={(currency) => setData({ ...data, currency })}
    />
  );

  const renderStep2 = () => (
    <AccountSetupStep
      selectedAccount={data.firstAccount}
      onAccountChange={(account) => setData({ ...data, firstAccount: account })}
      currency={data.currency}
    />
  );

  const renderStep3 = () => (
    <SummaryStep
      currency={data.currency}
      account={data.firstAccount}
    />
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
    <SafeContainer style={styles.container}>
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
    </SafeContainer>
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
