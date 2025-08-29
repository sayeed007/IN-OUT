import React, { useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ViewStyle,
    useColorScheme,
} from 'react-native';
import { useSelector } from 'react-redux';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
    Easing,
} from 'react-native-reanimated';
import { RootState } from '../../state/store';

interface LoadingSpinnerProps {
    size?: 'small' | 'medium' | 'large';
    color?: string;
    message?: string;
    overlay?: boolean;
    style?: ViewStyle;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = 'medium',
    color,
    message,
    overlay = false,
    style,
}) => {
    const colorScheme = useColorScheme();
    const theme = useSelector((state: RootState) =>
        state.preferences.theme === 'system' ? colorScheme : state.preferences.theme
    );

    const rotation = useSharedValue(0);
    const opacity = useSharedValue(0);

    const isDark = theme === 'dark';

    // Theme colors
    const colors = {
        primary: color || '#6366F1',
        text: isDark ? '#FFFFFF' : '#000000',
        textSecondary: isDark ? '#A1A1AA' : '#6B7280',
        overlay: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.9)',
    };

    // Size configurations
    const sizeConfig = {
        small: {
            size: 20,
            strokeWidth: 2,
            fontSize: 12,
        },
        medium: {
            size: 32,
            strokeWidth: 3,
            fontSize: 14,
        },
        large: {
            size: 48,
            strokeWidth: 4,
            fontSize: 16,
        },
    };

    const config = sizeConfig[size];

    useEffect(() => {
        // Start rotation animation
        rotation.value = withRepeat(
            withTiming(360, {
                duration: 1000,
                easing: Easing.linear,
            }),
            -1,
            false
        );

        // Fade in animation
        opacity.value = withTiming(1, { duration: 200 });

        return () => {
            opacity.value = withTiming(0, { duration: 200 });
        };
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${rotation.value}deg` }],
        opacity: opacity.value,
    }));

    const containerAnimatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    const SpinnerComponent = () => (
        <View style={[styles.spinnerContainer, style]}>
            <Animated.View style={[animatedStyle]}>
                <View
                    style={[
                        styles.spinner,
                        {
                            width: config.size,
                            height: config.size,
                            borderWidth: config.strokeWidth,
                            borderColor: `${colors.primary}20`,
                            borderTopColor: colors.primary,
                            borderRadius: config.size / 2,
                        },
                    ]}
                />
            </Animated.View>

            {message && (
                <Text
                    style={[
                        styles.message,
                        {
                            fontSize: config.fontSize,
                            color: colors.textSecondary,
                            marginTop: size === 'small' ? 8 : 12,
                        },
                    ]}
                >
                    {message}
                </Text>
            )}
        </View>
    );

    if (overlay) {
        return (
            <Animated.View style={[styles.overlay, { backgroundColor: colors.overlay }, containerAnimatedStyle]}>
                <SpinnerComponent />
            </Animated.View>
        );
    }

    return <SpinnerComponent />;
};

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    spinnerContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    spinner: {
        borderRadius: 50,
    },
    message: {
        textAlign: 'center',
        fontWeight: '500',
    },
});

export default LoadingSpinner;