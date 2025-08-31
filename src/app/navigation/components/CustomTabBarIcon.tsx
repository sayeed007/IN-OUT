import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { TabParamList } from '../types';

interface CustomTabBarIconProps {
    focused: boolean;
    color: string;
    size: number;
    routeName: keyof TabParamList;
    primaryColor: string;
}

const CustomTabBarIcon: React.FC<CustomTabBarIconProps> = ({
    focused,
    color,
    size,
    routeName,
    primaryColor,
}) => {
    const scale = useSharedValue(focused ? 1.1 : 1);
    const opacity = useSharedValue(focused ? 1 : 0.7);
    const backgroundOpacity = useSharedValue(focused ? 1 : 0);

    const getTabBarIcon = () => {
        const iconMap: Record<string, string> = {
            Dashboard: 'grid-outline',
            Transactions: 'list-outline',
            Add: 'add',
            Reports: 'analytics-outline',
            Settings: 'settings-outline',
        };

        return iconMap[routeName] || 'ellipse-outline';
    };

    React.useEffect(() => {
        scale.value = withSpring(focused ? 1.1 : 1, {
            damping: 20,
            stiffness: 300,
        });
        opacity.value = withTiming(focused ? 1 : 0.7, {
            duration: 250,
        });
        backgroundOpacity.value = withTiming(focused ? 1 : 0, {
            duration: 300,
        });
    }, [focused, scale, opacity, backgroundOpacity]);

    const animatedIconStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
    }));

    const animatedBackgroundStyle = useAnimatedStyle(() => ({
        opacity: backgroundOpacity.value,
        backgroundColor: primaryColor + '20',
    }));

    const addButtonContainerStyle = {
        width: 56,
        height: 56,
        borderRadius: 28,
        shadowColor: primaryColor,
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.35,
        shadowRadius: 16,
        elevation: 16,
        marginBottom: 8,
    };

    const addButtonGradientStyle = {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center' as const,
        alignItems: 'center' as const,
    };

    // Special styling for Add button
    if (routeName === 'Add') {
        return (
            <Animated.View
                style={[
                    addButtonContainerStyle,
                    animatedIconStyle
                ]}
            >
                <LinearGradient
                    colors={[primaryColor, `${primaryColor}CC`]}
                    style={addButtonGradientStyle}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <Icon
                        name={getTabBarIcon()}
                        size={28}
                        color="#FFFFFF"
                    />
                </LinearGradient>
            </Animated.View>
        );
    }

    return (
        <View style={styles.iconContainer}>
            <Animated.View
                style={[
                    styles.activeBackground,
                    animatedBackgroundStyle
                ]}
            />
            <Animated.View style={animatedIconStyle}>
                <Icon
                    name={getTabBarIcon()}
                    size={size}
                    color={color}
                />
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    iconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    activeBackground: {
        position: 'absolute',
        width: 36,
        height: 36,
        borderRadius: 16,
        top: -4,
    },
});

export default CustomTabBarIcon;