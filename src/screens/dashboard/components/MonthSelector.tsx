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
import {
  formatPeriodLabel,
  getPrevPeriod,
  getNextPeriod,
  getCurrentPeriodId,
  parsePeriodId,
  getCustomPeriodId
} from '../../../utils/helpers/dateUtils';

interface MonthSelectorProps {
  selectedPeriod: string; // YYYY-MM-DD format (period start date)
  onPeriodChange: (period: string) => void;
  periodStartDay: number; // 1-28
}

export const MonthSelector: React.FC<MonthSelectorProps> = ({
  selectedPeriod,
  onPeriodChange,
  periodStartDay,
}) => {
  const { theme } = useTheme();
  const [showYearPicker, setShowYearPicker] = useState(false);
  const fadeAnim = new Animated.Value(1);
  const scrollViewRef = useRef<ScrollView>(null);

  // Generate last 6 periods and next 6 periods
  const periods = React.useMemo(() => {
    const periodsArray = [];
    let currentPeriodId = selectedPeriod;

    // Go back 6 periods
    for (let i = 0; i < 6; i++) {
      currentPeriodId = getPrevPeriod(currentPeriodId, periodStartDay);
    }

    // Generate 13 periods (-6 to +6 from selected)
    for (let i = 0; i < 13; i++) {
      const periodStart = parsePeriodId(currentPeriodId);
      const isSelected = currentPeriodId === selectedPeriod;
      const isCurrent = currentPeriodId === getCurrentPeriodId(periodStartDay);

      periodsArray.push({
        value: currentPeriodId,
        label: dayjs(periodStart).format('MMM'),
        year: periodStart.getFullYear().toString(),
        isSelected,
        isCurrent,
      });

      currentPeriodId = getNextPeriod(currentPeriodId, periodStartDay);
    }

    return periodsArray;
  }, [selectedPeriod, periodStartDay]);


  const handlePeriodSelect = (period: string) => {
    if (period !== selectedPeriod) {
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

      onPeriodChange(period);
    }
  };

  const handleYearSelect = (date: dayjs.Dayjs) => {
    // When year is selected, create a period for that year with same month/day as current selection
    const currentPeriodStart = parsePeriodId(selectedPeriod);
    const newDate = new Date(date.year(), currentPeriodStart.getMonth(), periodStartDay);
    const newPeriod = getCustomPeriodId(newDate, periodStartDay);
    onPeriodChange(newPeriod);
    setShowYearPicker(false);
  };

  const getCurrentPeriodLabel = () => {
    const currentPeriodId = getCurrentPeriodId(periodStartDay);

    if (selectedPeriod === currentPeriodId) {
      return periodStartDay === 1 ? 'This Month' : 'This Period';
    } else if (selectedPeriod === getPrevPeriod(currentPeriodId, periodStartDay)) {
      return periodStartDay === 1 ? 'Last Month' : 'Last Period';
    } else {
      return formatPeriodLabel(selectedPeriod, periodStartDay);
    }
  };

  const goToPreviousPeriod = () => {
    const prev = getPrevPeriod(selectedPeriod, periodStartDay);
    handlePeriodSelect(prev);
  };

  const goToNextPeriod = () => {
    const next = getNextPeriod(selectedPeriod, periodStartDay);
    handlePeriodSelect(next);
  };

  const goToCurrentPeriod = () => {
    const current = getCurrentPeriodId(periodStartDay);
    handlePeriodSelect(current);
  };

  // Auto-scroll to selected period when component mounts or selectedPeriod changes
  useEffect(() => {
    if (scrollViewRef.current && !showYearPicker) {
      const selectedIndex = periods.findIndex(period => period.isSelected);
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
  }, [selectedPeriod, periods, showYearPicker]);

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
          onPress={goToPreviousPeriod}
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
            {getCurrentPeriodLabel()}
          </Text>
          <Icon
            name="chevron-down"
            size={16}
            color={theme.colors.textSecondary}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={goToNextPeriod}
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

      {/* Period slider */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.monthsContainer}
        style={styles.monthsScroll}
      >
        {periods.map((period) => (
          <TouchableOpacity
            key={period.value}
            onPress={() => handlePeriodSelect(period.value)}
            style={[
              styles.monthChip,
              period.isSelected
                ? dynamicStyles.monthChipSelected
                : period.isCurrent
                  ? dynamicStyles.monthChipCurrent
                  : dynamicStyles.monthChipDefault
            ]}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.monthChipText,
              period.isSelected
                ? dynamicStyles.monthChipTextSelected
                : period.isCurrent
                  ? dynamicStyles.monthChipTextCurrent
                  : dynamicStyles.monthChipTextDefault
            ]}>
              {period.label}
            </Text>
            {period.isCurrent && (
              <View style={[
                styles.currentIndicator,
                period.isSelected
                  ? dynamicStyles.currentIndicatorSelected
                  : dynamicStyles.currentIndicatorDefault
              ]} />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Quick actions */}
      <View style={styles.quickActions}>
        {selectedPeriod !== getCurrentPeriodId(periodStartDay) && (
          <TouchableOpacity
            onPress={goToCurrentPeriod}
            style={[styles.todayButton, { borderColor: theme.colors.primary[500] }]}
            activeOpacity={0.7}
          >
            <Text style={[styles.todayButtonText, { color: theme.colors.primary[500] }]}>
              {periodStartDay === 1 ? 'This Month' : 'This Period'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Year Picker Modal */}
      <YearPicker
        visible={showYearPicker}
        value={dayjs(parsePeriodId(selectedPeriod))}
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