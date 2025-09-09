// src/components/modals/DateFormatSelectionModal.tsx
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
import Card from '../ui/Card';

interface DateFormatSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  selectedFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
  onFormatSelect: (format: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD') => void;
}

const DATE_FORMATS = [
  { value: 'MM/DD/YYYY' as const, label: 'MM/DD/YYYY', example: '12/31/2023' },
  { value: 'DD/MM/YYYY' as const, label: 'DD/MM/YYYY', example: '31/12/2023' },
  { value: 'YYYY-MM-DD' as const, label: 'YYYY-MM-DD', example: '2023-12-31' },
];

export const DateFormatSelectionModal: React.FC<DateFormatSelectionModalProps> = ({
  visible,
  onClose,
  selectedFormat,
  onFormatSelect,
}) => {
  const { theme } = useTheme();

  const handleFormatSelect = (format: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD') => {
    onFormatSelect(format);
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
    scrollView: {
      flex: 1,
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
    formatCard: {
      padding: 16,
      marginBottom: 12,
    },
    formatItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    formatInfo: {
      flex: 1,
    },
    formatName: {
      fontSize: 16,
      fontWeight: '500',
      color: theme.colors.text,
      marginBottom: 4,
    },
    formatExample: {
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
          <Text style={styles.title}>Date Format</Text>
          <View style={styles.closeButton} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.description}>
            Choose how dates will be displayed throughout the app.
          </Text>

          {DATE_FORMATS.map((format) => (
            <TouchableOpacity
              key={format.value}
              onPress={() => handleFormatSelect(format.value)}
              activeOpacity={0.7}
            >
              <Card
                style={[
                  styles.formatCard,
                  selectedFormat === format.value && styles.selectedCard
                ]}
                padding="none"
              >
                <View style={styles.formatItem}>
                  <View style={styles.formatInfo}>
                    <Text style={styles.formatName}>{format.label}</Text>
                    <Text style={styles.formatExample}>Example: {format.example}</Text>
                  </View>
                  {selectedFormat === format.value && (
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