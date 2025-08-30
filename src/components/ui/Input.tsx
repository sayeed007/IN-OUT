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
    const theme = useSelector((state: RootState) =>
        state.preferences.theme === 'system' ? colorScheme : state.preferences.theme
    );

    const [isFocused, setIsFocused] = useState(false);
    const focusAnimation = useSharedValue(0);

    const isDark = theme === 'dark';

    // Theme colors
    const colors = {
        primary: '#6366F1',
        primaryLight: '#818CF8',
        success: '#10B981',
        error: '#EF4444',
        background: isDark ? '#0A0A0B' : '#FFFFFF',
        surface: isDark ? '#1F1F23' : '#FFFFFF',
        surfaceVariant: isDark ? '#2D2D32' : '#F5F5F7',
        text: isDark ? '#FFFFFF' : '#000000',
        textSecondary: isDark ? '#A1A1AA' : '#6B7280',
        textTertiary: isDark ? '#71717A' : '#9CA3AF',
        border: isDark ? '#3F3F46' : '#D1D5DB',
        borderFocus: isDark ? '#6366F1' : '#6366F1',
        borderError: isDark ? '#EF4444' : '#EF4444',
    };

    // Size configurations
    const sizeConfig = {
        small: {
            height: 40,
            fontSize: 14,
            paddingHorizontal: 12,
            iconSize: 18,
            labelSize: 12,
        },
        medium: {
            height: 48,
            fontSize: 16,
            paddingHorizontal: 16,
            iconSize: 20,
            labelSize: 14,
        },
        large: {
            height: 56,
            fontSize: 18,
            paddingHorizontal: 20,
            iconSize: 24,
            labelSize: 16,
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
            ? colors.borderError
            : interpolateColor(
                focusAnimation.value,
                [0, 1],
                [colors.border, colors.borderFocus]
            );

        return {
            borderColor,
            borderWidth: withTiming(focusAnimation.value > 0 ? 2 : 1, { duration: 200 }),
        };
    });

    const animatedLabelStyle = useAnimatedStyle(() => {
        const labelColor = error
            ? colors.borderError
            : interpolateColor(
                focusAnimation.value,
                [0, 1],
                [colors.textSecondary, colors.primary]
            );

        return {
            color: labelColor,
        };
    });

    const getContainerStyle = (): ViewStyle => {
        const baseStyle: ViewStyle = {
            borderRadius: 12,
            backgroundColor: variant === 'filled' ? colors.surfaceVariant : colors.surface,
            height: config.height,
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: config.paddingHorizontal,
        };

        if (variant === 'outlined') {
            return {
                ...baseStyle,
                borderWidth: 1,
                borderColor: error ? colors.borderError : colors.border,
            };
        }

        return baseStyle;
    };

    const getTextInputStyle = (): TextStyle => ({
        flex: 1,
        fontSize: config.fontSize,
        color: colors.text,
        paddingVertical: 0,
        marginLeft: leftIcon ? 8 : 0,
        marginRight: rightIcon ? 8 : 0,
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
                        <Text style={{ color: colors.error }}> *</Text>
                    )}
                </Animated.Text>
            )}

            <Animated.View style={[
                getContainerStyle(),
                variant === 'outlined' && animatedBorderStyle,
                isFocused && styles.focused,
            ]}>
                {leftIcon && (
                    <Icon
                        name={leftIcon}
                        size={config.iconSize}
                        color={error ? colors.borderError : isFocused ? colors.primary : colors.textSecondary}
                    />
                )}

                <TextInput
                    ref={ref}
                    style={[getTextInputStyle(), inputStyle]}
                    placeholderTextColor={colors.textTertiary}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
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
                            color={error ? colors.borderError : isFocused ? colors.primary : colors.textSecondary}
                        />
                    </TouchableOpacity>
                )}
            </Animated.View>

            {(error || helperText) && (
                <Text style={[
                    styles.helperText,
                    {
                        color: error ? colors.error : colors.textSecondary,
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
        shadowColor: '#6366F1',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    rightIconContainer: {
        padding: 4,
    },
    helperText: {
        marginTop: 6,
        marginHorizontal: 4,
    },
});

Input.displayName = 'Input';

export default Input;