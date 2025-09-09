// src/screens/settings/SettingsScreen.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeContainer } from '../../components/layout/SafeContainer';
import { Spacing } from '../../theme';
import { useTheme } from '../../app/providers/ThemeProvider';
import AccountSettings from './components/AccountSettings';
import PreferencesSettings from './components/PreferencesSettings';
import DataManagementSettings from './components/DataManagementSettings';
import AboutSettings from './components/AboutSettings';
import DangerZoneSettings from './components/DangerZoneSettings';
import BottomSpacing from '../../components/ui/BottomSpacing';

export const SettingsScreen: React.FC = () => {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      paddingHorizontal: Spacing.base,
      paddingVertical: Spacing.base,
    },
    title: {
      fontSize: 32,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: Spacing.xs,
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.textSecondary,
    },
  });

  return (
    <SafeContainer>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Customize your app experience</Text>
        </View>

        {/* Account Settings */}
        <AccountSettings />

        {/* Preferences */}
        <PreferencesSettings />

        {/* Data Management */}
        <DataManagementSettings />

        {/* About */}
        <AboutSettings />

        {/* Danger Zone */}
        <DangerZoneSettings />

        {/* Bottom spacing for tab bar */}
        <BottomSpacing />
      </ScrollView>
    </SafeContainer>
  );
};



