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
import { SafeContainer } from '../layout/SafeContainer';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../app/providers/ThemeProvider';
import Card from '../ui/Card';

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
    dayCard: {
      padding: 16,
      marginBottom: 12,
    },
    dayItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    dayInfo: {
      flex: 1,
    },
    dayName: {
      fontSize: 16,
      fontWeight: '500',
      color: theme.colors.text,
      marginBottom: 4,
    },
    dayDescription: {
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
      <SafeContainer style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>First Day of Week</Text>
          <View style={styles.closeButton} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.description}>
            Choose the first day of the week for calendar views and reports.
          </Text>

          {WEEK_START_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              onPress={() => handleDaySelect(option.value)}
              activeOpacity={0.7}
            >
              <Card
                style={StyleSheet.flatten([
                  styles.dayCard,
                  selectedDay === option.value && styles.selectedCard
                ])}
                padding="none"
              >
                <View style={styles.dayItem}>
                  <View style={styles.dayInfo}>
                    <Text style={styles.dayName}>{option.label}</Text>
                    <Text style={styles.dayDescription}>{option.description}</Text>
                  </View>
                  {selectedDay === option.value && (
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
      </SafeContainer>
    </Modal>
  );
};