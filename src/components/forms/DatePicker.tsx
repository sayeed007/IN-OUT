import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import {
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../app/providers/ThemeProvider';

interface DatePickerProps {
  date: Date;
  onDateChange: (date: Date) => void;
  label?: string;
  placeholder?: string;
  minimumDate?: Date;
  maximumDate?: Date;
  compact?: boolean;
  showLabel?: boolean;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  date,
  onDateChange,
  label,
  placeholder = "Select date",
  minimumDate,
  maximumDate,
  compact = false,
  showLabel = true,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [tempDate, setTempDate] = useState(date);
  const { theme } = useTheme();

  const formatDate = (): string => {
    if (compact) {
      // More compact format for header usage
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    }
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setIsModalVisible(false);
      if (selectedDate) {
        onDateChange(selectedDate);
      }
    } else if (selectedDate) {
      setTempDate(selectedDate);
    }
  };

  const handleConfirm = () => {
    onDateChange(tempDate);
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setTempDate(date);
    setIsModalVisible(false);
  };

  const openDatePicker = () => {
    setTempDate(date);
    setIsModalVisible(true);
  };

  return (
    <View style={[styles.container, compact && styles.compactContainer]}>
      {showLabel && label && <Text style={[styles.label, { color: theme.colors.text }]}>{label}</Text>}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.dateButton,
            compact && styles.compactDateButton,
            { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }
          ]}
          onPress={openDatePicker}
        >
          <Icon name="calendar-outline" size={compact ? 16 : 20} color={theme.colors.primary[500]} style={styles.icon} />
          <Text style={[styles.dateText, compact && styles.compactDateText, { color: theme.colors.text }]}>
            {date ? formatDate() : placeholder}
          </Text>
          {!compact && <Icon name="chevron-down" size={20} color={theme.colors.textSecondary} />}
        </TouchableOpacity>
      </View>

      {Platform.OS === 'ios' ? (
        <Modal
          visible={isModalVisible}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={handleCancel}
        >
          <View style={[styles.modal, { backgroundColor: theme.colors.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleCancel}
              >
                <Text style={[styles.cancelButtonText, { color: theme.colors.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Select Date</Text>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleConfirm}
              >
                <Text style={[styles.confirmButtonText, { color: theme.colors.primary[500] }]}>Done</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.datePickerContainer}>
              <DateTimePicker
                value={tempDate}
                mode="date"
                display="spinner"
                onChange={handleDateChange}
                minimumDate={minimumDate}
                maximumDate={maximumDate}
                style={styles.datePicker}
              />
            </View>
          </View>
        </Modal>
      ) : (
        isModalVisible && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={handleDateChange}
            minimumDate={minimumDate}
            maximumDate={maximumDate}
          />
        )
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    flex: 1,
  },
  compactContainer: {
    marginBottom: 0,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  buttonContainer: {
    alignItems: 'flex-end',
  },
  dateButton: {
    width: '70%',
    flexDirection: 'row',
    // alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
  },
  compactDateButton: {
    padding: 8,
    borderRadius: 6,
    minWidth: 120,
  },
  icon: {
    marginRight: 12,
  },
  dateText: {
    flex: 1,
    fontSize: 16,
  },
  compactDateText: {
    fontSize: 14,
    fontWeight: '500',
  },
  modal: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalButton: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  cancelButtonText: {
    fontSize: 16,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  datePickerContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  datePicker: {
    height: 200,
  },
});

export default DatePicker;
