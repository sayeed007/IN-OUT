// src/components/modals/AccountCreationModal.tsx
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeContainer } from '../layout/SafeContainer';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux';
import { useTheme } from '../../app/providers/ThemeProvider';
import { ACCOUNT_TYPES } from '../../constants/accountTypes';
import { useAddAccountMutation } from '../../state/api';
import { RootState } from '../../state/store';
import type { Account } from '../../types/global';
import Card from '../ui/Card';
import LoadingSpinner from '../ui/LoadingSpinner';
import { showToast } from '../../utils/helpers/toast';

interface AccountCreationModalProps {
  visible: boolean;
  onClose: () => void;
  onAccountCreated: (account: Account) => void;
}

export const AccountCreationModal: React.FC<AccountCreationModalProps> = ({
  visible,
  onClose,
  onAccountCreated,
}) => {
  const { theme } = useTheme();
  const defaultCurrency = useSelector((state: RootState) => state.preferences.currencyCode);

  const [accountName, setAccountName] = useState('');
  const [accountType, setAccountType] = useState<Account['type']>('bank');
  const [openingBalance, setOpeningBalance] = useState('0');
  const [isCreating, setIsCreating] = useState(false);
  const [addAccount] = useAddAccountMutation();

  const resetForm = () => {
    setAccountName('');
    setAccountType('bank');
    setOpeningBalance('0');
    setIsCreating(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleCreateAccount = async () => {
    if (!accountName.trim()) {
      showToast.error('Please enter an account name');
      return;
    }

    setIsCreating(true);
    try {
      const balance = parseFloat(openingBalance) || 0;
      const newAccount = await addAccount({
        name: accountName.trim(),
        type: accountType,
        openingBalance: balance,
        currencyCode: defaultCurrency,
        isArchived: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }).unwrap();

      onAccountCreated(newAccount);
      resetForm();
      onClose();
      showToast.success('Account created successfully!');
    } catch (error) {
      console.error('Failed to create account:', error);
      showToast.error('Failed to create account. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const getAccountTypeColor = (type: Account['type']) => {
    switch (type) {
      case 'bank': return theme.colors.primary[500];
      case 'cash': return theme.colors.success[500];
      case 'card': return theme.colors.info[500];
      case 'wallet': return theme.colors.secondary[500];
      default: return theme.colors.neutral[500];
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    title: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
    },
    headerButton: {
      padding: 4,
      minWidth: 60,
    },
    cancelText: {
      fontSize: 16,
      color: theme.colors.textSecondary,
    },
    saveText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.primary[500],
      textAlign: 'right',
    },
    saveTextDisabled: {
      color: theme.colors.textTertiary,
    },
    scrollContent: {
      flexGrow: 1,
      padding: 20,
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
    inputFocused: {
      borderColor: theme.colors.primary[500],
      borderWidth: 2,
    },
    placeholder: {
      color: theme.colors.textSecondary,
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
      borderColor: getAccountTypeColor(accountType),
      backgroundColor: `${getAccountTypeColor(accountType)}10`,
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
      backgroundColor: getAccountTypeColor(accountType),
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
    flex: {
      flex: 1,
    },
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeContainer style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.headerButton}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Add Account</Text>
          <TouchableOpacity
            onPress={handleCreateAccount}
            style={styles.headerButton}
            disabled={isCreating}
          >
            {isCreating ? (
              <LoadingSpinner size="small" color={theme.colors.primary[500]} />
            ) : (
              <Text style={[styles.saveText, isCreating && styles.saveTextDisabled]}>
                Save
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Account Name */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Account Name</Text>
              <Card style={styles.inputCard}>
                <TextInput
                  style={styles.textInput}
                  value={accountName}
                  onChangeText={setAccountName}
                  placeholder="e.g. Main Checking Account"
                  placeholderTextColor={theme.colors.textSecondary}
                  autoCapitalize="words"
                  autoFocus
                />
              </Card>
            </View>

            {/* Account Type */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Account Type</Text>
              <View style={styles.typeSelector}>
                {ACCOUNT_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    style={[
                      styles.typeButton,
                      accountType === type.value && styles.typeButtonActive
                    ]}
                    onPress={() => setAccountType(type.value)}
                    activeOpacity={0.7}
                  >
                    <View style={[
                      styles.typeIconContainer,
                      accountType === type.value && styles.typeIconContainerActive
                    ]}>
                      <Icon
                        name={type.icon}
                        size={20}
                        color={accountType === type.value ? theme.colors.surface : getAccountTypeColor(type.value)}
                      />
                    </View>
                    <View style={styles.typeContent}>
                      <Text style={styles.typeName}>{type.label}</Text>
                      <Text style={styles.typeDescription}>
                        {type.description}
                      </Text>
                    </View>
                    {accountType === type.value && (
                      <Icon name="checkmark-circle" size={24} color={getAccountTypeColor(type.value)} />
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
                  <Text style={styles.currencyCode}>{defaultCurrency}</Text>
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
          </ScrollView>

        </KeyboardAvoidingView>
      </SafeContainer>
    </Modal>
  );
};