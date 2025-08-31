import React from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle,
    useColorScheme,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../state/store';
import { getTheme } from '../../theme';

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

    const getButtonStyles = (): ViewStyle[] => {
        const baseStyle: ViewStyle = {
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
            borderWidth: 1,
        };

        const sizeStyle = StyleSheet.flatten([
            size === 'small' && styles.small,
            size === 'medium' && styles.medium,
            size === 'large' && styles.large,
        ]);

        let variantStyle: ViewStyle = {};

        if (disabled || loading) {
            variantStyle = {
                backgroundColor: theme.colors.surfaceVariant,
                borderColor: theme.colors.border,
                opacity: 0.6,
            };
        } else {
            switch (variant) {
                case 'primary':
                    variantStyle = {
                        backgroundColor: theme.colors.primary[500],
                        borderColor: theme.colors.primary[500],
                        ...theme.shadows.ios.small,
                        ...theme.shadows.android.small,
                    };
                    break;
                case 'secondary':
                    variantStyle = {
                        backgroundColor: theme.colors.surface,
                        borderColor: theme.colors.border,
                    };
                    break;
                case 'outline':
                    variantStyle = {
                        backgroundColor: 'transparent',
                        borderColor: theme.colors.primary[500],
                    };
                    break;
                case 'ghost':
                    variantStyle = {
                        backgroundColor: 'transparent',
                        borderColor: 'transparent',
                    };
                    break;
                case 'danger':
                    variantStyle = {
                        backgroundColor: theme.colors.error[500],
                        borderColor: theme.colors.error[500],
                        ...theme.shadows.ios.small,
                        ...theme.shadows.android.small,
                    };
                    break;
            }
        }

        const dynamicStyles = [baseStyle, sizeStyle, variantStyle];

        if (fullWidth) dynamicStyles.push(styles.fullWidth);
        if (style) dynamicStyles.push(style);

        return dynamicStyles;
    };

    const getTextStyles = (): TextStyle[] => {
        const baseTextStyle: TextStyle = {
            fontWeight: '600',
            textAlign: 'center',
            includeFontPadding: false,
        };

        const sizeTextStyle = StyleSheet.flatten([
            size === 'small' && styles.smallText,
            size === 'medium' && styles.mediumText,
            size === 'large' && styles.largeText,
        ]);

        let colorStyle: TextStyle = {};

        if (disabled || loading) {
            colorStyle = {
                color: theme.colors.textTertiary,
            };
        } else {
            switch (variant) {
                case 'primary':
                    colorStyle = {
                        color: theme.colors.onPrimary,
                    };
                    break;
                case 'secondary':
                    colorStyle = {
                        color: theme.colors.text,
                    };
                    break;
                case 'outline':
                case 'ghost':
                    colorStyle = {
                        color: theme.colors.primary[500],
                    };
                    break;
                case 'danger':
                    colorStyle = {
                        color: theme.colors.onError,
                    };
                    break;
            }
        }

        const dynamicTextStyles = [baseTextStyle, sizeTextStyle, colorStyle];

        if (textStyle) dynamicTextStyles.push(textStyle);

        return dynamicTextStyles;
    };

    const getActivityIndicatorColor = (): string => {
        if (disabled) return theme.colors.textTertiary;

        switch (variant) {
            case 'primary':
                return theme.colors.onPrimary;
            case 'danger':
                return theme.colors.onError;
            case 'secondary':
                return theme.colors.text;
            case 'outline':
            case 'ghost':
                return theme.colors.primary[500];
            default:
                return theme.colors.onPrimary;
        }
    };

    const renderContent = () => {
        if (loading) {
            return (
                <View style={styles.contentContainer}>
                    <ActivityIndicator
                        size="small"
                        color={getActivityIndicatorColor()}
                    />
                    <Text style={getTextStyles().concat(styles.loadingText)}>
                        {title}
                    </Text>
                </View>
            );
        }

        return (
            <View style={styles.contentContainer}>
                {icon && iconPosition === 'left' && (
                    <View style={[styles.icon, styles.iconLeft]}>{icon}</View>
                )}
                <Text style={getTextStyles()}>{title}</Text>
                {icon && iconPosition === 'right' && (
                    <View style={[styles.icon, styles.iconRight]}>{icon}</View>
                )}
            </View>
        );
    };

    return (
        <TouchableOpacity
            style={getButtonStyles()}
            onPress={handlePress}
            disabled={disabled || loading}
            activeOpacity={0.7}
            testID={testID}
            accessibilityRole="button"
            accessibilityLabel={loading ? `Loading ${title}` : title}
            accessibilityHint={loading ? "Button is loading, please wait" : undefined}
            accessibilityState={{
                disabled: disabled || loading,
                busy: loading
            }}
        >
            {renderContent()}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    // Sizes
    small: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        minHeight: 40,
    },
    medium: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        minHeight: 48,
    },
    large: {
        paddingHorizontal: 32,
        paddingVertical: 16,
        minHeight: 56,
    },

    // Text sizes with explicit values
    smallText: {
        fontSize: 14,
        lineHeight: 20,
    },
    mediumText: {
        fontSize: 16,
        lineHeight: 24,
    },
    largeText: {
        fontSize: 18,
        lineHeight: 28,
    },

    // Layout
    fullWidth: {
        width: '100%',
    },
    contentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    loadingText: {
        marginLeft: 8,
    },
    icon: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconLeft: {
        marginRight: 8,
    },
    iconRight: {
        marginLeft: 8,
    },
});

export default Button