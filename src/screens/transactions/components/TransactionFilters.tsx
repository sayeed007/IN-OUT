import dayjs from 'dayjs';
import React, { useState } from 'react';
import {
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../../../app/providers/ThemeProvider';
import Chip from '../../../components/ui/Chip';
import { getAccountTypeEmoji } from '../../../utils/helpers/iconUtils';


const datePresets = [
  { label: 'Today', days: 0 },
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
  { label: 'This month', days: -1 }, // Special case
  { label: 'Last month', days: -2 }, // Special case
];

interface TransactionFiltersProps {
  visible: boolean;
  dateRange: { start: string; end: string };
  onDateRangeChange: (range: { start: string; end: string }) => void;
  selectedCategories: string[];
  onCategoriesChange: (categories: string[]) => void;
  selectedAccounts: string[];
  onAccountsChange: (accounts: string[]) => void;
  onClose: () => void;
  onClear: () => void;
  categories?: any[];
  accounts?: any[];
}

const TransactionFilters: React.FC<TransactionFiltersProps> = ({
  visible,
  dateRange,
  onDateRangeChange,
  selectedCategories,
  onCategoriesChange,
  selectedAccounts,
  onAccountsChange,
  onClose,
  onClear,
  categories = [],
  accounts = [],
}) => {
  const { theme } = useTheme();
  const [tempStartDate, setTempStartDate] = useState(dateRange.start);
  const [tempEndDate, setTempEndDate] = useState(dateRange.end);
  const [showDatePicker, setShowDatePicker] = useState<'start' | 'end' | null>(null);

  const applyDatePreset = (days: number) => {
    let start: string;
    let end: string = dayjs().endOf('day').toISOString();

    if (days === 0) {
      // Today
      start = dayjs().startOf('day').toISOString();
    } else if (days === -1) {
      // This month
      start = dayjs().startOf('month').startOf('day').toISOString();
      end = dayjs().endOf('month').endOf('day').toISOString();
    } else if (days === -2) {
      // Last month
      start = dayjs().subtract(1, 'month').startOf('month').startOf('day').toISOString();
      end = dayjs().subtract(1, 'month').endOf('month').endOf('day').toISOString();
    } else {
      // Last X days
      start = dayjs().subtract(days, 'days').startOf('day').toISOString();
    }

    setTempStartDate(start);
    setTempEndDate(end);
    onDateRangeChange({ start, end });
  };

  const toggleCategory = (categoryId: string) => {
    const newCategories = selectedCategories.includes(categoryId)
      ? selectedCategories.filter(id => id !== categoryId)
      : [...selectedCategories, categoryId];
    onCategoriesChange(newCategories);
  };

  const toggleAccount = (accountId: string) => {
    const newAccounts = selectedAccounts.includes(accountId)
      ? selectedAccounts.filter(id => id !== accountId)
      : [...selectedAccounts, accountId];
    onAccountsChange(newAccounts);
  };


  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={onClose}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={[styles.title, { color: theme.colors.text }]}>
                Filter Transactions
              </Text>
              <View style={styles.headerActions}>
                <TouchableOpacity onPress={onClear} style={styles.clearButton}>
                  <Text style={[styles.clearText, { color: theme.colors.textSecondary }]}>
                    Clear All
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Text style={[styles.closeText, { color: theme.colors.primary[500] }]}>
                    Done
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

              {/* Date Range Section */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                  Date Range
                </Text>

                {/* Date Presets */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presets}>
                  {datePresets.map((preset) => (
                    <TouchableOpacity
                      key={preset.label}
                      onPress={() => applyDatePreset(preset.days)}
                      style={[
                        styles.presetButton,
                        { backgroundColor: theme.colors.background }
                      ]}
                    >
                      <Text style={[styles.presetText, { color: theme.colors.textSecondary }]}>
                        {preset.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* Custom Date Range */}
                <View style={styles.dateInputs}>
                  <View style={styles.dateInput}>
                    <Text style={[styles.dateLabel, { color: theme.colors.textSecondary }]}>
                      From
                    </Text>
                    <TouchableOpacity
                      style={[styles.dateButton, { backgroundColor: theme.colors.background }]}
                      onPress={() => setShowDatePicker('start')}
                    >
                      <Text style={[styles.dateText, { color: theme.colors.text }]}>
                        {dayjs(tempStartDate).format('MMM DD, YYYY')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.dateInput}>
                    <Text style={[styles.dateLabel, { color: theme.colors.textSecondary }]}>
                      To
                    </Text>
                    <TouchableOpacity
                      style={[styles.dateButton, { backgroundColor: theme.colors.background }]}
                      onPress={() => setShowDatePicker('end')}
                    >
                      <Text style={[styles.dateText, { color: theme.colors.text }]}>
                        {dayjs(tempEndDate).format('MMM DD, YYYY')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Categories Section */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                  Categories
                </Text>
                <FlatList
                  data={categories}
                  keyExtractor={(item) => item.id}
                  numColumns={3}
                  scrollEnabled={false}
                  columnWrapperStyle={styles.chipRow}
                  renderItem={({ item: category }) => (
                    <Chip
                      label={category.name}
                      icon={category.icon}
                      selected={selectedCategories.includes(category.id)}
                      onPress={() => toggleCategory(category.id)}
                      style={styles.chip}
                    />
                  )}
                  ListEmptyComponent={
                    <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                      No categories available
                    </Text>
                  }
                />
              </View>

              {/* Accounts Section */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                  Accounts
                </Text>
                <FlatList
                  data={accounts}
                  keyExtractor={(item) => item.id}
                  numColumns={3}
                  scrollEnabled={false}
                  columnWrapperStyle={styles.chipRow}
                  renderItem={({ item: account }) => (
                    <Chip
                      label={`${getAccountTypeEmoji(account.type)} ${account.name}`}
                      selected={selectedAccounts.includes(account.id)}
                      onPress={() => toggleAccount(account.id)}
                      style={styles.chip}
                    />
                  )}
                  ListEmptyComponent={
                    <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                      No accounts available
                    </Text>
                  }
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Simple Date Picker Modal */}
      <Modal
        visible={showDatePicker !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDatePicker(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              Select {showDatePicker === 'start' ? 'Start' : 'End'} Date
            </Text>
            <TextInput
              style={[styles.dateInputField, {
                color: theme.colors.text,
                borderColor: theme.colors.border
              }]}
              value={showDatePicker === 'start'
                ? dayjs(tempStartDate).format('YYYY-MM-DD')
                : dayjs(tempEndDate).format('YYYY-MM-DD')}
              onChangeText={(text) => {
                // Convert YYYY-MM-DD back to ISO string
                const isoDate = dayjs(text).toISOString();
                if (showDatePicker === 'start') {
                  setTempStartDate(isoDate);
                } else {
                  setTempEndDate(isoDate);
                }
              }}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={theme.colors.textSecondary}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => setShowDatePicker(null)}
                style={styles.modalButton}
              >
                <Text style={[styles.modalButtonText, { color: theme.colors.textSecondary }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  onDateRangeChange({
                    start: tempStartDate,
                    end: tempEndDate,
                  });
                  setShowDatePicker(null);
                }}
                style={[styles.modalButton, { backgroundColor: theme.colors.primary[500] }]}
              >
                <Text style={[styles.modalButtonText, { color: theme.colors.onPrimary }]}>
                  Apply
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </>

  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  container: {
    flex: 1,
    height: '90%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  clearButton: {
    padding: 4,
  },
  clearText: {
    fontSize: 14,
  },
  closeButton: {
    padding: 4,
  },
  closeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  presets: {
    marginBottom: 12,
  },
  presetButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  presetText: {
    fontSize: 12,
  },
  dateInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  dateInput: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  dateButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  dateText: {
    fontSize: 14,
    textAlign: 'center',
  },
  chipRow: {
    gap: 8,
    marginBottom: 8,
  },
  chip: {
    flex: 1,
    marginBottom: 0,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    borderRadius: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  dateInputField: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default TransactionFilters;
