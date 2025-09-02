import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { formatCurrency } from '../../utils/helpers/currencyUtils';
import type { Account } from '../../types/global';

interface AccountSelectorProps {
  accounts: Account[];
  selectedAccountId?: string;
  onSelectAccount: (accountId: string) => void;
  placeholder?: string;
  compact?: boolean;
  floatingLabel?: boolean;
  label?: string;
  onQuickAdd?: () => void;
}

export const AccountSelector: React.FC<AccountSelectorProps> = ({
  accounts,
  selectedAccountId,
  onSelectAccount,
  placeholder = "Select an account",
  compact = false,
  floatingLabel = false,
  label,
  onQuickAdd
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const labelAnimation = useRef(new Animated.Value(0)).current;

  const selectedAccount = accounts.find(account => account.id === selectedAccountId);
  const activeAccounts = accounts.filter(account => !account.isArchived);

  const getAccountTypeIcon = (type: Account['type']) => {
    switch (type) {
      case 'bank': return 'card-outline';
      case 'cash': return 'wallet-outline';
      case 'card': return 'card-outline';
      case 'wallet': return 'phone-portrait-outline';
      default: return 'ellipse-outline';
    }
  };

  const handleSelectAccount = (accountId: string) => {
    onSelectAccount(accountId);
    setIsModalVisible(false);
  };

  const hasValue = !!selectedAccount;
  const displayLabel = label || placeholder;

  useEffect(() => {
    if (floatingLabel) {
      Animated.timing(labelAnimation, {
        toValue: hasValue ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  }, [hasValue, floatingLabel, labelAnimation]);

  const labelStyle = {
    fontSize: labelAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [14, 12],
    }),
    color: labelAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: ['#9CA3AF', '#6366F1'],
    }),
  };

  return (
    <View style={[styles.container, compact && styles.compactContainer]}>
      {floatingLabel && (
        <View style={styles.labelContainer}>
          <Animated.Text style={[
            styles.floatingLabel,
            labelStyle
          ]}>
            {displayLabel}
          </Animated.Text>
          {onQuickAdd && (
            <TouchableOpacity
              style={styles.quickAddButton}
              onPress={onQuickAdd}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Icon name="add-circle-outline" size={20} color="#6366F1" />
            </TouchableOpacity>
          )}
        </View>
      )}
      <TouchableOpacity
        style={[
          styles.selector,
          compact && styles.compactSelector,
          floatingLabel && styles.floatingSelector
        ]}
        onPress={() => setIsModalVisible(true)}
      >
        {selectedAccount ? (
          <View style={styles.selectedAccount}>
            <Icon
              name={getAccountTypeIcon(selectedAccount.type)}
              size={20}
              color="#6366F1"
              style={styles.accountIcon}
            />
            <View style={styles.accountInfo}>
              <Text style={styles.accountName}>{selectedAccount.name}</Text>
              <Text style={styles.accountBalance}>
                {formatCurrency(selectedAccount.openingBalance, selectedAccount.currencyCode)}
              </Text>
            </View>
          </View>
        ) : (
          <Text style={[
            styles.placeholder,
            floatingLabel && styles.floatingPlaceholder
          ]}>
            {floatingLabel ? '' : placeholder}
          </Text>
        )}
        <View style={styles.rightContent}>
          {!floatingLabel && onQuickAdd && (
            <TouchableOpacity
              style={styles.quickAddButtonInline}
              onPress={onQuickAdd}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Icon name="add-circle-outline" size={18} color="#6366F1" />
            </TouchableOpacity>
          )}
          <Icon name="chevron-down" size={20} color="#9CA3AF" />
        </View>
      </TouchableOpacity>

      {isModalVisible &&
        <Modal
          visible={isModalVisible}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setIsModalVisible(false)}
        >
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Account</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIsModalVisible(false)}
              >
                <Icon name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.accountList}>
              {activeAccounts.length > 0 ? (
                activeAccounts.map((account) => (
                  <TouchableOpacity
                    key={account.id}
                    style={[
                      styles.accountItem,
                      selectedAccountId === account.id && styles.selectedAccountItem
                    ]}
                    onPress={() => handleSelectAccount(account.id)}
                  >
                    <View style={styles.accountItemContent}>
                      <Icon
                        name={getAccountTypeIcon(account.type)}
                        size={24}
                        color="#6366F1"
                        style={styles.accountItemIcon}
                      />
                      <View style={styles.accountItemInfo}>
                        <Text style={styles.accountItemName}>{account.name}</Text>
                        <Text style={styles.accountItemType}>
                          {account.type.charAt(0).toUpperCase() + account.type.slice(1)}
                        </Text>
                      </View>
                      <Text style={styles.accountItemBalance}>
                        {formatCurrency(account.openingBalance, account.currencyCode)}
                      </Text>
                    </View>
                    {selectedAccountId === account.id && (
                      <Icon name="checkmark" size={20} color="#10B981" />
                    )}
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Icon name="wallet-outline" size={48} color="#9CA3AF" />
                  <Text style={styles.emptyStateTitle}>No accounts found</Text>
                  <Text style={styles.emptyStateSubtitle}>
                    Add an account in settings to get started
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </Modal>
      }

    </View >
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  compactContainer: {
    marginBottom: 12,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  floatingLabel: {
    fontWeight: '500',
  },
  quickAddButton: {
    padding: 2,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    minHeight: 48,
  },
  compactSelector: {
    paddingVertical: 10,
    minHeight: 44,
  },
  floatingSelector: {
    borderColor: '#6366F1',
    borderWidth: 1.5,
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quickAddButtonInline: {
    padding: 2,
  },
  selectedAccount: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  accountIcon: {
    marginRight: 12,
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  accountBalance: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  placeholder: {
    fontSize: 16,
    color: '#9CA3AF',
    flex: 1,
  },
  floatingPlaceholder: {
    color: 'transparent',
  },
  modal: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  accountList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  selectedAccountItem: {
    backgroundColor: '#F0FDF4',
  },
  accountItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  accountItemIcon: {
    marginRight: 12,
  },
  accountItemInfo: {
    flex: 1,
  },
  accountItemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  accountItemType: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  accountItemBalance: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginRight: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
  },
});

export default AccountSelector;
