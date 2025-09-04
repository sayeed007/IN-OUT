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
import { formatCurrency } from '../../utils/helpers/currencyUtils';
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
  const scrollRef = useRef<ScrollView>(null);

  const activeAccounts = accounts.filter(account => !account.isArchived);
  const [selectedIndex, setSelectedIndex] = useState(() => {
    const currentIndex = activeAccounts.findIndex(account => account.id === selectedAccountId);
    return currentIndex !== -1 ? currentIndex : 0;
  });

  const getAccountTypeIcon = (type: Account['type']) => {
    switch (type) {
      case 'bank': return 'card-outline';
      case 'cash': return 'wallet-outline';
      case 'card': return 'card-outline';
      case 'wallet': return 'phone-portrait-outline';
      default: return 'ellipse-outline';
    }
  };

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
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {activeAccounts.length > 0 ? (
            <>
              {/* Selected Display */}
              {/* <View style={styles.selectedDisplay}>
                <Text style={styles.selectedLabel}>Selected:</Text>
                <View style={styles.selectedAccountDisplay}>
                  {activeAccounts[selectedIndex] && (
                    <>
                      <Icon
                        name={getAccountTypeIcon(activeAccounts[selectedIndex].type)}
                        size={18}
                        color="#6366F1"
                        style={styles.selectedAccountIcon}
                      />
                      <View style={styles.selectedAccountInfo}>
                        <Text style={styles.selectedAccountName}>
                          {activeAccounts[selectedIndex].name}
                        </Text>
                        <Text style={styles.selectedAccountBalance}>
                          {formatCurrency(activeAccounts[selectedIndex].openingBalance, activeAccounts[selectedIndex].currencyCode)}
                        </Text>
                      </View>
                    </>
                  )}
                </View>
              </View> */}

              {/* Wheel Picker */}
              <View style={styles.wheelContainer}>
                <View style={styles.wheelWrapper}>
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
                              size={isSelected ? 18 : 14}
                              color={isSelected ? "#6366F1" : "#9CA3AF"}
                              style={styles.wheelItemIcon}
                            />
                            <View style={styles.wheelItemInfo}>
                              <Text style={[
                                styles.wheelItemName,
                                isSelected ? styles.wheelItemNameSelected : styles.wheelItemNameUnselected
                              ]}>
                                {account.name}
                              </Text>
                              <Text style={[
                                styles.wheelItemBalance,
                                isSelected ? styles.wheelItemBalanceSelected : styles.wheelItemBalanceUnselected
                              ]}>
                                {formatCurrency(account.openingBalance, account.currencyCode)}
                              </Text>
                            </View>
                          </View>
                        </View>
                      );
                    })}
                  </ScrollView>
                  {/* Selection overlay */}
                  <View style={styles.selectionOverlay} />
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={onClose}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={handleConfirm}
                >
                  <Text style={styles.confirmButtonText}>Confirm</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <View style={styles.emptyState}>
              <Icon name="wallet-outline" size={32} color="#9CA3AF" />
              <Text style={styles.emptyStateTitle}>No accounts found</Text>
              <Text style={styles.emptyStateSubtitle}>
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
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  container: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  selectedDisplay: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: '#F9FAFB',
  },
  selectedLabel: {
    fontSize: 10,
    color: '#6B7280',
    marginBottom: 6,
  },
  selectedAccountDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedAccountIcon: {
    marginRight: 8,
  },
  selectedAccountInfo: {
    alignItems: 'center',
  },
  selectedAccountName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  selectedAccountBalance: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  wheelContainer: {
    paddingHorizontal: 30,
    paddingVertical: 16,
    alignItems: 'center',
  },
  wheelWrapper: {
    height: WHEEL_HEIGHT,
    width: 240,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
    paddingHorizontal: 12,
  },
  wheelItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  wheelItemIcon: {
    marginRight: 8,
  },
  wheelItemInfo: {
    flex: 1,
  },
  wheelItemName: {
    textAlign: 'center',
  },
  wheelItemNameSelected: {
    color: '#111827',
    fontWeight: '600',
    fontSize: 14,
  },
  wheelItemNameUnselected: {
    color: '#6B7280',
    fontWeight: '400',
    fontSize: 12,
  },
  wheelItemBalance: {
    textAlign: 'center',
    marginTop: 2,
  },
  wheelItemBalanceSelected: {
    color: '#6B7280',
    fontSize: 12,
  },
  wheelItemBalanceUnselected: {
    color: '#9CA3AF',
    fontSize: 10,
  },
  selectionOverlay: {
    position: 'absolute',
    top: ITEM_HEIGHT * 1,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#6366F1',
    backgroundColor: 'rgba(99, 102, 241, 0.05)',
    pointerEvents: 'none',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: 'transparent',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366F1',
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginTop: 12,
  },
  emptyStateSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
  },
});

export default AccountPickerModal;