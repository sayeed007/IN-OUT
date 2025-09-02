// src/components/modals/AccountCreationModal.tsx
import React, { useState } from 'react';
import {
  Alert,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAddAccountMutation } from '../../state/api';
import type { Account } from '../../types/global';

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
  const [accountName, setAccountName] = useState('');
  const [accountType, setAccountType] = useState<'cash' | 'bank' | 'wallet' | 'card' | 'other'>('bank');
  const [isCreating, setIsCreating] = useState(false);
  const [addAccount] = useAddAccountMutation();

  const resetForm = () => {
    setAccountName('');
    setAccountType('bank');
    setIsCreating(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleCreateAccount = async () => {
    if (!accountName.trim()) {
      Alert.alert('Error', 'Please enter an account name');
      return;
    }

    setIsCreating(true);
    try {
      const newAccount = await addAccount({
        name: accountName.trim(),
        type: accountType,
        openingBalance: 0,
        currencyCode: 'USD',
        isArchived: false,
      }).unwrap();

      onAccountCreated(newAccount);
      resetForm();
      onClose();
      Alert.alert('Success', 'Account created successfully!');
    } catch (error) {
      console.error('Failed to create account:', error);
      Alert.alert('Error', 'Failed to create account. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const getAccountTypeIcon = (type: typeof accountType) => {
    switch (type) {
      case 'bank': return 'card-outline';
      case 'cash': return 'wallet-outline';
      case 'wallet': return 'phone-portrait-outline';
      case 'card': return 'card-outline';
      default: return 'ellipse-outline';
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleClose}
            style={styles.closeButton}
          >
            <Text style={styles.closeText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Add Account</Text>
          <TouchableOpacity
            onPress={handleCreateAccount}
            style={[styles.saveButton, isCreating && styles.saveButtonDisabled]}
            disabled={isCreating}
          >
            <Text style={[styles.saveText, isCreating && styles.saveTextDisabled]}>
              {isCreating ? 'Creating...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.content}>
          <View style={styles.field}>
            <Text style={styles.label}>Account Name</Text>
            <TextInput
              style={styles.input}
              value={accountName}
              onChangeText={setAccountName}
              placeholder="Enter account name"
              autoFocus
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Account Type</Text>
            <View style={styles.typeSelector}>
              {(['bank', 'cash', 'wallet', 'card', 'other'] as const).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeButton,
                    accountType === type && styles.typeButtonActive
                  ]}
                  onPress={() => setAccountType(type)}
                >
                  <Icon
                    name={getAccountTypeIcon(type)}
                    size={20}
                    color={accountType === type ? '#FFFFFF' : '#6366F1'}
                    style={styles.typeIcon}
                  />
                  <Text style={[
                    styles.typeButtonText,
                    accountType === type && styles.typeButtonTextActive
                  ]}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  closeText: {
    fontSize: 16,
    color: '#6B7280',
  },
  saveButton: {
    padding: 4,
  },
  saveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366F1',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveTextDisabled: {
    color: '#9CA3AF',
  },
  content: {
    padding: 20,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    minWidth: 90,
  },
  typeButtonActive: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  typeIcon: {
    marginRight: 8,
  },
  typeButtonText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  typeButtonTextActive: {
    color: '#FFFFFF',
  },
});