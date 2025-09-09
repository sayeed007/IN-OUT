import React from 'react';
import {
    StyleSheet,
    TouchableOpacity,
    TouchableOpacityProps,
    View,
    ViewStyle
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../../app/providers/ThemeProvider';

interface CardProps extends TouchableOpacityProps {
    children: React.ReactNode;
    variant?: 'elevated' | 'outlined' | 'filled' | 'normal';
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
    padding = 'small',
    margin = 'none',
    borderRadius = 'small',
    pressable = false,
    style,
    animatePress = true,
    ...touchableProps
}) => {
    const { theme } = useTheme();

    const scale = useSharedValue(1);
    const opacity = useSharedValue(1);



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
            backgroundColor: theme.colors.surface,
            borderRadius: radiusConfig[borderRadius],
            padding: paddingConfig[padding],
            margin: marginConfig[margin],
        };

        switch (variant) {
            case 'elevated':
                return {
                    ...baseStyle,
                    ...styles.elevated,
                    shadowColor: theme.colors.shadow,
                    backgroundColor: theme.colors.surface,
                };

            case 'outlined':
                return {
                    ...baseStyle,
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                    backgroundColor: theme.colors.surface,
                };

            case 'filled':
                return {
                    ...baseStyle,
                    backgroundColor: theme.colors.surfaceVariant,
                };

            case 'normal':
                return {
                    ...baseStyle,
                    backgroundColor: 'transparent',
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