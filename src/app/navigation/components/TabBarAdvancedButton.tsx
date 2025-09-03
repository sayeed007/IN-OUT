import React from 'react';
import { StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../providers/ThemeProvider';
import { TabBg } from './TabBg';

type Props = {
    primaryColor: string;
};


export const TabBarAdvancedButton: React.FC<Props> = ({ primaryColor }) => {
    const { theme } = useTheme();

    return (
        <>
            <View style={styles.container}>
                <View style={{ backgroundColor: theme.colors.background }}>
                    <TabBg />
                </View>

                <LinearGradient
                    colors={[primaryColor, `${primaryColor}CC`]}
                    style={styles.button}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <Icon
                        name={'add'}
                        size={32}
                        color="#FFFFFF"
                    />
                </LinearGradient>

            </View>
        </>

    )
};

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        width: 75,
        alignItems: 'center',
    },
    button: {
        position: 'absolute',
        top: -30,
        justifyContent: 'center',
        alignItems: 'center',
        width: 50,
        height: 50,
        borderRadius: 27,
    },
});
