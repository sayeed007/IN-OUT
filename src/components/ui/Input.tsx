import React, { forwardRef, useState } from 'react';
import {
    TextInput,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    TextInputProps,
    ViewStyle,
    TextStyle,
    useColorScheme,
    Platform,
} from 'react-native';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
    interpolateColor,
} from 'react-native-reanimated';
import { RootState } from '../../state/store';
import { getTheme } from '../../theme';

interface InputProps extends Omit<TextInputProps, 'style'> {
    label?: string;
    error?: string;
    helperText?: string;
    leftIcon?: string;
    rightIcon?: string;
    onRightIconPress?: () => void;
    containerStyle?: ViewStyle;
    inputStyle?: TextStyle;
    variant?: 'outlined' | 'filled';
    size?: 'small' | 'medium' | 'large';
    required?: boolean;
}

const Input = forwardRef<TextInput, InputProps>(({
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    onRightIconPress,
    containerStyle,
    inputStyle,
    variant = 'outlined',
    size = 'medium',
    required = false,
    ...props
}, ref) => {
    const colorScheme = useColorScheme();
    const themeMode = useSelector((state: RootState) =>
        state.preferences.theme === 'system' ? colorScheme : state.preferences.theme
    );

    const theme = getTheme(themeMode === 'dark' ? 'dark' : 'light');

    const [isFocused, setIsFocused] = useState(false);
    const focusAnimation = useSharedValue(0);

    // Size configurations with better text centering
    const sizeConfig = {
        small: {
            height: 40,
            fontSize: 14,
            paddingHorizontal: 12,
            iconSize: 18,
            labelSize: 12,
            // Platform-specific adjustments for better centering
            paddingVertical: Platform.OS === 'android' ? 8 : 0,
        },
        medium: {
            height: 48,
            fontSize: 16,
            paddingHorizontal: 16,
            iconSize: 20,
            labelSize: 14,
            paddingVertical: Platform.OS === 'android' ? 10 : 0,
        },
        large: {
            height: 56,
            fontSize: 18,
            paddingHorizontal: 20,
            iconSize: 24,
            labelSize: 16,
            paddingVertical: Platform.OS === 'android' ? 14 : 0,
        },
    };

    const config = sizeConfig[size];

    const animatedFontLabel = {
        fontSize: config.labelSize,
        marginBottom: 6,
    };

    const handleFocus = (e: any) => {
        setIsFocused(true);
        focusAnimation.value = withTiming(1, { duration: 200 });
        props.onFocus?.(e);
    };

    const handleBlur = (e: any) => {
        setIsFocused(false);
        focusAnimation.value = withTiming(0, { duration: 200 });
        props.onBlur?.(e);
    };

    const animatedBorderStyle = useAnimatedStyle(() => {
        const borderColor = error
            ? theme.colors.error[500]
            : interpolateColor(
                focusAnimation.value,
                [0, 1],
                [theme.colors.border, theme.colors.primary[500]]
            );

        return {
            borderColor,
            borderWidth: withTiming(focusAnimation.value > 0 ? 2 : 1, { duration: 200 }),
        };
    });

    const animatedLabelStyle = useAnimatedStyle(() => {
        const labelColor = error
            ? theme.colors.error[500]
            : interpolateColor(
                focusAnimation.value,
                [0, 1],
                [theme.colors.textSecondary, theme.colors.primary[500]]
            );

        return {
            color: labelColor,
        };
    });

    const getContainerStyle = (): ViewStyle => {
        const baseStyle: ViewStyle = {
            borderRadius: 12,
            backgroundColor: variant === 'filled' ? theme.colors.surfaceVariant : theme.colors.surface,
            height: config.height,
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: config.paddingHorizontal,
            // Ensure proper alignment
            justifyContent: 'center',
        };

        if (variant === 'outlined') {
            return {
                ...baseStyle,
                borderWidth: 1,
                borderColor: error ? theme.colors.error[500] : theme.colors.border,
            };
        }

        return baseStyle;
    };

    const getTextInputStyle = (): TextStyle => ({
        flex: 1,
        fontSize: config.fontSize,
        color: theme.colors.text,
        // Critical fixes for text centering
        paddingVertical: config.paddingVertical,
        paddingTop: Platform.OS === 'android' ? config.paddingVertical : 0,
        paddingBottom: Platform.OS === 'android' ? config.paddingVertical : 0,
        marginLeft: leftIcon ? 8 : 0,
        marginRight: rightIcon ? 8 : 0,
        textAlignVertical: 'center',
        includeFontPadding: false,
        // Additional Android-specific fixes
        ...(Platform.OS === 'android' && {
            textAlignVertical: 'center',
            height: '100%',
        }),
        // iOS-specific fixes
        ...(Platform.OS === 'ios' && {
            lineHeight: config.fontSize * 1.2,
        }),
        marginTop: 15,
    });

    return (
        <View style={[styles.container, containerStyle]}>
            {label && (
                <Animated.Text style={[
                    styles.label,
                    animatedFontLabel,
                    animatedLabelStyle,
                ]}>
                    {label}
                    {required && (
                        <Text style={{ color: theme.colors.error[500] }}> *</Text>
                    )}
                </Animated.Text>
            )}

            <Animated.View style={[
                getContainerStyle(),
                variant === 'outlined' && animatedBorderStyle,
                isFocused && {
                    ...styles.focused,
                    shadowColor: theme.colors.primary[500],
                },
            ]}>
                {leftIcon && (
                    <Icon
                        name={leftIcon}
                        size={config.iconSize}
                        color={error ? theme.colors.error[500] : isFocused ? theme.colors.primary[500] : theme.colors.textSecondary}
                        style={styles.leftIcon}
                    />
                )}

                <TextInput
                    ref={ref}
                    style={[getTextInputStyle(), inputStyle]}
                    placeholderTextColor={theme.colors.textTertiary}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    // Additional props for better text centering
                    multiline={false}
                    textContentType="none"
                    autoCorrect={false}
                    {...props}
                />

                {rightIcon && (
                    <TouchableOpacity
                        onPress={onRightIconPress}
                        disabled={!onRightIconPress}
                        style={styles.rightIconContainer}
                    >
                        <Icon
                            name={rightIcon}
                            size={config.iconSize}
                            color={error ? theme.colors.error[500] : isFocused ? theme.colors.primary[500] : theme.colors.textSecondary}
                        />
                    </TouchableOpacity>
                )}
            </Animated.View>

            {(error || helperText) && (
                <Text style={[
                    styles.helperText,
                    {
                        color: error ? theme.colors.error[500] : theme.colors.textSecondary,
                        fontSize: config.labelSize,
                    }
                ]}>
                    {error || helperText}
                </Text>
            )}
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        marginVertical: 8,
    },
    label: {
        fontWeight: '600',
    },
    focused: {
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    leftIcon: {
        marginRight: 8,
    },
    rightIconContainer: {
        padding: 4,
        marginLeft: 8,
    },
    helperText: {
        marginTop: 6,
        marginHorizontal: 4,
    },
});

Input.displayName = 'Input';

export default Input;