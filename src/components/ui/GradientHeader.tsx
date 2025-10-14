// src/components/ui/GradientHeader.tsx
import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../../app/providers/ThemeProvider';

interface GradientHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightElement?: React.ReactNode;
  rightText?: string;
  onRightPress?: () => void;
  rightIcon?: string;
  gradientColors?: string[];
}

export const GradientHeader: React.FC<GradientHeaderProps> = ({
  title,
  subtitle,
  showBackButton = true,
  onBackPress,
  rightElement,
  rightText,
  onRightPress,
  rightIcon,
  gradientColors,
}) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const defaultGradientColors = [
    theme.colors.primary[600],
    theme.colors.primary[500],
    theme.colors.primary[400],
  ];

  const colors = gradientColors || defaultGradientColors;

  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors[0]}
      />
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.gradientHeader, { paddingTop: insets.top + 12 }]}
      >
        <View style={styles.headerContent}>
          {/* Left: Back Button */}
          {showBackButton ? (
            <TouchableOpacity
              style={styles.backButton}
              onPress={onBackPress}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Icon name="chevron-back" size={28} color={theme.colors.onPrimary} />
            </TouchableOpacity>
          ) : (
            <View style={styles.headerLeft} />
          )}

          {/* Center: Title & Subtitle */}
          <View style={styles.headerTitleContainer}>
            <Text style={[styles.headerTitle, { color: theme.colors.onPrimary }]}>
              {title}
            </Text>
            {subtitle && (
              <Text style={[styles.headerSubtitle, { color: theme.colors.onPrimary + 'CC' }]}>
                {subtitle}
              </Text>
            )}
          </View>

          {/* Right: Custom Element or Action */}
          {rightElement ? (
            <View style={styles.headerRight}>{rightElement}</View>
          ) : rightText || rightIcon ? (
            <TouchableOpacity
              style={styles.headerRightButton}
              onPress={onRightPress}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              {rightIcon && (
                <Icon name={rightIcon} size={24} color={theme.colors.onPrimary} />
              )}
              {rightText && (
                <Text style={[styles.headerRightText, { color: theme.colors.onPrimary }]}>
                  {rightText}
                </Text>
              )}
            </TouchableOpacity>
          ) : (
            <View style={styles.headerRight} />
          )}
        </View>
      </LinearGradient>
    </>
  );
};

const styles = StyleSheet.create({
  gradientHeader: {
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerLeft: {
    width: 44,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  headerRight: {
    width: 44,
  },
  headerRightButton: {
    padding: 8,
    marginRight: -8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerRightText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
