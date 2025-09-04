import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React, { useCallback } from 'react';
import { Platform } from 'react-native';

// Screens
import { DashboardScreen } from '../../screens/dashboard/DashboardScreen';
import { ReportsScreen } from '../../screens/reports/ReportsScreen';
import { SettingsScreen } from '../../screens/settings/SettingsScreen';
import { AddTransactionScreen } from '../../screens/transactions/AddTransactionScreen';
import { TransactionListScreen } from '../../screens/transactions/TransactionListScreen';
import { useTheme } from '../providers/ThemeProvider';

// Types
import { TabParamList } from './types';

// Components
import CustomTabBarBackground from './components/CustomTabBarBackground';
import CustomTabBarIcon from './components/CustomTabBarIcon';

const Tab = createBottomTabNavigator<TabParamList>();

const TabNavigator: React.FC = () => {
    const { theme, isDark } = useTheme();

    // Move the tabBarIcon function outside of screenOptions to avoid recreating it on every render
    const renderTabBarIcon = useCallback(
        ({ focused, size }: { focused: boolean; size: number }, routeName: keyof TabParamList) => (
            <CustomTabBarIcon
                focused={focused}
                color={focused ? theme.colors.primary[500] : theme.colors.textSecondary}
                size={size}
                routeName={routeName}
                primaryColor={theme.colors.primary[500]}
            />
        ),
        [theme.colors.primary, theme.colors.textSecondary]
    );

    // Move tabBarBackground function outside to avoid recreation
    const renderTabBarBackground = useCallback(
        () => <CustomTabBarBackground isDark={isDark} />,
        [isDark]
    );

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ focused, size }) =>
                    renderTabBarIcon({ focused, size }, route.name as keyof TabParamList),
                tabBarActiveTintColor: theme.colors.primary[500],
                tabBarInactiveTintColor: theme.colors.textSecondary,
                tabBarStyle: {
                    position: 'absolute',
                    bottom: 0,
                    left: 16,
                    right: 16,
                    elevation: 0,
                    backgroundColor: Platform.OS === 'ios' ? 'transparent' : theme.colors.surface,
                    borderTopWidth: 0,
                    borderTopLeftRadius: 24,
                    borderTopRightRadius: 24,
                    height: Platform.OS === 'ios' ? 65 : 60,
                    paddingBottom: Platform.OS === 'ios' ? 20 : 17,
                    paddingHorizontal: 8,
                    ...Platform.select({
                        ios: {
                            shadowColor: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.15)',
                            shadowOffset: {
                                width: 0,
                                height: 8,
                            },
                            shadowOpacity: 1,
                            shadowRadius: 20,
                        },
                        android: {
                            elevation: 16,
                            shadowColor: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.2)',
                        },
                    }),
                },
                tabBarBackground: Platform.OS === 'ios' ? renderTabBarBackground : undefined,
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '600',
                    marginTop: 4,
                    marginBottom: -2,
                },
                tabBarItemStyle: {
                    paddingVertical: 6,
                    paddingHorizontal: 4,
                    borderRadius: 16,
                    marginHorizontal: 2,
                },
                // Hide label for Add button
                tabBarLabel: route.name === 'Add' ? '' : route.name,
            })}
            screenListeners={({ route, navigation }) => ({
                tabPress: (e) => {
                    // Custom logic for tab press if needed
                    if (route.name === 'Add') {
                        // Could add haptic feedback here
                        console.log(navigation, e);
                    }
                },
            })}
            initialRouteName="Dashboard"
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
                        navigation.navigate('Add', {});
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

export default TabNavigator;
