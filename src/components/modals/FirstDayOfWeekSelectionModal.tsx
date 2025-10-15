// src/components/modals/FirstDayOfWeekSelectionModal.tsx
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

interface FirstDayOfWeekSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  selectedDay: 0 | 1;
  onDaySelect: (day: 0 | 1) => void;
}

const WEEK_START_OPTIONS = [
  { value: 0 as const, label: 'Saturday', description: 'Week starts on Saturday' },
  { value: 1 as const, label: 'Sunday', description: 'Week starts on Sunday' },
];

export const FirstDayOfWeekSelectionModal: React.FC<FirstDayOfWeekSelectionModalProps> = ({
  visible,
  onClose,
  selectedDay,
  onDaySelect,
}) => {
  const { theme } = useTheme();

  const handleDaySelect = (day: 0 | 1) => {
    onDaySelect(day);
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
              First Day of Week
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Day Options List */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {WEEK_START_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                onPress={() => handleDaySelect(option.value)}
                activeOpacity={0.7}
                style={[
                  styles.dayItem,
                  {
                    backgroundColor: selectedDay === option.value
                      ? `${theme.colors.primary[500]}10`
                      : theme.colors.surface,
                    borderColor: selectedDay === option.value
                      ? theme.colors.primary[500]
                      : theme.colors.border,
                  }
                ]}
              >
                <View style={styles.dayInfo}>
                  <Text style={[styles.dayName, { color: theme.colors.text }]}>
                    {option.label}
                  </Text>
                  <Text style={[styles.dayDescription, { color: theme.colors.textSecondary }]}>
                    {option.description}
                  </Text>
                </View>
                {selectedDay === option.value && (
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
    maxHeight: '70%',
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
  dayItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 2,
  },
  dayInfo: {
    flex: 1,
  },
  dayName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  dayDescription: {
    fontSize: 14,
  },
});
