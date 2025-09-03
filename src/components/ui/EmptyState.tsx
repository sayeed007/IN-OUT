import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    ViewStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../app/providers/ThemeProvider';
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
    const { theme } = useTheme();

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

    const titleStyle = {
        fontSize: config.titleSize,
        color: theme.colors.text,
        marginBottom: description ? 8 : config.spacing,
    };

    const descriptionStyle = {
        fontSize: config.descriptionSize,
        color: theme.colors.textSecondary,
        marginBottom: actionLabel ? config.spacing : 0,
    };

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
                        color={theme.colors.textSecondary}
                    />
                </View>
            )}

            <Text style={[
                styles.title,
                titleStyle
            ]}>
                {title}
            </Text>

            {description && (
                <Text style={[
                    styles.description,
                    descriptionStyle
                ]}>
                    {description}
                </Text>
            )}

            {actionLabel && onActionPress && (
                <Button
                    title={actionLabel}
                    onPress={onActionPress}
                    variant="outline"
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