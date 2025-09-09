// src/components/modals/CurrencySelectionModal.tsx
import React from 'react';
import {
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../app/providers/ThemeProvider';
import { getSupportedCurrencies } from '../../utils/helpers/currencyUtils';
import Card from '../ui/Card';

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
    closeButton: {
      padding: 4,
      minWidth: 60,
    },
    closeText: {
      fontSize: 16,
      color: theme.colors.textSecondary,
    },
    scrollContent: {
      flexGrow: 1,
      padding: 20,
    },
    description: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: 24,
      lineHeight: 20,
    },
    currencyCard: {
      padding: 16,
      marginBottom: 12,
    },
    currencyItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    currencyInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    currencySymbol: {
      fontSize: 20,
      fontWeight: '600',
      color: theme.colors.primary[600],
      marginRight: 12,
      minWidth: 30,
    },
    currencyDetails: {
      flex: 1,
    },
    currencyName: {
      fontSize: 16,
      fontWeight: '500',
      color: theme.colors.text,
      marginBottom: 2,
    },
    currencyCode: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    selectedIndicator: {
      marginLeft: 12,
    },
    selectedCard: {
      borderWidth: 2,
      borderColor: theme.colors.primary[500],
      backgroundColor: `${theme.colors.primary[500]}08`,
    },
    scrollView: {
      flex: 1,
    },
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Select Currency</Text>
          <View style={styles.closeButton} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.description}>
            Choose your preferred currency. This will apply to new transactions and reports.
          </Text>

          {currencies.map((currency) => (
            <TouchableOpacity
              key={currency.code}
              onPress={() => handleCurrencySelect(currency.code)}
              activeOpacity={0.7}
            >
              <Card
                style={StyleSheet.flatten([
                  styles.currencyCard,
                  selectedCurrency === currency.code && styles.selectedCard
                ])}
                padding="none"
              >
                <View style={styles.currencyItem}>
                  <View style={styles.currencyInfo}>
                    <Text style={styles.currencySymbol}>{currency.symbol}</Text>
                    <View style={styles.currencyDetails}>
                      <Text style={styles.currencyName}>{currency.name}</Text>
                      <Text style={styles.currencyCode}>{currency.code}</Text>
                    </View>
                  </View>
                  {selectedCurrency === currency.code && (
                    <View style={styles.selectedIndicator}>
                      <Icon
                        name="checkmark-circle"
                        size={24}
                        color={theme.colors.primary[500]}
                      />
                    </View>
                  )}
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};