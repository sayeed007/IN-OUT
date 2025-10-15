// src/screens/settings/components/AboutSettings.tsx
import React from 'react';
import { StyleSheet, Text } from 'react-native';
import Card from '../../../components/ui/Card';
import { Spacing } from '../../../theme';
import SettingItem from './SettingItem';
import { showToast } from '../../../utils/helpers/toast';

const AboutSettings: React.FC = () => {
  const appVersion = '1.0.0';

  const handleTermsPress = () => {
    // In a real app, you'd open the actual terms URL
    // Linking.openURL('https://yourapp.com/terms');
    showToast.info('Terms of Service will be available soon');
  };

  const handlePrivacyPress = () => {
    // In a real app, you'd open the actual privacy URL
    // Linking.openURL('https://yourapp.com/privacy');
    showToast.info('Privacy Policy will be available soon');
  };

  const handleSupportPress = () => {
    // In a real app, you'd navigate to support options
    // Linking.openURL('mailto:support@yourapp.com');
    // Or navigate to FAQ screen
    showToast.info('Support options will be available soon');
  };

  return (
    <Card style={styles.section} padding="small">
      <Text style={styles.sectionTitle}>About</Text>

      <SettingItem
        title="App Version"
        subtitle={appVersion}
        showArrow={false}
      />

      <SettingItem
        title="Terms of Service"
        onPress={handleTermsPress}
      />

      <SettingItem
        title="Privacy Policy"
        onPress={handlePrivacyPress}
      />

      <SettingItem
        title="Support"
        subtitle="Get help and contact us"
        onPress={handleSupportPress}
      />
    </Card>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: Spacing.base,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: Spacing.base,
  },
});

export default AboutSettings;