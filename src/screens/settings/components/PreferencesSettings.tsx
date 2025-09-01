// src/screens/settings/components/PreferencesSettings.tsx
import React, { useState } from 'react';
import { Text, StyleSheet, Switch, Alert } from 'react-native';
import Card from '../../../components/ui/Card';
import SettingItem from './SettingItem';
import { Spacing } from '../../../theme';

const PreferencesSettings: React.FC = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [currentDateFormat, setCurrentDateFormat] = useState('MM/DD/YYYY');
  const [currentFirstDayOfWeek, setCurrentFirstDayOfWeek] = useState('Sunday');

  const handleDateFormatPress = () => {
    Alert.alert(
      'Date Format',
      'Select your preferred date format',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'MM/DD/YYYY', onPress: () => setCurrentDateFormat('MM/DD/YYYY') },
        { text: 'DD/MM/YYYY', onPress: () => setCurrentDateFormat('DD/MM/YYYY') },
        { text: 'YYYY-MM-DD', onPress: () => setCurrentDateFormat('YYYY-MM-DD') },
      ]
    );
  };

  const handleFirstDayOfWeekPress = () => {
    Alert.alert(
      'First Day of Week',
      'Select the first day of the week',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sunday', onPress: () => setCurrentFirstDayOfWeek('Sunday') },
        { text: 'Monday', onPress: () => setCurrentFirstDayOfWeek('Monday') },
      ]
    );
  };
  return (
    <Card style={styles.section} padding="small">
      <Text style={styles.sectionTitle}>Preferences</Text>

      <SettingItem
        title="Notifications"
        subtitle="Get alerts for budget limits and reminders"
        rightComponent={
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: '#E5E7EB', true: '#6366F1' }}
            thumbColor={notificationsEnabled ? '#FFFFFF' : '#FFFFFF'}
          />
        }
        showArrow={false}
      />

      <SettingItem
        title="Biometric Lock"
        subtitle="Use fingerprint or face ID to unlock the app"
        rightComponent={
          <Switch
            value={biometricsEnabled}
            onValueChange={setBiometricsEnabled}
            trackColor={{ false: '#E5E7EB', true: '#6366F1' }}
            thumbColor={biometricsEnabled ? '#FFFFFF' : '#FFFFFF'}
          />
        }
        showArrow={false}
      />

      <SettingItem
        title="Dark Mode"
        subtitle="Switch between light and dark themes"
        rightComponent={
          <Switch
            value={darkModeEnabled}
            onValueChange={setDarkModeEnabled}
            trackColor={{ false: '#E5E7EB', true: '#6366F1' }}
            thumbColor={darkModeEnabled ? '#FFFFFF' : '#FFFFFF'}
          />
        }
        showArrow={false}
      />

      <SettingItem
        title="Date Format"
        subtitle={currentDateFormat}
        onPress={handleDateFormatPress}
      />

      <SettingItem
        title="First Day of Week"
        subtitle={currentFirstDayOfWeek}
        onPress={handleFirstDayOfWeekPress}
      />
    </Card>
  );
};

const styles = StyleSheet.create({
  section: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.base,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: Spacing.base,
  },
});

export default PreferencesSettings;