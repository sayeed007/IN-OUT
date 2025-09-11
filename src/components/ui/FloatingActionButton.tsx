import React from 'react';
import {
    TouchableOpacity,
    StyleSheet,
    ViewStyle,
    useColorScheme,
} from 'react-native';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { RootState } from '../../state/store';
import { getTheme } from '../../theme';

interface FloatingActionButtonProps {
    icon: string;
    onPress: () => void;
    size?: 'small' | 'medium' | 'large';
    variant?: 'primary' | 'secondary' | 'surface';
    position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
    style?: ViewStyle;
    disabled?: boolean;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
    icon,
    onPress,
    size = 'medium',
    variant = 'primary',
    position = 'bottom-right',
    style,
    disabled = false,
}) => {
    const colorScheme = useColorScheme();
    const themeMode = useSelector((state: RootState) =>
        state.preferences.theme === 'system' ? colorScheme : state.preferences.theme
    );

    const scale = useSharedValue(1);
    const opacity = useSharedValue(disabled ? 0.5 : 1);

    const theme = getTheme(themeMode === 'dark' ? 'dark' : 'light');
    const colors = {
        ...theme.colors,
        primary: theme.colors.primary[500],
        primaryDark: theme.colors.primary[600],
        textInverse: theme.mode === 'dark' ? theme.colors.neutral[900] : theme.colors.neutral[0],
        shadow: theme.mode === 'dark' ? 'rgba(0,0,0,0.8)' : 'rgba(99, 102, 241, 0.3)',
    };

    // Size configurations
    const sizeConfig = {
        small: {
            size: 40,
            iconSize: 20,
        },
        medium: {
            size: 56,
            iconSize: 24,
        },
        large: {
            size: 64,
            iconSize: 28,
        },
    };

    const config = sizeConfig[size];

    const getVariantStyle = (): ViewStyle => {
        switch (variant) {
            case 'secondary':
                return {
                    backgroundColor: colors.surfaceVariant,
                };
            case 'surface':
                return {
                    backgroundColor: colors.surface,
                };
            default:
                return {
                    backgroundColor: colors.primary,
                };
        }
    };

    const getIconColor = (): string => {
        switch (variant) {
            case 'secondary':
            case 'surface':
                return colors.text;
            default:
                return colors.textInverse;
        }
    };

    const getPositionStyle = (): ViewStyle => {
        const basePosition = {
            position: 'absolute' as const,
            bottom: 40,
        };

        switch (position) {
            case 'bottom-left':
                return {
                    ...basePosition,
                    left: 20,
                };
            case 'bottom-center':
                return {
                    ...basePosition,
                    alignSelf: 'center',
                };
            default:
                return {
                    ...basePosition,
                    right: 20,
                };
        }
    };

    const handlePressIn = () => {
        if (!disabled) {
            scale.value = withSpring(0.9, {
                damping: 15,
                stiffness: 300,
            });
        }
    };

    const handlePressOut = () => {
        if (!disabled) {
            scale.value = withSpring(1, {
                damping: 15,
                stiffness: 300,
            });
        }
    };

    const handlePress = () => {
        if (!disabled) {
            // Quick scale animation for feedback
            scale.value = withSpring(1.1, {
                damping: 15,
                stiffness: 300,
            }, () => {
                scale.value = withSpring(1, {
                    damping: 15,
                    stiffness: 300,
                });
            });

            onPress();
        }
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
    }));

    React.useEffect(() => {
        opacity.value = withTiming(disabled ? 0.5 : 1, { duration: 150 });
    }, [disabled]);

    return (
        <AnimatedTouchableOpacity
            activeOpacity={0.8}
            disabled={disabled}
            onPress={handlePress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={[
                styles.container,
                {
                    width: config.size,
                    height: config.size,
                    borderRadius: config.size / 2,
                },
                getVariantStyle(),
                getPositionStyle(),
                animatedStyle,
                style,
            ]}
        >
            <Icon
                name={icon}
                size={config.iconSize}
                color={getIconColor()}
            />
        </AnimatedTouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
});

export default FloatingActionButton;