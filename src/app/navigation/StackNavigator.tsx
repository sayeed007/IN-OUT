import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { useColorScheme, Platform } from 'react-native';

// Screens
import TransactionDetailScreen from '../../screens/transactions/TransactionDetailScreen';
import { AccountManagerScreen } from '../../screens/settings/AccountManagerScreen';
import CategoryManagerScreen from '../../screens/categories/CategoryManagerScreen';
import BudgetScreen from '../../screens/budgets/BudgetScreen';

// Types
import { ModalStackParamList } from '../../types/navigation';
import { RootState } from '../../state/store';

const Stack = createNativeStackNavigator<ModalStackParamList>();

const StackNavigator: React.FC = () => {
    const colorScheme = useColorScheme();
    const theme = useSelector((state: RootState) =>
        state.preferences.theme === 'system' ? colorScheme : state.preferences.theme
    );

    const isDark = theme === 'dark';

    // Theme colors
    const colors = {
        background: isDark ? '#000000' : '#F9FAFB',
        surface: isDark ? '#1F1F23' : '#FFFFFF',
        text: isDark ? '#FFFFFF' : '#000000',
        textSecondary: isDark ? '#A1A1AA' : '#6B7280',
        border: isDark ? '#2D2D32' : '#E5E5E7',
        primary: '#6366F1',
    };

    const defaultHeaderOptions = {
        headerStyle: {
            backgroundColor: colors.surface,
            shadowColor: 'transparent',
            elevation: 0,
        },
        headerTitleStyle: {
            color: colors.text,
            fontSize: 18,
            fontWeight: '600' as const,
        },
        headerTintColor: colors.primary,
        headerBackTitleVisible: false,
        headerShadowVisible: false,
    };

    return (
        <Stack.Navigator
            screenOptions={{
                ...defaultHeaderOptions,
                presentation: 'modal',
                animation: Platform.OS === 'ios' ? 'slide_from_bottom' : 'slide_from_right',
                gestureEnabled: true,
                fullScreenGestureEnabled: true,
            }}
        >
            <Stack.Screen
                name="TransactionDetail"
                component={TransactionDetailScreen}
                options={({ route }) => ({
                    title: route.params?.isEditing ? 'Edit Transaction' : 'Transaction Details',
                    headerLeft: () => null, // Custom back button can be added in component
                })}
            />

            <Stack.Screen
                name="AccountManager"
                component={AccountManagerScreen}
                options={({ route }) => ({
                    title: route.params?.accountId ? 'Edit Account' : 'Add Account',
                    presentation: 'modal',
                })}
            />

            <Stack.Screen
                name="CategoryManager"
                component={CategoryManagerScreen}
                options={({ route }) => ({
                    title: route.params?.categoryId ? 'Edit Category' : 'Manage Categories',
                    presentation: 'modal',
                })}
            />

            <Stack.Screen
                name="Budget"
                component={BudgetScreen}
                options={{
                    title: 'Budget Management',
                    presentation: 'modal',
                }}
            />
        </Stack.Navigator>
    );
};

export default StackNavigator;