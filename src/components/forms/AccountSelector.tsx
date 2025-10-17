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
import { useTheme } from '../../app/providers/ThemeProvider';

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
  const { theme } = useTheme();

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
      outputRange: [theme.colors.textSecondary, theme.colors.primary[500]],
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
              <Icon name="add-circle-outline" size={20} color={theme.colors.primary[500]} />
            </TouchableOpacity>
          )}
        </View>
      )}
      <TouchableOpacity
        style={[
          styles.selector,
          {
            borderColor: floatingLabel ? theme.colors.primary[500] : theme.colors.border,
            backgroundColor: theme.colors.surface
          },
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
              color={theme.colors.primary[500]}
              style={styles.accountIcon}
            />
            <View style={styles.accountInfo}>
              <Text style={[styles.accountName, { color: theme.colors.text }]}>{selectedAccount.name}</Text>
              <Text style={[styles.accountBalance, { color: theme.colors.textSecondary }]}>
                {formatCurrency(selectedAccount.openingBalance, selectedAccount.currencyCode)}
              </Text>
            </View>
          </View>
        ) : (
          <Text style={[
            styles.placeholder,
            { color: theme.colors.textSecondary },
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
              <Icon name="add-circle-outline" size={18} color={theme.colors.primary[500]} />
            </TouchableOpacity>
          )}
          <Icon name="chevron-down" size={20} color={theme.colors.textSecondary} />
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
    borderRadius: 8,
    minHeight: 48,
  },
  compactSelector: {
    paddingVertical: 10,
    minHeight: 44,
  },
  floatingSelector: {
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
  },
  accountBalance: {
    fontSize: 14,
    marginTop: 2,
  },
  placeholder: {
    fontSize: 16,
    flex: 1,
  },
  floatingPlaceholder: {
    color: 'transparent',
  },
});

export default AccountSelector;
