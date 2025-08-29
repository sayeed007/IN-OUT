// src/components/layout/SafeContainer.tsx
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Spacing } from '../../theme';

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
    backgroundColor = '#FFFFFF',
    edges = ['top', 'bottom', 'left', 'right'],
}) => {
    const insets = useSafeAreaInsets();

    const containerStyle: ViewStyle = {
        flex: 1,
        backgroundColor,
        paddingTop: edges.includes('top') ? Math.max(insets.top, Spacing[padding]) : 0,
        paddingBottom: edges.includes('bottom') ? Math.max(insets.bottom, Spacing[padding]) : 0,
        paddingLeft: edges.includes('left') ? Math.max(insets.left, Spacing[padding]) : 0,
        paddingRight: edges.includes('right') ? Math.max(insets.right, Spacing[padding]) : 0,
    };

    return (
        <View style={[containerStyle, style]}>
            {children}
        </View>
    );
};


