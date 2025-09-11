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
import { getTheme } from '../../theme';

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
    const themeMode = useSelector((state: RootState) =>
        state.preferences.theme === 'system' ? colorScheme : state.preferences.theme
    );

    const progressAnimation = useSharedValue(0);
    const theme = getTheme(themeMode === 'dark' ? 'dark' : 'light');
    const colors = theme.colors;

    const getVariantColor = () => {
        switch (variant) {
            case 'success': return colors.success[500];
            case 'warning': return colors.warning[500];
            case 'error': return colors.error[500];
            default: return colors.primary[500];
        }
    };

    const progressColor = color || getVariantColor();
    const trackColor = backgroundColor || colors.border;
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
        const width = `${progressAnimation.value}%` as const;

        // Color transitions for different progress levels
        const dynamicColor = variant === 'default'
            ? interpolateColor(
                progressAnimation.value,
                [0, 50, 80, 100],
                [colors.error[500], colors.warning[500], colors.success[500], colors.success[600]]
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