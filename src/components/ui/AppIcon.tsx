import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ImageStyle,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '../../app/providers/ThemeProvider';
import LinearGradient from 'react-native-linear-gradient';

interface AppIconProps {
  size?: number;
  showBackground?: boolean;
  style?: ViewStyle;
  iconStyle?: ImageStyle;
}

const AppIcon: React.FC<AppIconProps> = ({
  size = 120,
  showBackground = true,
  style,
  iconStyle,
}) => {
  const { theme } = useTheme();

  // Try to load custom icon, fall back to generated design
  const [useCustomIcon, setUseCustomIcon] = React.useState(true);
  const [imageError, setImageError] = React.useState(false);

  // App icon source - uses generated icon or custom if available
  let iconSource: any;
  try {
    // Try custom icon first
    iconSource = require('../../assets/icon-source.png');
  } catch {
    try {
      // Fall back to generated app icon
      iconSource = require('../assets/app-icon.png');
    } catch {
      // If neither exists, we'll use the default design
      setUseCustomIcon(false);
    }
  }
  
  const handleImageError = () => {
    setImageError(true);
    setUseCustomIcon(false);
  };

  const renderDefaultIcon = () => {
    const styles = StyleSheet.create({
      container: {
        width: size,
        height: size,
        borderRadius: size * 0.125, // 12.5% for rounded corners
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
      } as ViewStyle,
      symbolContainer: {
        width: size * 0.6,
        height: size * 0.6,
        borderRadius: size * 0.3,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
      } as ViewStyle,
      symbol: {
        fontSize: size * 0.35,
        fontWeight: 'bold',
        color: '#FFFFFF',
      } as TextStyle,
    });

    return (
      <View style={[styles.container, style]}>
        {showBackground ? (
          <LinearGradient
            colors={[
              theme.colors.primary[600] || '#1E40AF',
              theme.colors.primary[500] || '#3B82F6',
              theme.colors.primary[400] || '#60A5FA',
            ]}
            style={StyleSheet.absoluteFill}
          />
        ) : null}
        <View style={styles.symbolContainer}>
          <Text style={styles.symbol}>₱</Text>
        </View>
      </View>
    );
  };

  const renderCustomIcon = () => {
    const styles = StyleSheet.create({
      image: {
        width: size,
        height: size,
        borderRadius: showBackground ? size * 0.125 : 0,
      } as ImageStyle,
    });

    return (
      <Image
        source={iconSource}
        style={[styles.image, iconStyle]}
        onError={handleImageError}
        resizeMode="cover"
      />
    );
  };

  // Try to use custom icon first, fall back to default design
  if (useCustomIcon && !imageError) {
    try {
      return (
        <View style={style}>
          {renderCustomIcon()}
        </View>
      );
    } catch (error) {
      // If custom icon fails to load, use default
      return renderDefaultIcon();
    }
  }

  return renderDefaultIcon();
};

export default AppIcon;