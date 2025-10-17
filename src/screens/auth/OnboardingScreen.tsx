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
import { useTheme } from '../../app/providers/ThemeProvider';

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
  const { theme } = useTheme();

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

  // const renderStep1 = () => (
  //   <CurrencyStep
  //     selectedCurrency={data.currency}
  //     onCurrencySelect={(currency) => setData({ ...data, currency })}
  //   />
  // );

  // const renderStep2 = () => (
  //   <AccountSetupStep
  //     selectedAccount={data.firstAccount}
  //     onAccountChange={(account) => setData({ ...data, firstAccount: account })}
  //     currency={data.currency}
  //   />
  // );

  // const renderStep3 = () => (
  //   <SummaryStep
  //     currency={data.currency}
  //     account={data.firstAccount}
  //   />
  // );

  const renderStepContent = () => {
    switch (step) {
      // case 1:
      //   return renderStep1();
      case 2:
        return (
          <AccountSetupStep
            selectedAccount={data.firstAccount}
            onAccountChange={(account) => setData({ ...data, firstAccount: account })}
            currency={data.currency}
          />
        )
      case 3:
        return (
          <SummaryStep
            currency={data.currency}
            account={data.firstAccount}
          />
        )
      default:
        return (
          <CurrencyStep
            selectedCurrency={data.currency}
            onCurrencySelect={(currency) => setData({ ...data, currency })}
          />
        )
    }
  };

  return (
    <SafeContainer style={StyleSheet.flatten([styles.container, { backgroundColor: theme.colors.background }])}>
      <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Setup</Text>
        <View style={styles.stepIndicator}>
          {[1, 2, 3].map((stepNumber) => (
            <View
              key={stepNumber}
              style={[
                styles.stepDot,
                { backgroundColor: theme.colors.border },
                stepNumber <= step && { backgroundColor: theme.colors.primary[500] },
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
  },
  header: {
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
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
    marginBottom: 8,
    textAlign: 'center',
  },
  stepDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  footer: {
    flexDirection: 'row',
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
