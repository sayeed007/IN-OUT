// src/screens/settings/components/DangerZoneSettings.tsx
import React from 'react';
import { Text, StyleSheet, Alert } from 'react-native';
import Card from '../../../components/ui/Card';
import SettingItem from './SettingItem';
import { Colors, Spacing } from '../../../theme';

const DangerZoneSettings: React.FC = () => {
  const handleResetData = () => {
    Alert.alert(
      'Reset All Data',
      'This will permanently delete all your transactions, accounts, and categories. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            // Additional confirmation
            Alert.alert(
              'Are you absolutely sure?',
              'This action cannot be undone. All your financial data will be permanently deleted.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete Everything',
                  style: 'destructive',
                  onPress: () => {
                    console.log('Performing data reset...');
                    // Here you would implement the actual data reset logic
                  }
                },
              ]
            );
          }
        },
      ]
    );
  };

  return (
    <Card style={styles.section} padding="small">
      <Text style={styles.sectionTitle}>Danger Zone</Text>

      <SettingItem
        title="Reset All Data"
        subtitle="Permanently delete all your data"
        onPress={handleResetData}
        showArrow={false}
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
    color: Colors.error[500],
    marginBottom: Spacing.base,
  },
});

export default DangerZoneSettings;