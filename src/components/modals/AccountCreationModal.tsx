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
import Icon from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux';
import { useTheme } from '../../app/providers/ThemeProvider';
import { ACCOUNT_TYPES } from '../../constants/accountTypes';
import { useAddAccountMutation } from '../../state/api';
import { RootState } from '../../state/store';
import type { Account } from '../../types/global';
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

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleClose}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoid}
        >
          <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>

            {/* Modal Header */}
            <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                Add Account
              </Text>
              <TouchableOpacity onPress={handleClose} disabled={isCreating}>
                <Icon name="close" size={24} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Account Name */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Account Name
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                    color: theme.colors.text,
                  }
                ]}
                value={accountName}
                onChangeText={setAccountName}
                placeholder="e.g. Main Checking Account"
                placeholderTextColor={theme.colors.textSecondary}
                autoCapitalize="words"
                autoFocus
              />
            </View>

            <ScrollView
              style={styles.scrollContainer}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Account Type */}
              <View>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                  Account Type
                </Text>
                <View style={styles.typeSelector}>
                  {ACCOUNT_TYPES.map((type) => {
                    const isSelected = accountType === type.value;
                    const typeColor = getAccountTypeColor(type.value);

                    return (
                      <TouchableOpacity
                        key={type.value}
                        style={[
                          styles.typeButton,
                          {
                            backgroundColor: isSelected
                              ? `${typeColor}15`
                              : theme.colors.surface,
                            borderColor: isSelected ? typeColor : theme.colors.border,
                          }
                        ]}
                        onPress={() => setAccountType(type.value)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.typeButtonLeft}>
                          <View style={[styles.radioButton, { borderColor: isSelected ? typeColor : theme.colors.border }]}>
                            {isSelected && (
                              <View style={[styles.radioButtonInner, { backgroundColor: typeColor }]} />
                            )}
                          </View>
                          <View style={styles.typeInfo}>
                            <Text style={[styles.typeName, { color: theme.colors.text }]}>
                              {type.label}
                            </Text>
                            <Text style={[styles.typeDescription, { color: theme.colors.textSecondary }]}>
                              {type.description}
                            </Text>
                          </View>
                        </View>
                        <Icon name={type.icon} size={20} color={typeColor} />
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </ScrollView>

            {/* Opening Balance */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Opening Balance
              </Text>
              <View style={[
                styles.amountInputContainer,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                }
              ]}>
                <Text style={[styles.currencyCode, { color: theme.colors.primary[500] }]}>
                  {defaultCurrency}
                </Text>
                <TextInput
                  style={[styles.amountInput, { color: theme.colors.text }]}
                  value={openingBalance}
                  onChangeText={setOpeningBalance}
                  placeholder="0.00"
                  placeholderTextColor={theme.colors.textSecondary}
                  keyboardType="numeric"
                  returnKeyType="done"
                />
              </View>
            </View>

            {/* Create Button */}
            <TouchableOpacity
              style={[
                styles.createButton,
                { backgroundColor: theme.colors.primary[500] },
                isCreating && styles.createButtonDisabled
              ]}
              onPress={handleCreateAccount}
              disabled={isCreating}
              activeOpacity={0.8}
            >
              {isCreating ? (
                <LoadingSpinner size="small" color={theme.colors.onPrimary} />
              ) : (
                <Text style={[styles.createButtonText, { color: theme.colors.onPrimary }]}>
                  Create Account
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  keyboardAvoid: {
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '95%'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  section: {
    marginVertical: 8,
    marginHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  typeSelector: {
    gap: 12,
  },
  typeButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  typeButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  typeInfo: {
    flex: 1,
  },
  typeName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  typeDescription: {
    fontSize: 13,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  currencyCode: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
  },
  createButton: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginVertical: 12,
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
