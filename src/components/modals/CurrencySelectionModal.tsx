// src/components/modals/CurrencySelectionModal.tsx
import React from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../app/providers/ThemeProvider';
import { getSupportedCurrencies } from '../../utils/helpers/currencyUtils';

interface CurrencySelectionModalProps {
  visible: boolean;
  onClose: () => void;
  selectedCurrency: string;
  onCurrencySelect: (currencyCode: string) => void;
}

export const CurrencySelectionModal: React.FC<CurrencySelectionModalProps> = ({
  visible,
  onClose,
  selectedCurrency,
  onCurrencySelect,
}) => {
  const { theme } = useTheme();
  const currencies = getSupportedCurrencies();

  const handleCurrencySelect = (currencyCode: string) => {
    onCurrencySelect(currencyCode);
    onClose();
  };

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
              Select Currency
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Currency List */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {currencies.map((currency) => (
              <TouchableOpacity
                key={currency.code}
                onPress={() => handleCurrencySelect(currency.code)}
                activeOpacity={0.7}
                style={[
                  styles.currencyItem,
                  {
                    backgroundColor: selectedCurrency === currency.code
                      ? `${theme.colors.primary[500]}10`
                      : theme.colors.surface,
                    borderColor: selectedCurrency === currency.code
                      ? theme.colors.primary[500]
                      : theme.colors.border,
                  }
                ]}
              >
                <View style={styles.currencyInfo}>
                  <Text style={[styles.currencySymbol, { color: theme.colors.primary[600] }]}>
                    {currency.symbol}
                  </Text>
                  <View style={styles.currencyDetails}>
                    <Text style={[styles.currencyName, { color: theme.colors.text }]}>
                      {currency.name}
                    </Text>
                    <Text style={[styles.currencyCode, { color: theme.colors.textSecondary }]}>
                      {currency.code}
                    </Text>
                  </View>
                </View>
                {selectedCurrency === currency.code && (
                  <Icon
                    name="checkmark-circle"
                    size={24}
                    color={theme.colors.primary[500]}
                  />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
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
    height: '80%',
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  currencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 2,
  },
  currencyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: '600',
    marginRight: 12,
    minWidth: 30,
  },
  currencyDetails: {
    flex: 1,
  },
  currencyName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  currencyCode: {
    fontSize: 14,
  },
});
