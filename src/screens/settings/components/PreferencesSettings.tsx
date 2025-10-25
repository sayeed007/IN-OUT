// src/screens/settings/components/PreferencesSettings.tsx
import React, { useState } from 'react';
import { Text, StyleSheet, Switch, Appearance } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import Card from '../../../components/ui/Card';
import SettingItem from './SettingItem';
import { Spacing } from '../../../theme';
import { useTheme } from '../../../app/providers/ThemeProvider';
import { RootState } from '../../../state/store';
import { updatePreferences } from '../../../state/slices/preferencesSlice';
import { resetToCurrentPeriod } from '../../../state/slices/appSlice';
import { DateFormatSelectionModal } from '../../../components/modals/DateFormatSelectionModal';
import { FirstDayOfWeekSelectionModal } from '../../../components/modals/FirstDayOfWeekSelectionModal';
import { PeriodStartDaySelectionModal } from '../../../components/modals/PeriodStartDaySelectionModal';

const PreferencesSettings: React.FC = () => {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const preferences = useSelector((state: RootState) => state.preferences);

  const [showDateFormatModal, setShowDateFormatModal] = useState(false);
  const [showFirstDayModal, setShowFirstDayModal] = useState(false);
  const [showPeriodStartDayModal, setShowPeriodStartDayModal] = useState(false);

  // const handleNotificationsToggle = (value: boolean) => {
  //   dispatch(updatePreferences({ enableNotifications: value }));
  // };

  // const handleBiometricsToggle = (value: boolean) => {
  //   dispatch(updatePreferences({ enableAppLock: value }));
  // };

  const handleThemeChange = (isDark: boolean) => {
    const newTheme = isDark ? 'dark' : 'light';
    dispatch(updatePreferences({ theme: newTheme }));
  };

  const getCurrentThemeDisplayValue = () => {
    if (preferences.theme === 'system') {
      // Show system appearance preference as the current state
      return Appearance.getColorScheme() === 'dark';
    }
    return preferences.theme === 'dark';
  };

  const handleDateFormatSelect = (format: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD') => {
    dispatch(updatePreferences({ dateFormat: format }));
  };

  const handleFirstDaySelect = (day: 0 | 1) => {
    dispatch(updatePreferences({ firstDayOfWeek: day }));
  };

  const handlePeriodStartDaySelect = (day: number) => {
    dispatch(updatePreferences({ budgetStartDay: day }));
    // Reset to current period with the new start day
    dispatch(resetToCurrentPeriod(day));
  };

  const getFirstDayLabel = () => {
    return preferences.firstDayOfWeek === 0 ? 'Saturday' : 'Sunday';
  };

  const getPeriodStartDayLabel = () => {
    const day = preferences.budgetStartDay;
    if (day === 1) {
      return 'Day 1 (Calendar month)';
    }
    return `Day ${day}`;
  };

  const getPeriodStartDaySubtitle = () => {
    const day = preferences.budgetStartDay;
    if (day === 1) {
      return '1st to last day of month';
    }
    const prevDay = day - 1;
    return `${day}${getOrdinalSuffix(day)} to ${prevDay}${getOrdinalSuffix(prevDay)} of next month`;
  };

  const getOrdinalSuffix = (day: number): string => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };

  const styles = StyleSheet.create({
    section: {
      marginBottom: Spacing.base,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: Spacing.base,
    },
  });

  const switchTrackColor = {
    false: theme.colors.neutral[300] || '#E5E7EB',
    true: theme.colors.primary[500] || '#6366F1',
  };

  return (
    <>
      <Card style={styles.section} padding="small">
        <Text style={styles.sectionTitle}>Preferences</Text>

        {/* <SettingItem
          title="Notifications"
          subtitle="Get alerts for budget limits and reminders"
          rightComponent={
            <Switch
              value={preferences.enableNotifications}
              onValueChange={handleNotificationsToggle}
              trackColor={switchTrackColor}
              thumbColor="#FFFFFF"
            />
          }
          showArrow={false}
        /> */}

        {/* <SettingItem
          title="Biometric Lock"
          subtitle="Use fingerprint or face ID to unlock the app"
          rightComponent={
            <Switch
              value={preferences.enableAppLock}
              onValueChange={handleBiometricsToggle}
              trackColor={switchTrackColor}
              thumbColor="#FFFFFF"
            />
          }
          showArrow={false}
        /> */}

        <SettingItem
          title="Dark Mode"
          subtitle="Switch between light and dark themes"
          rightComponent={
            <Switch
              value={getCurrentThemeDisplayValue()}
              onValueChange={handleThemeChange}
              trackColor={switchTrackColor}
              thumbColor="#FFFFFF"
            />
          }
          showArrow={false}
        />

        <SettingItem
          title="Date Format"
          subtitle={preferences.dateFormat}
          onPress={() => setShowDateFormatModal(true)}
        />

        <SettingItem
          title="First Day of Week"
          subtitle={getFirstDayLabel()}
          onPress={() => setShowFirstDayModal(true)}
        />

        <SettingItem
          title="Period Start Day"
          subtitle={getPeriodStartDaySubtitle()}
          onPress={() => setShowPeriodStartDayModal(true)}
        />
      </Card>

      {showDateFormatModal &&
        <DateFormatSelectionModal
          visible={showDateFormatModal}
          onClose={() => setShowDateFormatModal(false)}
          selectedFormat={preferences.dateFormat}
          onFormatSelect={handleDateFormatSelect}
        />
      }

      {showFirstDayModal &&
        <FirstDayOfWeekSelectionModal
          visible={showFirstDayModal}
          onClose={() => setShowFirstDayModal(false)}
          selectedDay={preferences.firstDayOfWeek}
          onDaySelect={handleFirstDaySelect}
        />
      }

      {showPeriodStartDayModal &&
        <PeriodStartDaySelectionModal
          visible={showPeriodStartDayModal}
          onClose={() => setShowPeriodStartDayModal(false)}
          selectedDay={preferences.budgetStartDay}
          onDaySelect={handlePeriodStartDaySelect}
        />
      }
    </>
  );
};

export default PreferencesSettings;