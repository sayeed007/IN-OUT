// src/screens/settings/components/AccountSettings.tsx
import React from 'react';
import { Text, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import Card from '../../../components/ui/Card';
import SettingItem from './SettingItem';
import { Spacing } from '../../../theme';
import { RootState } from '../../../state/store';
import { updatePreferences } from '../../../state/slices/preferencesSlice';

const CURRENCY_OPTIONS = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
];

const AccountSettings: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const currentCurrency = useSelector((state: RootState) => state.preferences.currencyCode);

  const handleManageAccounts = () => {
    navigation.navigate('AccountManager' as any);
  };

  const handleManageCategories = () => {
    navigation.navigate('CategoryManager' as any);
  };

  const handleChangeCurrency = () => {
    const buttons = [
      { text: 'Cancel', style: 'cancel' as const },
      ...CURRENCY_OPTIONS.map(currency => ({
        text: `${currency.name} (${currency.symbol})`,
        onPress: () => {
          dispatch(updatePreferences({ currencyCode: currency.code }));
        }
      }))
    ];

    Alert.alert(
      'Change Currency',
      'Select your preferred currency. This will apply to new transactions and reports.',
      buttons
    );
  };

  return (
    <Card style={styles.section} padding="small">
      <Text style={styles.sectionTitle}>Account</Text>

      <SettingItem
        title="Manage Accounts"
        subtitle="Add, edit, or remove accounts"
        onPress={handleManageAccounts}
      />

      <SettingItem
        title="Manage Categories"
        subtitle="Customize your income and expense categories"
        onPress={handleManageCategories}
      />

      <SettingItem
        title="Currency"
        subtitle={`${currentCurrency} (${CURRENCY_OPTIONS.find(c => c.code === currentCurrency)?.symbol || currentCurrency})`}
        onPress={handleChangeCurrency}
      />
    </Card>
  );
};

const styles = StyleSheet.create({
  section: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.base,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: Spacing.base,
  },
});

export default AccountSettings;