// src/app/App.tsx
import { NavigationContainer } from '@react-navigation/native';
import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StoreProvider } from './providers/StoreProvider';
import { ThemeProvider } from './providers/ThemeProvider';
import { AppNavigator } from './navigation/AppNavigator';
import { initializeApp } from '../services/storage/appInitialization';

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