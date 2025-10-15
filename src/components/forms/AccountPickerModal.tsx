import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../app/providers/ThemeProvider';
import { formatCurrency } from '../../utils/helpers/currencyUtils';
import { getAccountTypeIcon } from '../../utils/helpers/iconUtils';
import type { Account } from '../../types/global';

const ITEM_HEIGHT = 60;
const VISIBLE_ITEMS = 3;
const WHEEL_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

interface AccountPickerModalProps {
  visible: boolean;
  accounts: Account[];
  selectedAccountId?: string;
  onSelectAccount: (accountId: string) => void;
  onClose: () => void;
  title?: string;
}

export const AccountPickerModal: React.FC<AccountPickerModalProps> = ({
  visible,
  accounts,
  selectedAccountId,
  onSelectAccount,
  onClose,
  title = 'Select Account'
}) => {
  const { theme } = useTheme();
  const scrollRef = useRef<ScrollView>(null);

  const activeAccounts = accounts.filter(account => !account.isArchived);
  const [selectedIndex, setSelectedIndex] = useState(() => {
    const currentIndex = activeAccounts.findIndex(account => account.id === selectedAccountId);
    return currentIndex !== -1 ? currentIndex : 0;
  });

  const handleAccountScroll = (event: any) => {
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(activeAccounts.length - 1, index));

    if (clampedIndex !== selectedIndex) {
      setSelectedIndex(clampedIndex);
      const selectedAccount = activeAccounts[clampedIndex];
      if (selectedAccount) {
        onSelectAccount(selectedAccount.id);
      }
    }
  };

  const handleConfirm = () => {
    onClose();
  };

  useEffect(() => {
    const currentIndex = activeAccounts.findIndex(account => account.id === selectedAccountId);
    if (currentIndex !== -1) {
      setSelectedIndex(currentIndex);
    }
  }, [selectedAccountId, activeAccounts]);

  useEffect(() => {
    if (visible && scrollRef.current) {
      setTimeout(() => {
        scrollRef.current?.scrollTo({
          y: selectedIndex * ITEM_HEIGHT,
          animated: false
        });
      }, 100);
    }
  }, [visible, selectedIndex]);

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="slide">
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
          {/* Modal Header */}
          <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              {title}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {activeAccounts.length > 0 ? (
            <>
              {/* Wheel Picker */}
              <View style={styles.wheelContainer}>
                <View style={[
                  styles.wheelWrapper,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                  }
                ]}>
                  <ScrollView
                    ref={scrollRef}
                    style={styles.wheel}
                    contentContainerStyle={styles.wheelContent}
                    showsVerticalScrollIndicator={false}
                    snapToInterval={ITEM_HEIGHT}
                    decelerationRate="fast"
                    onMomentumScrollEnd={handleAccountScroll}
                  >
                    {activeAccounts.map((account, index) => {
                      const isSelected = selectedIndex === index;
                      return (
                        <View key={account.id} style={styles.wheelItem}>
                          <View style={styles.wheelItemContent}>
                            <Icon
                              name={getAccountTypeIcon(account.type)}
                              size={isSelected ? 20 : 16}
                              color={isSelected ? theme.colors.primary[500] : theme.colors.textSecondary}
                              style={styles.wheelItemIcon}
                            />
                            <View style={styles.wheelItemInfo}>
                              <Text style={StyleSheet.flatten([
                                styles.wheelItemName,
                                {
                                  color: isSelected ? theme.colors.text : theme.colors.textSecondary,
                                  fontWeight: isSelected ? '600' : '400',
                                  fontSize: isSelected ? 16 : 14,
                                }
                              ])}>
                                {account.name}
                              </Text>
                              <Text style={StyleSheet.flatten([
                                styles.wheelItemBalance,
                                {
                                  color: isSelected ? theme.colors.textSecondary : theme.colors.textTertiary,
                                  fontSize: isSelected ? 13 : 11,
                                }
                              ])}>
                                {formatCurrency(account.openingBalance, account.currencyCode)}
                              </Text>
                            </View>
                          </View>
                        </View>
                      );
                    })}
                  </ScrollView>
                  {/* Selection overlay */}
                  <View style={[
                    styles.selectionOverlay,
                    {
                      borderColor: theme.colors.primary[500],
                      backgroundColor: `${theme.colors.primary[500]}10`,
                    }
                  ]} />
                </View>
              </View>

              {/* Action Buttons */}
              <View style={[styles.actions, { borderTopColor: theme.colors.border }]}>
                <TouchableOpacity
                  style={[
                    styles.cancelButton,
                    {
                      borderColor: theme.colors.border,
                      backgroundColor: theme.colors.surface,
                    }
                  ]}
                  onPress={onClose}
                >
                  <Text style={[styles.cancelButtonText, { color: theme.colors.textSecondary }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.confirmButton,
                    { backgroundColor: theme.colors.primary[500] }
                  ]}
                  onPress={handleConfirm}
                >
                  <Text style={[styles.confirmButtonText, { color: theme.colors.onPrimary }]}>
                    Confirm
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <View style={styles.emptyState}>
              <Icon name="wallet-outline" size={48} color={theme.colors.textTertiary} />
              <Text style={[styles.emptyStateTitle, { color: theme.colors.text }]}>
                No accounts found
              </Text>
              <Text style={[styles.emptyStateSubtitle, { color: theme.colors.textSecondary }]}>
                Add an account in settings to get started
              </Text>
            </View>
          )}
        </View>
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
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '70%',
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
  wheelContainer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: 'center',
  },
  wheelWrapper: {
    height: WHEEL_HEIGHT,
    width: '100%',
    maxWidth: 320,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
  },
  wheel: {
    flex: 1,
  },
  wheelContent: {
    paddingVertical: ITEM_HEIGHT * 1,
  },
  wheelItem: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  wheelItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  wheelItemIcon: {
    marginRight: 12,
  },
  wheelItemInfo: {
    flex: 1,
  },
  wheelItemName: {
    textAlign: 'center',
  },
  wheelItemBalance: {
    textAlign: 'center',
    marginTop: 2,
  },
  selectionOverlay: {
    position: 'absolute',
    top: ITEM_HEIGHT * 1,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    borderTopWidth: 2,
    borderBottomWidth: 2,
    pointerEvents: 'none',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 24,
    borderTopWidth: 1,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
});

export default AccountPickerModal;
