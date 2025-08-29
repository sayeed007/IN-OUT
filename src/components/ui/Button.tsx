import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ViewStyle,
    TextStyle,
    ActivityIndicator,
    View,
} from 'react-native';
import { Colors, Shadows, Spacing, Typography } from '../../theme';

export interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'small' | 'medium' | 'large';
    disabled?: boolean;
    loading?: boolean;
    icon?: React.ReactNode;
    iconPosition?: 'left' | 'right';
    fullWidth?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
    testID?: string;
}

export const Button: React.FC<ButtonProps> = ({
    title,
    onPress,
    variant = 'primary',
    size = 'medium',
    disabled = false,
    loading = false,
    icon,
    iconPosition = 'left',
    fullWidth = false,
    style,
    textStyle,
    testID,
}) => {
    const handlePress = () => {
        if (!disabled && !loading) {
            onPress();
        }
    };

    const buttonStyle: ViewStyle = [
        styles.base,
        styles[variant],
        styles[size],
        fullWidth && styles.fullWidth,
        (disabled || loading) && styles.disabled,
        (disabled || loading) && styles[`${variant}Disabled`],
        style,
    ];

    const textStyleCombined: TextStyle = [
        styles.text,
        styles[`${variant}Text`],
        styles[`${size}Text`],
        (disabled || loading) && styles[`${variant}TextDisabled`],
        textStyle,
    ];

    const renderContent = () => {
        if (loading) {
            return (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator
                        size={size === 'small' ? 'small' : 'small'}
                        color={
                            variant === 'primary' || variant === 'danger'
                                ? Colors.white
                                : Colors.primary500
                        }
                    />
                    <Text style={[textStyleCombined, styles.loadingText]}>{title}</Text>
                </View>
            );
        }

        return (
            <View style={styles.contentContainer}>
                {icon && iconPosition === 'left' && (
                    <View style={[styles.icon, styles.iconLeft]}>{icon}</View>
                )}
                <Text style={textStyleCombined}>{title}</Text>
                {icon && iconPosition === 'right' && (
                    <View style={[styles.icon, styles.iconRight]}>{icon}</View>
                )}
            </View>
        );
    };

    return (
        <TouchableOpacity
            style={buttonStyle}
            onPress={handlePress}
            disabled={disabled || loading}
            activeOpacity={0.8}
            testID={testID}
            accessibilityRole="button"
            accessibilityLabel={title}
            accessibilityState={{ disabled: disabled || loading }}
        >
            {renderContent()}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    base: {
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: 'transparent',
    },

    // Variants
    primary: {
        backgroundColor: Colors.primary500,
        ...Shadows.small,
    },
    secondary: {
        backgroundColor: Colors.gray100,
        borderColor: Colors.gray200,
    },
    outline: {
        backgroundColor: 'transparent',
        borderColor: Colors.primary500,
    },
    ghost: {
        backgroundColor: 'transparent',
    },
    danger: {
        backgroundColor: Colors.error500,
        ...Shadows.small,
    },

    // Sizes
    small: {
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        minHeight: 36,
    },
    medium: {
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.sm,
        minHeight: 44,
    },
    large: {
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.md,
        minHeight: 52,
    },

    // Text variants
    text: {
        fontWeight: '600',
        textAlign: 'center',
    },
    primaryText: {
        color: Colors.white,
        ...Typography.body,
    },
    secondaryText: {
        color: Colors.gray700,
        ...Typography.body,
    },
    outlineText: {
        color: Colors.primary500,
        ...Typography.body,
    },
    ghostText: {
        color: Colors.primary500,
        ...Typography.body,
    },
    dangerText: {
        color: Colors.white,
        ...Typography.body,
    },

    // Text sizes
    smallText: {
        ...Typography.bodySmall,
    },
    mediumText: {
        ...Typography.body,
    },
    largeText: {
        ...Typography.bodyLarge,
    },

    // Disabled states
    disabled: {
        opacity: 0.6,
    },
    primaryDisabled: {
        backgroundColor: Colors.gray300,
    },
    secondaryDisabled: {
        backgroundColor: Colors.gray100,
    },
    outlineDisabled: {
        borderColor: Colors.gray300,
    },
    ghostDisabled: {},
    dangerDisabled: {
        backgroundColor: Colors.gray300,
    },

    // Disabled text
    primaryTextDisabled: {
        color: Colors.gray500,
    },
    secondaryTextDisabled: {
        color: Colors.gray500,
    },
    outlineTextDisabled: {
        color: Colors.gray500,
    },
    ghostTextDisabled: {
        color: Colors.gray500,
    },
    dangerTextDisabled: {
        color: Colors.gray500,
    },

    // Layout
    fullWidth: {
        width: '100%',
    },

    // Content
    contentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        marginLeft: Spacing.xs,
    },

    // Icons
    icon: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconLeft: {
        marginRight: Spacing.xs,
    },
    iconRight: {
        marginLeft: Spacing.xs,
    },
});