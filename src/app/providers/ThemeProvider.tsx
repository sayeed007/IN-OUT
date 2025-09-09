// src/app/providers/ThemeProvider.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Appearance, StatusBar } from 'react-native';
import { Theme, lightTheme, darkTheme } from '../../theme';
import { useAppSelector, useAppDispatch } from '../../state/hooks';
import { updatePreferences } from '../../state/slices/preferencesSlice';

interface ThemeContextType {
    theme: Theme;
    isDark: boolean;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = (): ThemeContextType => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
};

interface ThemeProviderProps {
    children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
    const themePreference = useAppSelector(state => state.preferences.theme);
    const dispatch = useAppDispatch();
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const getThemeMode = () => {
            if (themePreference === 'system') {
                return Appearance.getColorScheme() === 'dark';
            }
            return themePreference === 'dark';
        };

        setIsDark(getThemeMode());

        // Listen for system theme changes
        const subscription = Appearance.addChangeListener(({ colorScheme }) => {
            if (themePreference === 'system') {
                setIsDark(colorScheme === 'dark');
            }
        });

        return () => subscription.remove();
    }, [themePreference]);

    // Update status bar style when theme changes
    useEffect(() => {
        StatusBar.setBarStyle(isDark ? 'light-content' : 'dark-content', true);
    }, [isDark]);


    const theme = isDark ? darkTheme : lightTheme;

    const toggleTheme = () => {
        const newTheme = isDark ? 'light' : 'dark';
        dispatch(updatePreferences({ theme: newTheme }));
    };

    return (
        <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};