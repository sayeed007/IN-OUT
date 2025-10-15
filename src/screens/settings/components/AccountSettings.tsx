// src/screens/settings/components/AccountSettings.tsx
import React, { useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import Card from '../../../components/ui/Card';
import SettingItem from './SettingItem';
import { Spacing } from '../../../theme';
import { useTheme } from '../../../app/providers/ThemeProvider';
import { RootState } from '../../../state/store';
import { updatePreferences } from '../../../state/slices/preferencesSlice';
import { getCurrencyInfo } from '../../../utils/helpers/currencyUtils';
import { CurrencySelectionModal } from '../../../components/modals/CurrencySelectionModal';

const AccountSettings: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const currentCurrency = useSelector((state: RootState) => state.preferences.currencyCode);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);

  const handleManageAccounts = () => {
    navigation.navigate('AccountManager' as any);
  };

  const handleManageCategories = () => {
    navigation.navigate('CategorySettings' as any);
  };

  const handleChangeCurrency = () => {
    setShowCurrencyModal(true);
  };

  const handleCurrencySelect = (currencyCode: string) => {
    dispatch(updatePreferences({ currencyCode }));
  };

  const styles = StyleSheet.create({
    section: {
      marginBottom: Spacing.base,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: Spacing.base,
    },
  });

  return (
    <>
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
          subtitle={`${currentCurrency} (${getCurrencyInfo(currentCurrency).symbol})`}
          onPress={handleChangeCurrency}
        />
      </Card>

      {showCurrencyModal &&
        <CurrencySelectionModal
          visible={showCurrencyModal}
          onClose={() => setShowCurrencyModal(false)}
          selectedCurrency={currentCurrency}
          onCurrencySelect={handleCurrencySelect}
        />
      }
    </>
  );
};

export default AccountSettings;