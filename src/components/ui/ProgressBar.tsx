import React, { useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ViewStyle,
    useColorScheme,
} from 'react-native';
import Animated, {
    interpolateColor,
    useAnimatedStyle,
    useSharedValue,
    withSpring
} from 'react-native-reanimated';
import { useSelector } from 'react-redux';
import { RootState } from '../../state/store';

interface ProgressBarProps {
    progress: number; // 0-100
    height?: number;
    color?: string;
    backgroundColor?: string;
    borderRadius?: number;
    showLabel?: boolean;
    label?: string;
    showPercentage?: boolean;
    animated?: boolean;
    containerStyle?: ViewStyle;
    variant?: 'default' | 'success' | 'warning' | 'error';
}

const ProgressBar: React.FC<ProgressBarProps> = ({
    progress,
    height = 8,
    color,
    backgroundColor,
    borderRadius,
    showLabel = false,
    label,
    showPercentage = false,
    animated = true,
    containerStyle,
    variant = 'default',
}) => {
    const colorScheme = useColorScheme();
    const theme = useSelector((state: RootState) =>
        state.preferences.theme === 'system' ? colorScheme : state.preferences.theme
    );

    const progressAnimation = useSharedValue(0);
    const isDark = theme === 'dark';

    // Theme colors
    const colors = {
        primary: '#6366F1',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        background: isDark ? '#3F3F46' : '#E5E5E7',
        text: isDark ? '#FFFFFF' : '#000000',
        textSecondary: isDark ? '#A1A1AA' : '#6B7280',
    };

    const getVariantColor = () => {
        switch (variant) {
            case 'success': return colors.success;
            case 'warning': return colors.warning;
            case 'error': return colors.error;
            default: return colors.primary;
        }
    };

    const progressColor = color || getVariantColor();
    const trackColor = backgroundColor || colors.background;
    const radius = borderRadius !== undefined ? borderRadius : height / 2;

    useEffect(() => {
        const clampedProgress = Math.min(Math.max(progress, 0), 100);

        if (animated) {
            progressAnimation.value = withSpring(clampedProgress, {
                damping: 15,
                stiffness: 150,
            });
        } else {
            progressAnimation.value = clampedProgress;
        }
    }, [progress, animated]);

    const progressStyle = useAnimatedStyle(() => {
        const width = `${progressAnimation.value}%`;

        // Color transitions for different progress levels
        const dynamicColor = variant === 'default'
            ? interpolateColor(
                progressAnimation.value,
                [0, 50, 80, 100],
                ['#EF4444', '#F59E0B', '#10B981', '#059669']
            )
            : progressColor;

        return {
            width,
            backgroundColor: color || dynamicColor,
        };
    });

    const getProgressText = () => {
        if (showPercentage && showLabel && label) {
            return `${label} ${Math.round(progress)}%`;
        } else if (showPercentage) {
            return `${Math.round(progress)}%`;
        } else if (showLabel && label) {
            return label;
        }
        return null;
    };

    return (
        <View style={[styles.container, containerStyle]}>
            {(showLabel || showPercentage) && (
                <View style={styles.labelContainer}>
                    <Text style={[styles.label, { color: colors.text }]}>
                        {getProgressText()}
                    </Text>
                </View>
            )}

            <View
                style={[
                    styles.track,
                    {
                        height,
                        backgroundColor: trackColor,
                        borderRadius: radius,
                    },
                ]}
            >
                <Animated.View
                    style={[
                        styles.progress,
                        {
                            height,
                            borderRadius: radius,
                        },
                        progressStyle,
                    ]}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    labelContainer: {
        marginBottom: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
    },
    track: {
        overflow: 'hidden',
    },
    progress: {
        borderRadius: 4,
    },
});

export default ProgressBar;