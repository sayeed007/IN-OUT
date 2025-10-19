// src/screens/settings/SettingItem.tsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Spacing } from '../../../theme';
import { useTheme } from '../../../app/providers/ThemeProvider';

interface SettingItemProps {
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightComponent?: React.ReactNode;
  showArrow?: boolean;
  disabled?: boolean;
}

const SettingItem: React.FC<SettingItemProps> = ({
  title,
  subtitle,
  onPress,
  rightComponent,
  showArrow = true,
  disabled = false,
}) => {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    settingItem: {
      flexDirection: 'row',
      alignContent: 'center',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: Spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      opacity: disabled ? 0.5 : 1,
    },
    settingContent: {
      flex: 1,
    },
    settingTitle: {
      fontSize: 16,
      fontWeight: '500',
      color: theme.colors.text,
      marginBottom: Spacing.xs,
    },
    settingSubtitle: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    settingRight: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    arrow: {
      marginLeft: Spacing.sm,
    },
  });

  return (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      disabled={disabled || !onPress}
      activeOpacity={onPress && !disabled ? 0.7 : 1}
    >
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      <View style={styles.settingRight}>
        {rightComponent}
        {showArrow && onPress && (
          <Icon name="chevron-forward" size={18} color={theme.colors.textSecondary} style={styles.arrow} />
        )}
      </View>
    </TouchableOpacity>
  );
};


export default SettingItem;