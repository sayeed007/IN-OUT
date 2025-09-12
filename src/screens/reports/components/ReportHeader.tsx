import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../../app/providers/ThemeProvider';

interface ReportHeaderProps {
    title?: string;
    subtitle?: string;
}

export const ReportHeader: React.FC<ReportHeaderProps> = ({ 
    title = 'Financial Reports',
    subtitle = 'Comprehensive financial insights'
}) => {
    const { theme } = useTheme();

    return (
        <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                {subtitle}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 16,
    },
});