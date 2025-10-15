import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Platform } from 'react-native';

// Screens
import { SettingsScreen } from '../../screens/settings/SettingsScreen';
import { AccountManagerScreen } from '../../screens/settings/AccountManagerScreen';
import { AccountFormScreen } from '../../screens/settings/AccountFormScreen';
import { CategorySettingsScreen } from '../../screens/settings/CategorySettingsScreen';
import { CategoryFormScreen } from '../../screens/settings/CategoryFormScreen';

// Theme
import { useTheme } from '../providers/ThemeProvider';

// Types
import { SettingsStackParamList } from './types';

const Stack = createNativeStackNavigator<SettingsStackParamList>();

const SettingsStackNavigator: React.FC = () => {
    const { theme } = useTheme();

    const defaultHeaderOptions = {
        headerStyle: {
            backgroundColor: theme.colors.surface,
            shadowColor: 'transparent',
            elevation: 0,
        },
        headerTitleStyle: {
            color: theme.colors.text,
            fontSize: 18,
            fontWeight: '600' as const,
        },
        headerTintColor: theme.colors.primary[500],
        headerBackTitleVisible: false,
        headerShadowVisible: false,
    };

    return (
        <Stack.Navigator
            screenOptions={{
                ...defaultHeaderOptions,
                animation: Platform.OS === 'ios' ? 'slide_from_right' : 'slide_from_right',
            }}
        >
            <Stack.Screen
                name="SettingsMain"
                component={SettingsScreen}
                options={{
                    headerShown: false, // The SettingsScreen has its own header
                }}
            />

            <Stack.Screen
                name="AccountManager"
                component={AccountManagerScreen}
                options={{
                    headerShown: false,
                    presentation: 'modal',
                }}
            />

            <Stack.Screen
                name="AccountForm"
                component={AccountFormScreen}
                options={({ route }) => ({
                    title: route.params?.accountId ? 'Edit Account' : 'Add Account',
                })}
            />

            <Stack.Screen
                name="CategorySettings"
                component={CategorySettingsScreen}
                options={{
                    headerShown: false,
                    presentation: 'modal',
                }}
            />

            <Stack.Screen
                name="CategoryForm"
                component={CategoryFormScreen}
                options={({ route }) => ({
                    title: route.params?.categoryId ? 'Edit Category' : 'Add Category',
                })}
            />
        </Stack.Navigator>
    );
};

export default SettingsStackNavigator;