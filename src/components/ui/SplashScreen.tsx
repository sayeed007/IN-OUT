import React, { useEffect, useRef } from 'react';
import {
  Animated,
  StatusBar,
  StyleSheet,
  Text,
  View
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../../app/providers/ThemeProvider';
import AppIcon from './AppIcon';

interface SplashScreenProps {
  onFinish: () => void;
  duration?: number;
}

const SplashScreen: React.FC<SplashScreenProps> = ({
  onFinish,
  duration = 3000
}) => {
  const { theme } = useTheme();

  // Animation values
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const backgroundOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start animations sequence
    const startAnimations = () => {
      // Background fade in
      Animated.timing(backgroundOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();

      // Logo animation - scale and fade in
      Animated.parallel([
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start();

      // Text fade in after logo
      setTimeout(() => {
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }).start();
      }, 400);

      // Finish splash screen
      setTimeout(() => {
        onFinish();
      }, duration);
    };

    startAnimations();
  }, [logoScale, logoOpacity, textOpacity, backgroundOpacity, onFinish, duration]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.primary[500],
    },
    gradient: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
    },
    logoContainer: {
      alignItems: 'center',
      marginBottom: 40,
    },
    textContainer: {
      alignItems: 'center',
      marginTop: 20,
    },
    appName: {
      fontSize: 28,
      fontWeight: 'bold',
      color: '#FFFFFF',
      marginBottom: 8,
      letterSpacing: 1,
    },
    tagline: {
      fontSize: 16,
      color: 'rgba(255, 255, 255, 0.8)',
      textAlign: 'center',
      fontWeight: '300',
    },
    versionContainer: {
      position: 'absolute',
      bottom: 60,
      alignItems: 'center',
    },
    version: {
      fontSize: 14,
      color: 'rgba(255, 255, 255, 0.6)',
      marginBottom: 4,
    },
    copyright: {
      fontSize: 12,
      color: 'rgba(255, 255, 255, 0.5)',
    },
  });

  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.colors.primary[600]}
        translucent
      />
      <View style={styles.container}>
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { opacity: backgroundOpacity }
          ]}
        >
          <LinearGradient
            colors={[
              theme.colors.primary[600] || '#1E40AF',
              theme.colors.primary[500] || '#3B82F6',
              theme.colors.primary[400] || '#60A5FA',
            ]}
            style={styles.gradient}
          >
            <View style={styles.logoContainer}>
              {/* App Icon/Logo */}
              <Animated.View
                style={[
                  {
                    transform: [{ scale: logoScale }],
                    opacity: logoOpacity,
                  },
                ]}
              >
                <AppIcon size={120} showBackground={false} />
              </Animated.View>

              {/* App Name and Tagline */}
              <Animated.View style={[{ opacity: textOpacity }, styles.textContainer]}>
                <Text style={styles.appName}>FinanceApp</Text>
                <Text style={styles.tagline}>
                  Smart Money Management
                </Text>
              </Animated.View>
            </View>

            {/* Version Info */}
            <Animated.View style={[styles.versionContainer, { opacity: textOpacity }]}>
              <Text style={styles.version}>Version 1.0.0</Text>
              <Text style={styles.copyright}>© 2024 FinanceApp</Text>
            </Animated.View>
          </LinearGradient>
        </Animated.View>
      </View>
    </>
  );
};

export default SplashScreen;