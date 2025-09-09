import React from 'react';
import {
    StyleSheet,
    Text,
    TextStyle,
    TouchableOpacity,
    useColorScheme,
    ViewStyle
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux';
import { RootState } from '../../state/store';

interface ChipProps {
    label: string;
    selected?: boolean;
    disabled?: boolean;
    variant?: 'default' | 'outlined' | 'filled';
    size?: 'small' | 'medium' | 'large';
    color?: string;
    icon?: string;
    onPress?: () => void;
    onDelete?: () => void;
    style?: ViewStyle;
    textStyle?: TextStyle;
    deletable?: boolean;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const Chip: React.FC<ChipProps> = ({
    label,
    selected = false,
    disabled = false,
    variant = 'default',
    size = 'medium',
    color,
    icon,
    onPress,
    onDelete,
    style,
    textStyle,
    deletable = false,
}) => {
    const colorScheme = useColorScheme();
    const theme = useSelector((state: RootState) =>
        state.preferences.theme === 'system' ? colorScheme : state.preferences.theme
    );

    const scale = useSharedValue(1);
    const opacity = useSharedValue(disabled ? 0.5 : 1);

    const isDark = theme === 'dark';

    // Theme colors
    const colors = {
        primary: color || '#6366F1',
        primaryLight: '#818CF8',
        background: isDark ? '#0A0A0B' : '#FFFFFF',
        surface: isDark ? '#1F1F23' : '#FFFFFF',
        surfaceVariant: isDark ? '#2D2D32' : '#F5F5F7',
        text: isDark ? '#FFFFFF' : '#000000',
        textSecondary: isDark ? '#A1A1AA' : '#6B7280',
        textInverse: isDark ? '#000000' : '#FFFFFF',
        border: isDark ? '#3F3F46' : '#E5E5E7',
    };

    // Size configurations
    const sizeConfig = {
        small: {
            height: 24,
            paddingHorizontal: 8,
            fontSize: 11,
            iconSize: 14,
            borderRadius: 12,
        },
        medium: {
            height: 32,
            paddingHorizontal: 12,
            fontSize: 13,
            iconSize: 16,
            borderRadius: 16,
        },
        large: {
            height: 40,
            paddingHorizontal: 16,
            fontSize: 14,
            iconSize: 18,
            borderRadius: 20,
        },
    };

    const config = sizeConfig[size];

    const getChipStyle = (): ViewStyle => {
        let backgroundColor = colors.surfaceVariant;
        let borderWidth = 0;
        let borderColor = 'transparent';

        if (selected) {
            backgroundColor = colors.primary;
        } else {
            switch (variant) {
                case 'outlined':
                    backgroundColor = 'transparent';
                    borderWidth = 1;
                    borderColor = colors.border;
                    break;
                case 'filled':
                    backgroundColor = colors.surfaceVariant;
                    break;
                default:
                    backgroundColor = colors.surfaceVariant;
                    break;
            }
        }

        return {
            height: config.height,
            paddingHorizontal: config.paddingHorizontal,
            borderRadius: config.borderRadius,
            backgroundColor,
            borderWidth,
            borderColor,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
        };
    };

    const getTextColor = (): string => {
        if (disabled) {
            return colors.textSecondary;
        }

        if (selected) {
            return colors.textInverse;
        }

        if (variant === 'outlined') {
            return colors.text;
        }

        return colors.text;
    };

    const handlePressIn = () => {
        if (!disabled) {
            scale.value = withSpring(0.95, {
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
        if (!disabled && onPress) {
            onPress();
        }
    };

    const handleDelete = () => {
        if (!disabled && onDelete) {
            onDelete();
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
                getChipStyle(),
                animatedStyle,
                style,
            ]}
        >
            {icon && (
                <Icon
                    name={icon}
                    size={config.iconSize}
                    color={getTextColor()}
                    style={styles.iconMargin}
                />
            )}

            <Text
                style={[
                    styles.text,
                    {
                        fontSize: config.fontSize,
                        color: getTextColor(),
                    },
                    textStyle,
                ]}
                numberOfLines={1}
            >
                {label}
            </Text>

            {deletable && onDelete && (
                <TouchableOpacity
                    onPress={handleDelete}
                    style={styles.deleteButton}
                    hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
                >
                    <Icon
                        name="close"
                        size={config.iconSize - 2}
                        color={getTextColor()}
                    />
                </TouchableOpacity>
            )}
        </AnimatedTouchableOpacity>
    );
};

const styles = StyleSheet.create({
    text: {
        fontWeight: '500',
        textAlign: 'center',
    },
    deleteButton: {
        marginLeft: 6,
        padding: 2,
    },
    iconMargin: {
        marginRight: 6
    }
});

export default Chip;