// src/components/modals/PeriodStartDaySelectionModal.tsx
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

interface PeriodStartDaySelectionModalProps {
  visible: boolean;
  onClose: () => void;
  selectedDay: number;
  onDaySelect: (day: number) => void;
}

// Common period start days with descriptions
const COMMON_PERIOD_DAYS = [
  { value: 1, label: 'Day 1', description: 'Calendar month (1st to last day)', isCommon: true },
  { value: 5, label: 'Day 5', description: '5th to 4th of next month', isCommon: true },
  { value: 7, label: 'Day 7', description: '7th to 6th of next month', isCommon: true },
  { value: 10, label: 'Day 10', description: '10th to 9th of next month', isCommon: true },
  { value: 15, label: 'Day 15', description: '15th to 14th of next month', isCommon: true },
  { value: 20, label: 'Day 20', description: '20th to 19th of next month', isCommon: true },
  { value: 25, label: 'Day 25', description: '25th to 24th of next month', isCommon: true },
];

// Generate all other days (2-28, excluding common ones)
const ALL_OTHER_DAYS = Array.from({ length: 28 }, (_, i) => i + 1)
  .filter(day => !COMMON_PERIOD_DAYS.find(common => common.value === day))
  .map(day => ({
    value: day,
    label: `Day ${day}`,
    description: `${day}${getOrdinalSuffix(day)} to ${day - 1}${getOrdinalSuffix(day - 1)} of next month`,
    isCommon: false,
  }));

function getOrdinalSuffix(day: number): string {
  if (day > 3 && day < 21) return 'th';
  switch (day % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}

export const PeriodStartDaySelectionModal: React.FC<PeriodStartDaySelectionModalProps> = ({
  visible,
  onClose,
  selectedDay,
  onDaySelect,
}) => {
  const { theme } = useTheme();

  const handleDaySelect = (day: number) => {
    onDaySelect(day);
    onClose();
  };

  if (!visible) return null;

  const allOptions = [...COMMON_PERIOD_DAYS, ...ALL_OTHER_DAYS].sort((a, b) => a.value - b.value);

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
            <View>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                Period Start Day
              </Text>
              <Text style={[styles.modalSubtitle, { color: theme.colors.textSecondary }]}>
                Select the first day of your income/expense period
              </Text>
            </View>
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
            {allOptions.map((option) => (
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
                  <View style={styles.dayHeader}>
                    <Text style={[
                      styles.dayName,
                      { color: theme.colors.text },
                      option.isCommon && styles.commonDayName
                    ]}>
                      {option.label}
                    </Text>
                    {option.isCommon && (
                      <View style={[styles.commonBadge, { backgroundColor: `${theme.colors.primary[500]}20` }]}>
                        <Text style={[styles.commonBadgeText, { color: theme.colors.primary[500] }]}>
                          Common
                        </Text>
                      </View>
                    )}
                  </View>
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

          {/* Info Footer */}
          <View style={[styles.infoFooter, { backgroundColor: `${theme.colors.primary[500]}10`, borderTopColor: theme.colors.border }]}>
            <Icon name="information-circle-outline" size={20} color={theme.colors.primary[500]} />
            <Text style={[styles.infoText, { color: theme.colors.text }]}>
              This setting affects how transactions, budgets, and reports are grouped into periods.
            </Text>
          </View>
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
    height: '75%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 13,
    maxWidth: '90%',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 20,
  },
  dayItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 2,
  },
  dayInfo: {
    flex: 1,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  dayName: {
    fontSize: 16,
    fontWeight: '500',
    marginRight: 8,
  },
  commonDayName: {
    fontWeight: '600',
  },
  commonBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  commonBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  dayDescription: {
    fontSize: 13,
  },
  infoFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  infoText: {
    fontSize: 12,
    marginLeft: 8,
    flex: 1,
  },
});
