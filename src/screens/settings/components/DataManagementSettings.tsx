// src/screens/settings/components/DataManagementSettings.tsx
import React from 'react';
import { Text, StyleSheet, Alert } from 'react-native';
import Card from '../../../components/ui/Card';
import SettingItem from './SettingItem';
import { Spacing } from '../../../theme';

const DataManagementSettings: React.FC = () => {
  const handleExportData = () => {
    Alert.alert(
      'Export Data',
      'This will export all your transactions, accounts, and categories to a CSV file.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Export', onPress: () => { } },
      ]
    );
  };

  const handleImportData = () => {
    Alert.alert(
      'Import Data',
      'This will import transactions from a CSV file. Existing data will not be overwritten.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Import', onPress: () => { } },
      ]
    );
  };

  const handleBackupData = () => {
    Alert.alert(
      'Backup Data',
      'This will create a backup of all your data including attachments.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Backup', onPress: () => { } },
      ]
    );
  };

  const handleRestoreData = () => {
    Alert.alert(
      'Restore Data',
      'This will restore your data from a backup file. Current data will be replaced.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Restore', onPress: () => { } },
      ]
    );
  };

  return (
    <Card style={styles.section} padding="small">
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

export default DataManagementSettings;