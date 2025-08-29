import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ViewStyle,
    useColorScheme,
} from 'react-native';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
// import Button from './Button';
import { RootState } from '../../state/store';
import { Button } from './Button';

interface EmptyStateProps {
    icon?: string;
    title: string;
    description?: string;
    actionLabel?: string;
    onActionPress?: () => void;
    style?: ViewStyle;
    size?: 'small' | 'medium' | 'large';
}

const EmptyState: React.FC<EmptyStateProps> = ({
    icon,
    title,
    description,
    actionLabel,
    onActionPress,
    style,
    size = 'medium',
}) => {
    const colorScheme = useColorScheme();
    const theme = useSelector((state: RootState) =>
        state.preferences.theme === 'system' ? colorScheme : state.preferences.theme
    );

    const isDark = theme === 'dark';

    // Theme colors
    const colors = {
        text: isDark ? '#FFFFFF' : '#000000',
        textSecondary: isDark ? '#A1A1AA' : '#6B7280',
        textTertiary: isDark ? '#71717A' : '#9CA3AF',
        primary: '#6366F1',
    };

    // Size configurations
    const sizeConfig = {
        small: {
            iconSize: 48,
            titleSize: 16,
            descriptionSize: 14,
            spacing: 12,
            containerPadding: 20,
        },
        medium: {
            iconSize: 64,
            titleSize: 18,
            descriptionSize: 15,
            spacing: 16,
            containerPadding: 32,
        },
        large: {
            iconSize: 80,
            titleSize: 20,
            descriptionSize: 16,
            spacing: 20,
            containerPadding: 40,
        },
    };

    const config = sizeConfig[size];

    return (
        <View style={[
            styles.container,
            {
                paddingVertical: config.containerPadding,
                paddingHorizontal: config.containerPadding,
            },
            style,
        ]}>
            {icon && (
                <View style={[styles.iconContainer, { marginBottom: config.spacing }]}>
                    <Icon
                        name={icon}
                        size={config.iconSize}
                        color={colors.textTertiary}
                    />
                </View>
            )}

            <Text style={[
                styles.title,
                {
                    fontSize: config.titleSize,
                    color: colors.text,
                    marginBottom: description ? 8 : config.spacing,
                },
            ]}>
                {title}
            </Text>

            {description && (
                <Text style={[
                    styles.description,
                    {
                        fontSize: config.descriptionSize,
                        color: colors.textSecondary,
                        marginBottom: actionLabel ? config.spacing : 0,
                    },
                ]}>
                    {description}
                </Text>
            )}

            {actionLabel && onActionPress && (
                <Button
                    title={actionLabel}
                    onPress={onActionPress}
                    variant="outlined"
                    size={size === 'small' ? 'small' : 'medium'}
                    style={{ marginTop: config.spacing }}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
    },
    iconContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontWeight: '600',
        textAlign: 'center',
    },
    description: {
        textAlign: 'center',
        lineHeight: 22,
    },
});

export default EmptyState;