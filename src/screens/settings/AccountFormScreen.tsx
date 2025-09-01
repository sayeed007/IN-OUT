// src/screens/settings/AccountFormScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
import { SafeContainer } from '../../components/layout/SafeContainer';
import Card from '../../components/ui/Card';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Spacing } from '../../theme';
import { 
  useGetAccountQuery, 
  useAddAccountMutation, 
  useUpdateAccountMutation 
} from '../../state/api';
import { RootState } from '../../state/store';
import type { Account } from '../../types/global';
import type { SettingsStackParamList } from '../../app/navigation/types';

type AccountFormRouteProp = RouteProp<SettingsStackParamList, 'AccountForm'>;

const ACCOUNT_TYPES = [
  { value: 'bank' as const, label: 'Bank Account', icon: 'card-outline' },
  { value: 'cash' as const, label: 'Cash', icon: 'wallet-outline' },
  { value: 'card' as const, label: 'Credit/Debit Card', icon: 'card-outline' },
  { value: 'wallet' as const, label: 'Digital Wallet', icon: 'phone-portrait-outline' },
  { value: 'other' as const, label: 'Other', icon: 'ellipse-outline' },
];

export const AccountFormScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<AccountFormRouteProp>();
  const accountId = route.params?.accountId;
  const isEditing = !!accountId;

  const defaultCurrency = useSelector((state: RootState) => state.preferences.currencyCode);

  // Form state
  const [name, setName] = useState('');
  const [type, setType] = useState<Account['type']>('bank');
  const [openingBalance, setOpeningBalance] = useState('0');
  const [currencyCode, setCurrencyCode] = useState(defaultCurrency);
  const [isArchived, setIsArchived] = useState(false);

  // API hooks
  const { 
    data: account, 
    isLoading: isLoadingAccount 
  } = useGetAccountQuery(accountId!, { skip: !accountId });
  
  const [addAccount, { isLoading: isAdding }] = useAddAccountMutation();
  const [updateAccount, { isLoading: isUpdating }] = useUpdateAccountMutation();

  const isLoading = isAdding || isUpdating;

  // Load account data when editing
  useEffect(() => {
    if (account && isEditing) {
      setName(account.name);
      setType(account.type);
      setOpeningBalance(account.openingBalance.toString());
      setCurrencyCode(account.currencyCode);
      setIsArchived(account.isArchived);
    }
  }, [account, isEditing]);

  const handleSubmit = async () => {
    // Validation
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Please enter an account name');
      return;
    }

    const balance = parseFloat(openingBalance) || 0;

    try {
      const accountData: Partial<Account> = {
        name: name.trim(),
        type,
        openingBalance: balance,
        currencyCode,
        isArchived,
      };

      if (isEditing && accountId) {
        await updateAccount({ id: accountId, ...accountData }).unwrap();
        Alert.alert('Success', 'Account updated successfully', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        await addAccount({
          ...accountData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }).unwrap();
        Alert.alert('Success', 'Account created successfully', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error) {
      Alert.alert('Error', `Failed to ${isEditing ? 'update' : 'create'} account. Please try again.`);
    }
  };

  const handleTypeSelect = (selectedType: Account['type']) => {
    Alert.alert(
      'Account Type',
      'Select the type of account',
      [
        { text: 'Cancel', style: 'cancel' },
        ...ACCOUNT_TYPES.map(accountType => ({
          text: accountType.label,
          onPress: () => setType(accountType.value)
        }))
      ]
    );
  };

  if (isLoadingAccount) {
    return (
      <SafeContainer>
        <View style={styles.loadingContainer}>
          <LoadingSpinner size="large" />
          <Text style={styles.loadingText}>Loading account...</Text>
        </View>
      </SafeContainer>
    );
  }

  const selectedAccountType = ACCOUNT_TYPES.find(t => t.value === type);

  return (
    <SafeContainer>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {isEditing ? 'Edit Account' : 'Add New Account'}
          </Text>
          <Text style={styles.subtitle}>
            {isEditing 
              ? 'Update your account information'
              : 'Enter details for your new account'
            }
          </Text>
        </View>

        <Card style={styles.formCard}>
          {/* Account Name */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Account Name *</Text>
            <TextInput
              style={styles.textInput}
              value={name}
              onChangeText={setName}
              placeholder="e.g. Main Checking Account"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="words"
            />
          </View>

          {/* Account Type */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Account Type</Text>
            <TouchableOpacity style={styles.selectInput} onPress={handleTypeSelect}>
              <View style={styles.selectContent}>
                <Icon 
                  name={selectedAccountType?.icon || 'ellipse-outline'} 
                  size={20} 
                  color="#6366F1" 
                />
                <Text style={styles.selectText}>
                  {selectedAccountType?.label || 'Select type'}
                </Text>
              </View>
              <Icon name="chevron-down" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          {/* Opening Balance */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Opening Balance</Text>
            <View style={styles.balanceContainer}>
              <Text style={styles.currencySymbol}>{currencyCode}</Text>
              <TextInput
                style={styles.balanceInput}
                value={openingBalance}
                onChangeText={setOpeningBalance}
                placeholder="0.00"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
              />
            </View>
            <Text style={styles.fieldHint}>
              Enter the current balance of this account
            </Text>
          </View>

          {/* Archive Toggle (only for editing) */}
          {isEditing && (
            <View style={styles.fieldContainer}>
              <TouchableOpacity 
                style={styles.toggleContainer}
                onPress={() => setIsArchived(!isArchived)}
              >
                <View style={styles.toggleInfo}>
                  <Text style={styles.fieldLabel}>Archive Account</Text>
                  <Text style={styles.fieldHint}>
                    Archived accounts won't appear in transaction forms
                  </Text>
                </View>
                <View style={[
                  styles.toggle,
                  isArchived && styles.toggleActive
                ]}>
                  {isArchived && <View style={styles.toggleThumb} />}
                </View>
              </TouchableOpacity>
            </View>
          )}
        </Card>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <LoadingSpinner size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>
                {isEditing ? 'Update Account' : 'Create Account'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.base,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  formCard: {
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.base,
    padding: Spacing.base,
  },
  fieldContainer: {
    marginBottom: 24,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  fieldHint: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
  selectInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
  },
  selectContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectText: {
    fontSize: 16,
    color: '#111827',
  },
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366F1',
    paddingLeft: 12,
  },
  balanceInput: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111827',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleInfo: {
    flex: 1,
  },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: '#6366F1',
    alignItems: 'flex-end',
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  actionContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.xl,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  submitButton: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 8,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});