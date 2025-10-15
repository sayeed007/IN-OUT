// src/components/modals/DateFormatSelectionModal.tsx
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
              Date Format
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Format List */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {DATE_FORMATS.map((format) => (
              <TouchableOpacity
                key={format.value}
                onPress={() => handleFormatSelect(format.value)}
                activeOpacity={0.7}
                style={[
                  styles.formatItem,
                  {
                    backgroundColor: selectedFormat === format.value
                      ? `${theme.colors.primary[500]}10`
                      : theme.colors.surface,
                    borderColor: selectedFormat === format.value
                      ? theme.colors.primary[500]
                      : theme.colors.border,
                  }
                ]}
              >
                <View style={styles.formatInfo}>
                  <Text style={[styles.formatName, { color: theme.colors.text }]}>
                    {format.label}
                  </Text>
                  <Text style={[styles.formatExample, { color: theme.colors.textSecondary }]}>
                    Example: {format.example}
                  </Text>
                </View>
                {selectedFormat === format.value && (
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
    height: '55%',
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
  formatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 2,
  },
  formatInfo: {
    flex: 1,
  },
  formatName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  formatExample: {
    fontSize: 14,
  },
});
