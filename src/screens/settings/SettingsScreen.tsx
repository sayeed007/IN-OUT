// src/screens/settings/SettingsScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeContainer } from '../../components/layout/SafeContainer';
import { Card } from '../../components/ui/Card';
import { Spacing } from '../../theme';

interface SettingItemProps {
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightComponent?: React.ReactNode;
  showArrow?: boolean;
}

const SettingItem: React.FC<SettingItemProps> = ({
  title,
  subtitle,
  onPress,
  rightComponent,
  showArrow = true,
}) => {
  return (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      <View style={styles.settingRight}>
        {rightComponent}
        {showArrow && onPress && (
          <Text style={styles.arrow}>›</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

export const SettingsScreen: React.FC = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  const handleExportData = () => {
    Alert.alert(
      'Export Data',
      'This will export all your transactions, accounts, and categories to a CSV file.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Export', onPress: () => console.log('Export data') },
      ]
    );
  };

  const handleImportData = () => {
    Alert.alert(
      'Import Data',
      'This will import transactions from a CSV file. Existing data will not be overwritten.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Import', onPress: () => console.log('Import data') },
      ]
    );
  };

  const handleBackupData = () => {
    Alert.alert(
      'Backup Data',
      'This will create a backup of all your data including attachments.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Backup', onPress: () => console.log('Backup data') },
      ]
    );
  };

  const handleRestoreData = () => {
    Alert.alert(
      'Restore Data',
      'This will restore your data from a backup file. Current data will be replaced.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Restore', onPress: () => console.log('Restore data') },
      ]
    );
  };

  const handleResetData = () => {
    Alert.alert(
      'Reset All Data',
      'This will permanently delete all your transactions, accounts, and categories. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: () => console.log('Reset data') 
        },
      ]
    );
  };

  return (
    <SafeContainer>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Customize your app experience</Text>
        </View>

        {/* Account Settings */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <SettingItem
            title="Manage Accounts"
            subtitle="Add, edit, or remove accounts"
            onPress={() => console.log('Manage accounts')}
          />
          
          <SettingItem
            title="Manage Categories"
            subtitle="Customize your income and expense categories"
            onPress={() => console.log('Manage categories')}
          />
          
          <SettingItem
            title="Currency"
            subtitle="USD"
            onPress={() => console.log('Change currency')}
          />
        </Card>

        {/* Preferences */}
        <Card style={styles.section}>
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
            subtitle="MM/DD/YYYY"
            onPress={() => console.log('Change date format')}
          />
          
          <SettingItem
            title="First Day of Week"
            subtitle="Sunday"
            onPress={() => console.log('Change first day of week')}
          />
        </Card>

        {/* Data Management */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          
          <SettingItem
            title="Export Data"
            subtitle="Download your data as CSV"
            onPress={handleExportData}
          />
          
          <SettingItem
            title="Import Data"
            subtitle="Import transactions from CSV"
            onPress={handleImportData}
          />
          
          <SettingItem
            title="Backup Data"
            subtitle="Create a backup of all your data"
            onPress={handleBackupData}
          />
          
          <SettingItem
            title="Restore Data"
            subtitle="Restore from a backup file"
            onPress={handleRestoreData}
          />
        </Card>

        {/* About */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          
          <SettingItem
            title="App Version"
            subtitle="1.0.0"
            showArrow={false}
          />
          
          <SettingItem
            title="Terms of Service"
            onPress={() => console.log('Terms of service')}
          />
          
          <SettingItem
            title="Privacy Policy"
            onPress={() => console.log('Privacy policy')}
          />
          
          <SettingItem
            title="Support"
            subtitle="Get help and contact us"
            onPress={() => console.log('Support')}
          />
        </Card>

        {/* Danger Zone */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Danger Zone</Text>
          
          <SettingItem
            title="Reset All Data"
            subtitle="Permanently delete all your data"
            onPress={handleResetData}
            showArrow={false}
          />
        </Card>
      </ScrollView>
    </SafeContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  section: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: Spacing.md,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: Spacing.xs,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  arrow: {
    fontSize: 18,
    color: '#9CA3AF',
    marginLeft: Spacing.sm,
  },
});


