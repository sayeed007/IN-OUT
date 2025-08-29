import React from 'react';
import {
    View,
    StyleSheet,
    ViewStyle,
    TouchableOpacity,
    TouchableOpacityProps,
    useColorScheme,
} from 'react-native';
import { useSelector } from 'react-redux';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { RootState } from '../../state/store';

interface CardProps extends TouchableOpacityProps {
    children: React.ReactNode;
    variant?: 'elevated' | 'outlined' | 'filled';
    padding?: 'none' | 'small' | 'medium' | 'large';
    margin?: 'none' | 'small' | 'medium' | 'large';
    borderRadius?: 'small' | 'medium' | 'large' | 'xl';
    pressable?: boolean;
    style?: ViewStyle;
    animatePress?: boolean;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const Card: React.FC<CardProps> = ({
    children,
    variant = 'elevated',
    padding = 'medium',
    margin = 'medium',
    borderRadius = 'medium',
    pressable = false,
    style,
    animatePress = true,
    ...touchableProps
}) => {
    const colorScheme = useColorScheme();
    const theme = useSelector((state: RootState) =>
        state.preferences.theme === 'system' ? colorScheme : state.preferences.theme
    );

    const scale = useSharedValue(1);
    const opacity = useSharedValue(1);

    const isDark = theme === 'dark';

    // Theme colors
    const colors = {
        background: isDark ? '#0A0A0B' : '#FFFFFF',
        surface: isDark ? '#1F1F23' : '#FFFFFF',
        surfaceVariant: isDark ? '#2D2D32' : '#F8F9FA',
        border: isDark ? '#3F3F46' : '#E5E5E7',
        shadow: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.1)',
    };

    // Spacing configurations
    const paddingConfig = {
        none: 0,
        small: 12,
        medium: 16,
        large: 24,
    };

    const marginConfig = {
        none: 0,
        small: 8,
        medium: 12,
        large: 16,
    };

    const radiusConfig = {
        small: 8,
        medium: 12,
        large: 16,
        xl: 20,
    };

    const getVariantStyle = (): ViewStyle => {
        const baseStyle: ViewStyle = {
            backgroundColor: colors.surface,
            borderRadius: radiusConfig[borderRadius],
            padding: paddingConfig[padding],
            margin: marginConfig[margin],
        };

        switch (variant) {
            case 'elevated':
                return {
                    ...baseStyle,
                    ...styles.elevated,
                    shadowColor: colors.shadow,
                    backgroundColor: colors.surface,
                };

            case 'outlined':
                return {
                    ...baseStyle,
                    borderWidth: 1,
                    borderColor: colors.border,
                    backgroundColor: colors.surface,
                };

            case 'filled':
                return {
                    ...baseStyle,
                    backgroundColor: colors.surfaceVariant,
                };

            default:
                return baseStyle;
        }
    };

    const handlePressIn = () => {
        if (animatePress && pressable) {
            scale.value = withSpring(0.98, {
                damping: 15,
                stiffness: 300,
            });
            opacity.value = withTiming(0.8, { duration: 150 });
        }
        touchableProps.onPressIn?.({} as any);
    };

    const handlePressOut = () => {
        if (animatePress && pressable) {
            scale.value = withSpring(1, {
                damping: 15,
                stiffness: 300,
            });
            opacity.value = withTiming(1, { duration: 150 });
        }
        touchableProps.onPressOut?.({} as any);
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
    }));

    if (pressable) {
        return (
            <AnimatedTouchableOpacity
                activeOpacity={0.9}
                style={[
                    getVariantStyle(),
                    animatedStyle,
                    style,
                ]}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                {...touchableProps}
            >
                {children}
            </AnimatedTouchableOpacity>
        );
    }

    return (
        <View style={[getVariantStyle(), style]}>
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    elevated: {
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
});

export default Card;