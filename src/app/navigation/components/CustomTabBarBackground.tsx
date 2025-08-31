import React from 'react';
import { StyleSheet } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import LinearGradient from 'react-native-linear-gradient';

interface CustomTabBarBackgroundProps {
    isDark: boolean;
}

const CustomTabBarBackground: React.FC<CustomTabBarBackgroundProps> = ({ isDark }) => {
    const gradientColors = isDark 
        ? ['rgba(26, 26, 27, 0.95)', 'rgba(10, 10, 11, 0.98)']
        : ['rgba(255, 255, 255, 0.95)', 'rgba(249, 250, 251, 0.98)'];

    return (
        <>
            <BlurView
                style={StyleSheet.absoluteFill}
                blurType={isDark ? 'dark' : 'light'}
                blurAmount={20}
            />
            <LinearGradient
                colors={gradientColors}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
            />
        </>
    );
};

export default CustomTabBarBackground;