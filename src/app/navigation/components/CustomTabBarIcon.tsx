import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Ionicons';
import { TabParamList } from '../types';
import { TabBarAdvancedButton } from './TabBarAdvancedButton';

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


    // Special styling for Add button
    if (routeName === 'Add') {
        return (
            <TabBarAdvancedButton
                primaryColor={primaryColor}
            />
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