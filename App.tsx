// src/app/App.tsx
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import AppNavigator from './src/app/navigation/AppNavigator';
import { CalculatorProvider } from './src/app/providers/CalculatorProvider';
import { StoreProvider } from './src/app/providers/StoreProvider';
import { ThemeProvider, useTheme } from './src/app/providers/ThemeProvider';
import { CalculatorModal } from './src/components/calculator/CalculatorModal';
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
            <NavigationContainer theme={navigationTheme}>
                <AppNavigator />
            </NavigationContainer>
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

                <Toast topOffset={60} />
            </ThemeProvider>
        </StoreProvider>
    );
};

export default App;