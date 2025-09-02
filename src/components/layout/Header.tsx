import React from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

interface HeaderProps {
  title: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightAction?: {
    icon: string;
    onPress: () => void;
  };
  backgroundColor?: string;
  textColor?: string;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showBackButton = false,
  onBackPress,
  rightAction,
  backgroundColor = '#FFFFFF',
  textColor = '#111827',
}) => {

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <StatusBar
        barStyle={backgroundColor === '#FFFFFF' ? 'dark-content' : 'light-content'}
        backgroundColor={backgroundColor}
      />

      <View style={styles.header}>
        {/* Left Side - Back Button */}
        <View style={styles.leftContainer}>
          {showBackButton && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={onBackPress}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Icon name="chevron-back" size={24} color={textColor} />
            </TouchableOpacity>
          )}
        </View>

        {/* Center - Title */}
        <View style={styles.centerContainer}>
          <Text style={[styles.title, { color: textColor }]} numberOfLines={1}>
            {title}
          </Text>
        </View>

        {/* Right Side - Action Button */}
        <View style={styles.rightContainer}>
          {rightAction && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={rightAction.onPress}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Icon name={rightAction.icon} size={24} color={textColor} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 4,
    minHeight: 48,
  },
  leftContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  centerContainer: {
    flex: 2,
    alignItems: 'center',
  },
  rightContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  actionButton: {
    padding: 8,
    marginRight: -8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default Header;
