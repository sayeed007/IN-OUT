// src/app/App.tsx
import { NavigationContainer } from '@react-navigation/native';
import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/app/navigation/AppNavigator';
import { StoreProvider } from './src/app/providers/StoreProvider';
import { ThemeProvider } from './src/app/providers/ThemeProvider';
import { initializeApp } from './src/services/storage/appInitialization';

const App: React.FC = () => {
    useEffect(() => {
        // Initialize app data and preferences
        initializeApp();
    }, []);

    return (
        <StoreProvider>
            <SafeAreaProvider>
                <ThemeProvider>
                    <StatusBar backgroundColor="transparent" translucent />
                    <NavigationContainer>
                        <AppNavigator />
                    </NavigationContainer>
                </ThemeProvider>
            </SafeAreaProvider>
        </StoreProvider>
    );
};

export default App;