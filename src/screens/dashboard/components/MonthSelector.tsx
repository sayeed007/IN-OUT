// src/screens/dashboard/components/MonthSelector.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../app/providers/ThemeProvider';
import { YearPicker } from '../../reports/components/YearPicker';
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
  const [showYearPicker, setShowYearPicker] = useState(false);
  const fadeAnim = new Animated.Value(1);
  const scrollViewRef = useRef<ScrollView>(null);

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

  const handleYearSelect = (date: dayjs.Dayjs) => {
    const newMonth = dayjs(selectedMonth).year(date.year()).format('YYYY-MM');
    onMonthChange(newMonth);
    setShowYearPicker(false);
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

  // Auto-scroll to selected month when component mounts or selectedMonth changes
  useEffect(() => {
    if (scrollViewRef.current && !showYearPicker) {
      const selectedIndex = months.findIndex(month => month.isSelected);
      if (selectedIndex >= 0) {
        const scrollToX = selectedIndex * 68 - 50; // 68 = width + margin, 50 = offset
        setTimeout(() => {
          scrollViewRef.current?.scrollTo({
            x: Math.max(0, scrollToX),
            animated: true,
          });
        }, 100);
      }
    }
  }, [selectedMonth, months, showYearPicker]);

  // Create dynamic styles to replace inline styles
  const getDynamicStyles = () => {
    return StyleSheet.create({
      monthChipSelected: {
        backgroundColor: theme.colors.primary[500],
        borderColor: 'transparent',
        borderWidth: 0,
      },
      monthChipCurrent: {
        backgroundColor: theme.colors.background,
        borderColor: theme.colors.primary[500],
        borderWidth: 1,
      },
      monthChipDefault: {
        backgroundColor: theme.colors.background,
        borderColor: 'transparent',
        borderWidth: 0,
      },
      monthChipTextSelected: {
        color: theme.colors.onPrimary,
        fontWeight: '600' as const,
      },
      monthChipTextCurrent: {
        color: theme.colors.primary[500],
        fontWeight: '600' as const,
      },
      monthChipTextDefault: {
        color: theme.colors.text,
        fontWeight: '400' as const,
      },
      currentIndicatorSelected: {
        backgroundColor: theme.colors.onPrimary,
      },
      currentIndicatorDefault: {
        backgroundColor: theme.colors.primary[500],
      },
    });
  };

  const dynamicStyles = getDynamicStyles();


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
          <Icon
            name="chevron-back"
            size={24}
            color={theme.colors.primary[500]}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setShowYearPicker(true)}
          style={styles.monthButton}
          activeOpacity={0.7}
        >
          <Text style={[styles.monthTitle, { color: theme.colors.text }]}>
            {getCurrentMonthLabel()}
          </Text>
          <Icon
            name="chevron-down"
            size={16}
            color={theme.colors.textSecondary}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={goToNextMonth}
          style={styles.navButton}
          activeOpacity={0.7}
        >
          <Icon
            name="chevron-forward"
            size={24}
            color={theme.colors.primary[500]}
          />
        </TouchableOpacity>
      </View>

      {/* Month slider */}
      <ScrollView
        ref={scrollViewRef}
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
              month.isSelected
                ? dynamicStyles.monthChipSelected
                : month.isCurrent
                  ? dynamicStyles.monthChipCurrent
                  : dynamicStyles.monthChipDefault
            ]}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.monthChipText,
              month.isSelected
                ? dynamicStyles.monthChipTextSelected
                : month.isCurrent
                  ? dynamicStyles.monthChipTextCurrent
                  : dynamicStyles.monthChipTextDefault
            ]}>
              {month.label}
            </Text>
            {month.isCurrent && (
              <View style={[
                styles.currentIndicator,
                month.isSelected
                  ? dynamicStyles.currentIndicatorSelected
                  : dynamicStyles.currentIndicatorDefault
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
            style={[styles.todayButton, { borderColor: theme.colors.primary[500] }]}
            activeOpacity={0.7}
          >
            <Text style={[styles.todayButtonText, { color: theme.colors.primary[500] }]}>
              This Month
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Year Picker Modal */}
      <YearPicker
        visible={showYearPicker}
        value={dayjs(selectedMonth)}
        onSelect={handleYearSelect}
        onClose={() => setShowYearPicker(false)}
        title="Select Year"
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 0,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginHorizontal: 8,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    overflow: 'hidden',
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
    paddingHorizontal: 16,
  },
  monthsContainer: {
    paddingHorizontal: 4,
    paddingVertical: 12,
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
});