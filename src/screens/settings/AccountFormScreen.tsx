// src/screens/settings/AccountFormScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
import Card from '../../components/ui/Card';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useTheme } from '../../app/providers/ThemeProvider';
import { GradientHeader } from '../../components/ui/GradientHeader';
import { ACCOUNT_TYPES } from '../../constants/accountTypes';
import {
  useGetAccountQuery,
  useAddAccountMutation,
  useUpdateAccountMutation
} from '../../state/api';
import { RootState } from '../../state/store';
import type { Account } from '../../types/global';
import type { SettingsStackParamList } from '../../app/navigation/types';
import BottomSpacing from '../../components/ui/BottomSpacing';
import { showToast } from '../../utils/helpers/toast';

type AccountFormRouteProp = RouteProp<SettingsStackParamList, 'AccountForm'>;

export const AccountFormScreen: React.FC = () => {
  const { theme } = useTheme();
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

  const getAccountTypeColor = (accountType: Account['type']) => {
    switch (accountType) {
      case 'bank': return theme.colors.primary[500];
      case 'cash': return theme.colors.success[500];
      case 'card': return theme.colors.info[500];
      case 'wallet': return theme.colors.secondary[500];
      default: return theme.colors.neutral[500];
    }
  };

  const styles = StyleSheet.create({
    keyboardAvoidingViewStyle: {
      flex: 1,
    },
    container: {
      flex: 1,
      backgroundColor: '#f8fafc',
    },
    content: {
      flex: 1,
      backgroundColor: '#f8fafc',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: 16,
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: 12,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 12,
    },
    inputCard: {
      padding: 16,
    },
    textInput: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 16,
      color: theme.colors.text,
      backgroundColor: theme.colors.surface,
    },
    typeSelector: {
      gap: 12,
    },
    typeButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    typeButtonActive: {
      borderColor: getAccountTypeColor(type),
      backgroundColor: `${getAccountTypeColor(type)}10`,
    },
    typeIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
      backgroundColor: theme.colors.surfaceVariant,
    },
    typeIconContainerActive: {
      backgroundColor: getAccountTypeColor(type),
    },
    typeContent: {
      flex: 1,
    },
    typeName: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 2,
    },
    typeDescription: {
      fontSize: 13,
      color: theme.colors.textSecondary,
    },
    amountInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 12,
      backgroundColor: theme.colors.surface,
      paddingHorizontal: 16,
    },
    currencyCode: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.primary[500],
      marginRight: 8,
    },
    amountInput: {
      flex: 1,
      paddingVertical: 14,
      fontSize: 16,
      color: theme.colors.text,
      backgroundColor: 'transparent',
    },
    toggleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 8,
    },
    toggleInfo: {
      flex: 1,
    },
    toggleLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 4,
    },
    toggleHint: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    toggle: {
      width: 50,
      height: 30,
      borderRadius: 15,
      backgroundColor: theme.colors.neutral[300],
      justifyContent: 'center',
      paddingHorizontal: 2,
    },
    toggleActive: {
      backgroundColor: theme.colors.primary[500],
      alignItems: 'flex-end',
    },
    toggleThumb: {
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: theme.colors.surface,
    },
    actionContainer: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      paddingBottom: 40,
      gap: 12,
    },
    cancelButton: {
      flex: 1,
      paddingVertical: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: 'center',
    },
    cancelButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.textSecondary,
    },
    submitButton: {
      flex: 2,
      paddingVertical: 16,
      borderRadius: 12,
      backgroundColor: theme.colors.primary[500],
      alignItems: 'center',
      justifyContent: 'center',
    },
    submitButtonDisabled: {
      opacity: 0.6,
    },
    submitButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.surface,
    },
  });

  const handleSubmit = async () => {
    // Validation
    if (!name.trim()) {
      showToast.error('Please enter an account name', 'Validation Error');
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
        showToast.success('Account updated successfully');
        navigation.goBack();
      } else {
        await addAccount({
          ...accountData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }).unwrap();
        showToast.success('Account created successfully');
        navigation.goBack();
      }
    } catch (error) {
      showToast.error(`Failed to ${isEditing ? 'update' : 'create'} account. Please try again.`);
    }
  };

  if (isLoadingAccount) {
    return (
      <View style={styles.container}>
        <GradientHeader
          title={isEditing ? 'Edit Account' : 'Create Account'}
          subtitle={isEditing ? 'Update account details' : 'Add a new account'}
          showBackButton={true}
          onBackPress={() => navigation.goBack()}
        />
        <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
          <LoadingSpinner size="large" />
          <Text style={styles.loadingText}>Loading account...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <GradientHeader
        title={isEditing ? 'Edit Account' : 'Create Account'}
        subtitle={isEditing ? 'Update account details' : 'Add a new account'}
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingViewStyle}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >

          {/* Account Name */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account Name</Text>
            <Card style={styles.inputCard}>
              <TextInput
                style={styles.textInput}
                value={name}
                onChangeText={setName}
                placeholder="e.g. Main Checking Account"
                placeholderTextColor={theme.colors.textSecondary}
                autoCapitalize="words"
              />
            </Card>
          </View>

          {/* Account Type */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account Type</Text>
            <View style={styles.typeSelector}>
              {ACCOUNT_TYPES.map((accountType) => (
                <TouchableOpacity
                  key={accountType.value}
                  style={[
                    styles.typeButton,
                    type === accountType.value && styles.typeButtonActive
                  ]}
                  onPress={() => setType(accountType.value)}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.typeIconContainer,
                    type === accountType.value && styles.typeIconContainerActive
                  ]}>
                    <Icon
                      name={accountType.icon}
                      size={20}
                      color={type === accountType.value ? theme.colors.surface : getAccountTypeColor(accountType.value)}
                    />
                  </View>
                  <View style={styles.typeContent}>
                    <Text style={styles.typeName}>{accountType.label}</Text>
                    <Text style={styles.typeDescription}>
                      {accountType.description}
                    </Text>
                  </View>
                  {type === accountType.value && (
                    <Icon name="checkmark-circle" size={24} color={getAccountTypeColor(accountType.value)} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Opening Balance */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Opening Balance</Text>
            <Card style={styles.inputCard}>
              <View style={styles.amountInputContainer}>
                <Text style={styles.currencyCode}>{currencyCode}</Text>
                <TextInput
                  style={styles.amountInput}
                  value={openingBalance}
                  onChangeText={setOpeningBalance}
                  placeholder="0.00"
                  placeholderTextColor={theme.colors.textSecondary}
                  keyboardType="numeric"
                  returnKeyType="done"
                />
              </View>
            </Card>
          </View>

          {/* Archive Toggle (only for editing) */}
          {isEditing && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Archive Account</Text>
              <Card style={styles.inputCard}>
                <TouchableOpacity
                  style={styles.toggleContainer}
                  onPress={() => setIsArchived(!isArchived)}
                >
                  <View style={styles.toggleInfo}>
                    <Text style={styles.toggleLabel}>Archive Account</Text>
                    <Text style={styles.toggleHint}>
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
              </Card>
            </View>
          )}

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
                <LoadingSpinner size="small" color={theme.colors.surface} />
              ) : (
                <Text style={styles.submitButtonText}>
                  {isEditing ? 'Update Account' : 'Create Account'}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Bottom spacing for tab bar */}
          <BottomSpacing />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};