// src/screens/dashboard/components/MonthSelector.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import { useTheme } from '../../../app/providers/ThemeProvider';
import dayjs from 'dayjs';

interface MonthSelectorProps {
  selectedMonth: string;
  onMonthChange: (month: string) => void;
}

export const MonthSelector: React.FC<MonthSelectorProps> = ({
  selectedMonth,
  onMonthChange,
}) => {
  const { theme } = useTheme();
  const [showYearSelector, setShowYearSelector] = useState(false);
  const fadeAnim = new Animated.Value(1);

  // Generate last 6 months and next 6 months
  const months = React.useMemo(() => {
    const current = dayjs(selectedMonth);
    const monthsArray = [];

    for (let i = -6; i <= 6; i++) {
      const month = current.add(i, 'month');
      monthsArray.push({
        value: month.format('YYYY-MM'),
        label: month.format('MMM'),
        year: month.format('YYYY'),
        isSelected: month.format('YYYY-MM') === selectedMonth,
        isCurrent: month.format('YYYY-MM') === dayjs().format('YYYY-MM'),
      });
    }

    return monthsArray;
  }, [selectedMonth]);

  // Generate years (3 years back, current, 1 year forward)
  const years = React.useMemo(() => {
    const currentYear = dayjs().year();
    return Array.from({ length: 5 }, (_, i) => currentYear - 3 + i);
  }, []);

  const handleMonthSelect = (month: string) => {
    if (month !== selectedMonth) {
      // Fade animation
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.7,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();

      onMonthChange(month);
    }
  };

  const handleYearSelect = (year: number) => {
    const newMonth = dayjs(selectedMonth).year(year).format('YYYY-MM');
    onMonthChange(newMonth);
    setShowYearSelector(false);
  };

  const getCurrentMonthLabel = () => {
    const current = dayjs(selectedMonth);
    const now = dayjs();

    if (current.isSame(now, 'month')) {
      return 'This Month';
    } else if (current.isSame(now.subtract(1, 'month'), 'month')) {
      return 'Last Month';
    } else {
      return current.format('MMMM YYYY');
    }
  };

  const goToPreviousMonth = () => {
    const prev = dayjs(selectedMonth).subtract(1, 'month').format('YYYY-MM');
    handleMonthSelect(prev);
  };

  const goToNextMonth = () => {
    const next = dayjs(selectedMonth).add(1, 'month').format('YYYY-MM');
    handleMonthSelect(next);
  };

  const goToCurrentMonth = () => {
    const current = dayjs().format('YYYY-MM');
    handleMonthSelect(current);
  };

  if (showYearSelector) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => setShowYearSelector(false)}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Text style={[styles.backText, { color: theme.colors.primary }]}>
              ← Back
            </Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Select Year
          </Text>
        </View>

        <ScrollView
          style={styles.yearsList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.yearsContent}
        >
          {years.map((year) => (
            <TouchableOpacity
              key={year}
              onPress={() => handleYearSelect(year)}
              style={[
                styles.yearItem,
                {
                  backgroundColor: dayjs(selectedMonth).year() === year
                    ? theme.colors.primary + '15'
                    : 'transparent',
                }
              ]}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.yearText,
                {
                  color: dayjs(selectedMonth).year() === year
                    ? theme.colors.primary
                    : theme.colors.text,
                  fontWeight: dayjs(selectedMonth).year() === year ? '600' : '400',
                }
              ]}>
                {year}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: theme.colors.surface, opacity: fadeAnim }
      ]}
    >
      {/* Header with navigation */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={goToPreviousMonth}
          style={styles.navButton}
          activeOpacity={0.7}
        >
          <Text style={[styles.navButtonText, { color: theme.colors.primary }]}>
            ←
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setShowYearSelector(true)}
          style={styles.monthButton}
          activeOpacity={0.7}
        >
          <Text style={[styles.monthTitle, { color: theme.colors.text }]}>
            {getCurrentMonthLabel()}
          </Text>
          <Text style={[styles.dropdownIcon, { color: theme.colors.textSecondary }]}>
            ▼
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={goToNextMonth}
          style={styles.navButton}
          activeOpacity={0.7}
        >
          <Text style={[styles.navButtonText, { color: theme.colors.primary }]}>
            →
          </Text>
        </TouchableOpacity>
      </View>

      {/* Month slider */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.monthsContainer}
        style={styles.monthsScroll}
      >
        {months.map((month) => (
          <TouchableOpacity
            key={month.value}
            onPress={() => handleMonthSelect(month.value)}
            style={[
              styles.monthChip,
              {
                backgroundColor: month.isSelected
                  ? theme.colors.primary
                  : theme.colors.background,
                borderColor: month.isCurrent && !month.isSelected
                  ? theme.colors.primary
                  : 'transparent',
                borderWidth: month.isCurrent && !month.isSelected ? 1 : 0,
              }
            ]}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.monthChipText,
              {
                color: month.isSelected
                  ? theme.colors.onPrimary
                  : month.isCurrent
                    ? theme.colors.primary
                    : theme.colors.text,
                fontWeight: month.isSelected || month.isCurrent ? '600' : '400',
              }
            ]}>
              {month.label}
            </Text>
            {month.isCurrent && (
              <View style={[
                styles.currentIndicator,
                {
                  backgroundColor: month.isSelected
                    ? theme.colors.onPrimary
                    : theme.colors.primary,
                }
              ]} />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Quick actions */}
      <View style={styles.quickActions}>
        {!dayjs(selectedMonth).isSame(dayjs(), 'month') && (
          <TouchableOpacity
            onPress={goToCurrentMonth}
            style={[styles.todayButton, { borderColor: theme.colors.primary }]}
            activeOpacity={0.7}
          >
            <Text style={[styles.todayButtonText, { color: theme.colors.primary }]}>
              This Month
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  monthButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  dropdownIcon: {
    fontSize: 12,
  },
  monthsScroll: {
    marginHorizontal: -16,
  },
  monthsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  monthChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    minWidth: 60,
    alignItems: 'center',
    position: 'relative',
  },
  monthChipText: {
    fontSize: 14,
    textAlign: 'center',
  },
  currentIndicator: {
    position: 'absolute',
    bottom: 2,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  quickActions: {
    marginTop: 12,
    alignItems: 'center',
  },
  todayButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  todayButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  // Year selector styles
  backButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  backText: {
    fontSize: 14,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  yearsList: {
    flex: 1,
  },
  yearsContent: {
    paddingVertical: 8,
  },
  yearItem: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 8,
    marginVertical: 2,
    marginHorizontal: 16,
  },
  yearText: {
    fontSize: 18,
    textAlign: 'center',
  },
});