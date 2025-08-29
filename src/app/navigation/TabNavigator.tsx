import { BlurView } from '@react-native-community/blur';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Platform, StyleSheet, useColorScheme } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming
} from 'react-native-reanimated';
import { useSelector } from 'react-redux';

// Icons (assuming you're using react-native-vector-icons or similar)
import Icon from 'react-native-vector-icons/Ionicons';

// Screens
import DashboardScreen from '../../screens/dashboard/DashboardScreen';
import ReportsScreen from '../../screens/reports/ReportsScreen';
import SettingsScreen from '../../screens/settings/SettingsScreen';
import AddTransactionScreen from '../../screens/transactions/AddTransactionScreen';
import TransactionListScreen from '../../screens/transactions/TransactionListScreen';

// Types
import { RootState } from '../../state/store';
import { MainTabParamList } from '../../types/navigation';

const Tab = createBottomTabNavigator<MainTabParamList>();

interface TabBarIconProps {
    focused: boolean;
    color: string;
    size: number;
}

const TabNavigator: React.FC = () => {
    const colorScheme = useColorScheme();
    const theme = useSelector((state: RootState) =>
        state.preferences.theme === 'system' ? colorScheme : state.preferences.theme
    );

    const isDark = theme === 'dark';

    // Theme colors
    const colors = {
        primary: '#6366F1',
        primaryLight: '#818CF8',
        background: isDark ? '#0A0A0B' : '#FFFFFF',
        surface: isDark ? '#1F1F23' : '#FFFFFF',
        surfaceVariant: isDark ? '#2D2D32' : '#F5F5F7',
        text: isDark ? '#FFFFFF' : '#000000',
        textSecondary: isDark ? '#A1A1AA' : '#6B7280',
        border: isDark ? '#2D2D32' : '#E5E5E7',
        shadow: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.1)',
    };

    const getTabBarIcon = (routeName: string) => {
        const iconMap: Record<string, string> = {
            Dashboard: 'grid-outline',
            Transactions: 'list-outline',
            Add: 'add',
            Reports: 'analytics-outline',
            Settings: 'settings-outline',
        };
        return iconMap[routeName] || 'ellipse-outline';
    };

    const CustomTabBarIcon: React.FC<TabBarIconProps & { routeName: string }> = ({
        focused,
        color,
        size,
        routeName,
    }) => {
        const scale = useSharedValue(focused ? 1.2 : 1);
        const opacity = useSharedValue(focused ? 1 : 0.6);

        React.useEffect(() => {
            scale.value = withSpring(focused ? 1.2 : 1, {
                damping: 15,
                stiffness: 200,
            });
            opacity.value = withTiming(focused ? 1 : 0.6, {
                duration: 200,
            });
        }, [focused]);

        const animatedStyle = useAnimatedStyle(() => ({
            transform: [{ scale: scale.value }],
            opacity: opacity.value,
        }));

        // Special styling for Add button
        if (routeName === 'Add') {
            return (
                <Animated.View style={[styles.addButton, animatedStyle, { backgroundColor: colors.primary }]}>
                    <Icon
                        name={getTabBarIcon(routeName)}
                        size={24}
                        color="#FFFFFF"
                    />
                </Animated.View>
            );
        }

        return (
            <Animated.View style={animatedStyle}>
                <Icon
                    name={getTabBarIcon(routeName)}
                    size={size}
                    color={color}
                />
            </Animated.View>
        );
    };

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ focused, color, size }) => (
                    <CustomTabBarIcon
                        focused={focused}
                        color={color}
                        size={size}
                        routeName={route.name}
                    />
                ),
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textSecondary,
                tabBarStyle: {
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    elevation: 0,
                    backgroundColor: Platform.OS === 'ios' ? 'transparent' : colors.surface,
                    borderTopWidth: 0,
                    height: Platform.OS === 'ios' ? 85 : 70,
                    paddingBottom: Platform.OS === 'ios' ? 25 : 10,
                    paddingTop: 10,
                    ...Platform.select({
                        ios: {
                            shadowColor: colors.shadow,
                            shadowOffset: {
                                width: 0,
                                height: -2,
                            },
                            shadowOpacity: 0.1,
                            shadowRadius: 10,
                        },
                        android: {
                            elevation: 8,
                            borderTopLeftRadius: 20,
                            borderTopRightRadius: 20,
                        },
                    }),
                },
                tabBarBackground: Platform.OS === 'ios' ? () => (
                    <BlurView
                        style={StyleSheet.absoluteFill}
                        blurType={isDark ? 'dark' : 'light'}
                        blurAmount={15}
                    />
                ) : undefined,
                tabBarLabelStyle: {
                    fontSize: 10,
                    fontWeight: '600',
                    marginTop: 2,
                },
                tabBarItemStyle: {
                    paddingVertical: 5,
                },
                // Hide label for Add button
                tabBarLabel: route.name === 'Add' ? '' : route.name,
            })}
            screenListeners={({ route, navigation }) => ({
                tabPress: (e) => {
                    // Custom logic for tab press if needed
                    if (route.name === 'Add') {
                        // Could add haptic feedback here
                    }
                },
            })}
        >
            <Tab.Screen
                name="Dashboard"
                component={DashboardScreen}
                options={{
                    title: 'Dashboard',
                }}
            />

            <Tab.Screen
                name="Transactions"
                component={TransactionListScreen}
                options={{
                    title: 'Transactions',
                }}
            />

            <Tab.Screen
                name="Add"
                component={AddTransactionScreen}
                options={{
                    title: '',
                    tabBarStyle: { display: 'none' }, // Hide tab bar on Add screen for full focus
                }}
                listeners={({ navigation }) => ({
                    tabPress: (e) => {
                        // Prevent default behavior
                        e.preventDefault();

                        // Navigate to Add screen with modal presentation
                        navigation.navigate('Add');
                    },
                })}
            />

            <Tab.Screen
                name="Reports"
                component={ReportsScreen}
                options={{
                    title: 'Reports',
                }}
            />

            <Tab.Screen
                name="Settings"
                component={SettingsScreen}
                options={{
                    title: 'Settings',
                }}
            />
        </Tab.Navigator>
    );
};

const styles = StyleSheet.create({
    addButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#6366F1',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
        marginBottom: 10,
    },
});

export default TabNavigator;