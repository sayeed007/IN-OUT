import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { RootState } from '../../state/store';
import { StatusBar, useColorScheme } from 'react-native';

// Navigation Components
import TabNavigator from './TabNavigator';

// Screens
import LockScreen from '../../screens/auth/LockScreen';
import OnboardingScreen from '../../screens/auth/OnboardingScreen';

// Services
import AppInitializationService from '../../services/storage/appInitialization';

// Types
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
    const [isOnboarded, setIsOnboarded] = useState<boolean | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const colorScheme = useColorScheme();
    const { theme } = useSelector((state: RootState) => ({
        theme: state.preferences?.theme === 'system' ? colorScheme : state.preferences?.theme || 'light',
    }));

    const appInit = AppInitializationService.getInstance();

    useEffect(() => {
        checkOnboardingStatus();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const checkOnboardingStatus = async () => {
        try {
            const onboardingComplete = await appInit.isOnboardingComplete();
            setIsOnboarded(onboardingComplete);
        } catch (error) {
            console.error('Failed to check onboarding status:', error);
            setIsOnboarded(false);
        } finally {
            setIsLoading(false);
        }
    };

    // Theme colors
    const isDark = theme === 'dark';
    const backgroundColor = isDark ? '#000000' : '#F9FAFB';
    const statusBarStyle = isDark ? 'light-content' : 'dark-content';

    if (isLoading) {
        // Could show a splash screen here
        return null;
    }

    const initialRouteName = isOnboarded ? 'Main' : 'Onboarding';

    return (
        <>
            <StatusBar
                barStyle={statusBarStyle}
                backgroundColor={backgroundColor}
                translucent={false}
            />

            <Stack.Navigator
                initialRouteName={initialRouteName}
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
            </Stack.Navigator>
        </>
    );
};

export default AppNavigator;