// src/app/App.tsx
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import React, { useEffect } from 'react';
import { StatusBar, View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/app/navigation/AppNavigator';
import { StoreProvider } from './src/app/providers/StoreProvider';
import { ThemeProvider, useTheme } from './src/app/providers/ThemeProvider';
import { CalculatorProvider } from './src/app/providers/CalculatorProvider';
import { CalculatorModal } from './src/components/calculator/CalculatorModal';
import { FloatingCalculatorButton } from './src/components/calculator/FloatingCalculatorButton';
import { initializeApp } from './src/services/storage/appInitialization';

const AppContent: React.FC = () => {
    const { theme, isDark } = useTheme();

    const navigationTheme = {
        ...(isDark ? DarkTheme : DefaultTheme),
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
    });

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor="transparent" translucent />
            <NavigationContainer theme={navigationTheme}>
                <AppNavigator />
            </NavigationContainer>
            <FloatingCalculatorButton />
            <CalculatorModal />
        </View>
    );
};

const App: React.FC = () => {
    useEffect(() => {
        // Initialize app data and preferences
        initializeApp();
    }, []);

    return (
        <StoreProvider>
            <ThemeProvider>
                <CalculatorProvider>
                    <SafeAreaProvider>
                        <AppContent />
                    </SafeAreaProvider>
                </CalculatorProvider>
            </ThemeProvider>
        </StoreProvider>
    );
};

export default App;