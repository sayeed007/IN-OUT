// src/screens/settings/components/AboutSettings.tsx
import React from 'react';
import { Text, StyleSheet, Alert, Linking } from 'react-native';
import Card from '../../../components/ui/Card';
import SettingItem from './SettingItem';
import { Spacing } from '../../../theme';

const AboutSettings: React.FC = () => {
  const appVersion = '1.0.0';

  const handleTermsPress = () => {
    Alert.alert(
      'Terms of Service',
      'Open terms of service in browser?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Open', 
          onPress: () => {
            // In a real app, you'd open the actual terms URL
            console.log('Opening Terms of Service');
            // Linking.openURL('https://yourapp.com/terms');
          }
        },
      ]
    );
  };

  const handlePrivacyPress = () => {
    Alert.alert(
      'Privacy Policy',
      'Open privacy policy in browser?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Open', 
          onPress: () => {
            // In a real app, you'd open the actual privacy URL
            console.log('Opening Privacy Policy');
            // Linking.openURL('https://yourapp.com/privacy');
          }
        },
      ]
    );
  };

  const handleSupportPress = () => {
    Alert.alert(
      'Support',
      'Choose support option',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Email Support', 
          onPress: () => {
            console.log('Opening email support');
            // Linking.openURL('mailto:support@yourapp.com');
          }
        },
        { 
          text: 'FAQ', 
          onPress: () => {
            console.log('Opening FAQ');
            // Navigate to FAQ screen or open FAQ URL
          }
        },
      ]
    );
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

export default AboutSettings;