// src/screens/auth/components/AccountSetupStep.tsx
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Input } from '../../../components/ui';
import { AccountSelector } from '../../../components/forms/AccountSelector';
import { AccountCreationModal } from '../../../components/modals/AccountCreationModal';
import AppInitializationService from '../../../services/storage/appInitialization';
import type { Account } from '../../../types/global';

interface AccountSetupStepProps {
  selectedAccount: {
    name: string;
    type: 'cash' | 'bank' | 'wallet' | 'card' | 'other';
    balance: string;
  };
  onAccountChange: (account: { name: string; type: 'cash' | 'bank' | 'wallet' | 'card' | 'other'; balance: string }) => void;
  currency: string;
}


export const AccountSetupStep: React.FC<AccountSetupStepProps> = ({
  selectedAccount,
  onAccountChange,
  currency,
}) => {
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [seededAccounts, setSeededAccounts] = useState<Account[]>([]);
  const appInit = AppInitializationService.getInstance();

  // Load seeded accounts from app initialization
  useEffect(() => {
    const loadSeededAccounts = async () => {
      try {
        // Initialize database first to get default accounts
        const db = await appInit.initializeDatabase(currency);
        setSeededAccounts(db.accounts);
      } catch (error) {
        console.error('Failed to load seeded accounts:', error);
      }
    };

    loadSeededAccounts();
  }, [currency]);

  const handleAccountSelect = (accountId: string) => {
    const selectedSeededAccount = seededAccounts.find(acc => acc.id === accountId);
    if (selectedSeededAccount) {
      onAccountChange({
        name: selectedSeededAccount.name,
        type: selectedSeededAccount.type,
        balance: selectedAccount.balance, // Keep current balance
      });
    }
  };

  const handleCustomAccountCreated = (account: any) => {
    onAccountChange({
      name: account.name,
      type: account.type,
      balance: selectedAccount.balance,
    });
    setShowAccountModal(false);
  };

  const handleBalanceChange = (balance: string) => {
    onAccountChange({
      ...selectedAccount,
      balance,
    });
  };

  return (
    <>
      <Text style={styles.stepTitle}>Create Your First Account</Text>
      <Text style={styles.stepDescription}>
        Choose from our suggested accounts or create a custom one to start tracking transactions.
      </Text>

      <View style={styles.stepContent}>
        {/* Account Selection with Floating Label */}
        <AccountSelector
          accounts={seededAccounts}
          selectedAccountId={seededAccounts.find(acc => acc.name === selectedAccount.name)?.id || ''}
          onSelectAccount={handleAccountSelect}
          compact={true}
          floatingLabel={true}
          label="Account"
          onQuickAdd={() => setShowAccountModal(true)}
        />

        <Input
          label="Starting Balance (Optional)"
          value={selectedAccount.balance}
          onChangeText={handleBalanceChange}
          placeholder="0.00"
          keyboardType="numeric"
        />
      </View>

      {/* Account Creation Modal */}
      <AccountCreationModal
        visible={showAccountModal}
        onClose={() => setShowAccountModal(false)}
        onAccountCreated={handleCustomAccountCreated}
      />
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
});