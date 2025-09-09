// src/components/layout/SafeContainer.tsx
import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Spacing } from '../../theme';
import { useTheme } from '../../app/providers/ThemeProvider';

interface SafeContainerProps {
    children: React.ReactNode;
    style?: ViewStyle;
    padding?: keyof typeof Spacing;
    backgroundColor?: string;
    edges?: ('top' | 'bottom' | 'left' | 'right')[];
}

export const SafeContainer: React.FC<SafeContainerProps> = ({
    children,
    style,
    padding = 'md',
    backgroundColor,
    edges = ['top', 'bottom', 'left', 'right'],
}) => {
    const insets = useSafeAreaInsets();
    const { theme } = useTheme();
    
    // Use theme background if no backgroundColor is provided
    const finalBackgroundColor = backgroundColor || theme.colors.background;

    const spacingValue = typeof Spacing[padding] === 'number' ? Spacing[padding] : Spacing.xs;

    const containerStyle: ViewStyle = {
        flex: 1,
        backgroundColor: finalBackgroundColor,
        paddingTop: edges.includes('top') ? Math.max(insets.top, spacingValue) : 0,
        paddingBottom: edges.includes('bottom') ? Math.max(insets.bottom, spacingValue) : 0,
        paddingLeft: edges.includes('left') ? Math.max(insets.left, spacingValue) : 0,
        paddingRight: edges.includes('right') ? Math.max(insets.right, spacingValue) : 0,
    };

    return (
        <View style={[containerStyle, style]}>
            {children}
        </View>
    );
};


