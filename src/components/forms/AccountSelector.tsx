import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { formatCurrency } from '../../utils/helpers/currencyUtils';
import { getAccountTypeIcon } from '../../utils/helpers/iconUtils';
import type { Account } from '../../types/global';
import { AccountPickerModal } from './AccountPickerModal';

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
        <AccountPickerModal
          visible={isModalVisible}
          accounts={accounts}
          selectedAccountId={selectedAccountId}
          onSelectAccount={onSelectAccount}
          onClose={() => setIsModalVisible(false)}
          title="Select Account"
        />
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
});

export default AccountSelector;
