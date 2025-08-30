import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ViewStyle,
    TextStyle,
    ActivityIndicator,
    View,
    useColorScheme,
} from 'react-native';
import { useSelector } from 'react-redux';
import { getTheme, Colors, Shadows, Spacing, Typography } from '../../theme';
import { RootState } from '../../state/store';

export interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'basePrimary' | 'baseSecondary';
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
    const colorScheme = useColorScheme();
    const themeMode = useSelector((state: RootState) =>
        state.preferences.theme === 'system' ? colorScheme : state.preferences.theme
    );

    const theme = getTheme(themeMode === 'dark' ? 'dark' : 'light');

    const handlePress = () => {
        if (!disabled && !loading) {
            onPress();
        }
    };

    const getVariantStyle = (): ViewStyle => {
        switch (variant) {
            case 'basePrimary':
                return {
                    backgroundColor: theme.colors.primary[500],
                    borderColor: 'transparent',
                    ...Shadows.ios.small,
                    ...Shadows.android.small,
                };
            case 'baseSecondary':
                return {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                    borderWidth: 1,
                };
            default:
                return styles[variant as keyof typeof styles] as ViewStyle;
        }
    };

    const getDisabledStyle = (): ViewStyle => {
        switch (variant) {
            case 'basePrimary':
            case 'baseSecondary':
                return {
                    backgroundColor: theme.colors.surfaceVariant,
                    borderColor: theme.colors.border,
                };
            default:
                return styles[`${variant}Disabled` as keyof typeof styles] as ViewStyle;
        }
    };

    const buttonStyle = [
        styles.base,
        getVariantStyle(),
        styles[size],
        fullWidth && styles.fullWidth,
        (disabled || loading) && styles.disabled,
        (disabled || loading) && getDisabledStyle(),
        style,
    ].filter(Boolean);

    const getVariantTextStyle = (): TextStyle => {
        switch (variant) {
            case 'basePrimary':
                return {
                    color: theme.colors.onPrimary,
                    ...Typography.styles.body,
                };
            case 'baseSecondary':
                return {
                    color: theme.colors.text,
                    ...Typography.styles.body,
                };
            default:
                return styles[`${variant}Text` as keyof typeof styles] as TextStyle;
        }
    };

    const getDisabledTextStyle = (): TextStyle => {
        if (variant === 'basePrimary' || variant === 'baseSecondary') {
            return { color: theme.colors.textTertiary };
        }
        return styles[`${variant}TextDisabled` as keyof typeof styles] as TextStyle;
    };

    const textStyleCombined = [
        styles.text,
        getVariantTextStyle(),
        styles[`${size}Text`],
        (disabled || loading) && getDisabledTextStyle(),
        textStyle,
    ].filter(Boolean);

    const renderContent = () => {
        if (loading) {
            return (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator
                        size={size === 'small' ? 'small' : 'small'}
                        color={
                            variant === 'primary' || variant === 'danger' || variant === 'basePrimary'
                                ? Colors.neutral[0]
                                : variant === 'baseSecondary'
                                    ? theme.colors.primary[500]
                                    : Colors.primary[500]
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
        backgroundColor: Colors.primary[500],
        ...Shadows.ios.small,
        ...Shadows.android.small,
    },
    secondary: {
        backgroundColor: Colors.neutral[100],
        borderColor: Colors.neutral[200],
    },
    outline: {
        backgroundColor: 'transparent',
        borderColor: Colors.primary[500],
    },
    ghost: {
        backgroundColor: 'transparent',
    },
    danger: {
        backgroundColor: Colors.error[500],
        ...Shadows.ios.small,
        ...Shadows.android.small,
    },

    // Sizes
    small: {
        paddingHorizontal: Spacing.md, // 16px instead of 8px
        paddingVertical: Spacing.sm,   // 8px instead of 4px
        minHeight: 40,                 // 40px instead of 36px
    },
    medium: {
        paddingHorizontal: Spacing.xl, // 24px instead of 20px
        paddingVertical: Spacing.md,   // 16px instead of 8px
        minHeight: 48,                 // 48px instead of 44px
    },
    large: {
        paddingHorizontal: Spacing['2xl'], // 32px instead of 24px
        paddingVertical: Spacing.lg,       // 20px instead of 16px
        minHeight: 56,                     // 56px instead of 52px
    },

    // Text variants
    text: {
        fontWeight: Typography.weights.semibold,
        textAlign: 'center' as const,
    },
    primaryText: {
        color: Colors.neutral[0],
        ...Typography.styles.body,
    },
    secondaryText: {
        color: Colors.neutral[700],
        ...Typography.styles.body,
    },
    outlineText: {
        color: Colors.primary[500],
        ...Typography.styles.body,
    },
    ghostText: {
        color: Colors.primary[500],
        ...Typography.styles.body,
    },
    dangerText: {
        color: Colors.neutral[0],
        ...Typography.styles.body,
    },

    // Text sizes
    smallText: {
        ...Typography.styles.bodySmall,
    },
    mediumText: {
        ...Typography.styles.body,
    },
    largeText: {
        ...Typography.styles.bodyLarge,
    },

    // Disabled states
    disabled: {
        opacity: 0.6,
    },
    primaryDisabled: {
        backgroundColor: Colors.neutral[300],
    },
    secondaryDisabled: {
        backgroundColor: Colors.neutral[100],
    },
    outlineDisabled: {
        borderColor: Colors.neutral[300],
    },
    ghostDisabled: {},
    dangerDisabled: {
        backgroundColor: Colors.neutral[300],
    },

    // Disabled text
    primaryTextDisabled: {
        color: Colors.neutral[500],
    },
    secondaryTextDisabled: {
        color: Colors.neutral[500],
    },
    outlineTextDisabled: {
        color: Colors.neutral[500],
    },
    ghostTextDisabled: {
        color: Colors.neutral[500],
    },
    dangerTextDisabled: {
        color: Colors.neutral[500],
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

export default Button;