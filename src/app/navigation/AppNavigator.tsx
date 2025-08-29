import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { RootState } from '../../state/store';
import { StatusBar, useColorScheme } from 'react-native';

// Navigation Components
import TabNavigator from './TabNavigator';
import StackNavigator from './StackNavigator';

// Screens
import LockScreen from '../../screens/auth/LockScreen';
import OnboardingScreen from '../../screens/auth/OnboardingScreen';

// Types
import { RootStackParamList } from '../../types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
    const colorScheme = useColorScheme();
    const { isLocked, isOnboarded, theme } = useSelector((state: RootState) => ({
        isLocked: state.app.isLocked,
        isOnboarded: state.app.isOnboarded,
        theme: state.preferences.theme === 'system' ? colorScheme : state.preferences.theme,
    }));

    // Theme colors
    const isDark = theme === 'dark';
    const backgroundColor = isDark ? '#0A0A0B' : '#FFFFFF';
    const statusBarStyle = isDark ? 'light-content' : 'dark-content';

    const renderInitialRoute = () => {
        if (!isOnboarded) {
            return 'Onboarding';
        }
        if (isLocked) {
            return 'Lock';
        }
        return 'Main';
    };

    return (
        <NavigationContainer
            theme={{
                dark: isDark,
                colors: {
                    primary: '#6366F1',
                    background: backgroundColor,
                    card: isDark ? '#1F1F23' : '#FFFFFF',
                    text: isDark ? '#FFFFFF' : '#000000',
                    border: isDark ? '#2D2D32' : '#E5E5E7',
                    notification: '#FF3B30',
                },
            }}
        >
            <StatusBar
                barStyle={statusBarStyle}
                backgroundColor={backgroundColor}
                translucent={false}
            />

            <Stack.Navigator
                initialRouteName={renderInitialRoute()}
                screenOptions={{
                    headerShown: false,
                    gestureEnabled: false,
                    animation: 'slide_from_right',
                }}
            >
                {/* Onboarding Flow */}
                <Stack.Screen
                    name="Onboarding"
                    component={OnboardingScreen}
                    options={{
                        gestureEnabled: false,
                        animation: 'fade',
                    }}
                />

                {/* Lock Screen */}
                <Stack.Screen
                    name="Lock"
                    component={LockScreen}
                    options={{
                        gestureEnabled: false,
                        animation: 'fade',
                    }}
                />

                {/* Main App - Tab Navigator */}
                <Stack.Screen
                    name="Main"
                    component={TabNavigator}
                    options={{
                        animation: 'fade',
                    }}
                />

                {/* Modal/Stack Screens */}
                <Stack.Group screenOptions={{ presentation: 'modal' }}>
                    <Stack.Screen
                        name="ModalStack"
                        component={StackNavigator}
                        options={{
                            headerShown: false,
                        }}
                    />
                </Stack.Group>
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;