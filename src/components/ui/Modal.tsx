import React, { useEffect } from 'react';
import {
    Modal as RNModal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Platform,
    StatusBar,
    useColorScheme,
    BackHandler,
} from 'react-native';
import { useSelector } from 'react-redux';
import { BlurView } from '@react-native-community/blur';
import Icon from 'react-native-vector-icons/Ionicons';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
    runOnJS,
} from 'react-native-reanimated';
import { RootState } from '../../state/store';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface ModalProps {
    visible: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title?: string;
    subtitle?: string;
    size?: 'small' | 'medium' | 'large' | 'fullscreen';
    position?: 'center' | 'bottom' | 'top';
    closable?: boolean;
    closeOnBackdrop?: boolean;
    showCloseButton?: boolean;
    animationType?: 'slide' | 'fade' | 'scale';
    statusBarTranslucent?: boolean;
}

const Modal: React.FC<ModalProps> = ({
    visible,
    onClose,
    children,
    title,
    subtitle,
    size = 'medium',
    position = 'center',
    closable = true,
    closeOnBackdrop = true,
    showCloseButton = true,
    animationType = 'scale',
    statusBarTranslucent = true,
}) => {
    const colorScheme = useColorScheme();
    const theme = useSelector((state: RootState) =>
        state.preferences.theme === 'system' ? colorScheme : state.preferences.theme
    );

    const scale = useSharedValue(0);
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(position === 'bottom' ? screenHeight : position === 'top' ? -screenHeight : 0);

    const isDark = theme === 'dark';

    // Theme colors
    const colors = {
        background: isDark ? '#0A0A0B' : '#FFFFFF',
        surface: isDark ? '#1F1F23' : '#FFFFFF',
        text: isDark ? '#FFFFFF' : '#000000',
        textSecondary: isDark ? '#A1A1AA' : '#6B7280',
        border: isDark ? '#3F3F46' : '#E5E5E7',
        overlay: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.5)',
    };

    // Size configurations
    const sizeConfig = {
        small: { width: screenWidth * 0.8, maxHeight: screenHeight * 0.4 },
        medium: { width: screenWidth * 0.9, maxHeight: screenHeight * 0.6 },
        large: { width: screenWidth * 0.95, maxHeight: screenHeight * 0.8 },
        fullscreen: { width: screenWidth, height: screenHeight },
    };

    useEffect(() => {
        if (visible) {
            opacity.value = withTiming(1, { duration: 300 });

            if (animationType === 'scale') {
                scale.value = withSpring(1, {
                    damping: 20,
                    stiffness: 300,
                });
            } else if (animationType === 'slide') {
                translateY.value = withSpring(0, {
                    damping: 20,
                    stiffness: 300,
                });
            }
        } else {
            const closeModal = () => {
                opacity.value = 0;
                scale.value = 0;
                translateY.value = position === 'bottom' ? screenHeight : position === 'top' ? -screenHeight : 0;
            };

            if (animationType === 'scale') {
                scale.value = withTiming(0, { duration: 200 }, () => {
                    runOnJS(closeModal)();
                });
            } else if (animationType === 'slide') {
                translateY.value = withTiming(
                    position === 'bottom' ? screenHeight : position === 'top' ? -screenHeight : 0,
                    { duration: 250 },
                    () => {
                        runOnJS(closeModal)();
                    }
                );
            }

            opacity.value = withTiming(0, { duration: 200 });
        }
    }, [visible, animationType, position]);

    // Handle Android back button
    useEffect(() => {
        const backAction = () => {
            if (visible && closable) {
                onClose();
                return true;
            }
            return false;
        };

        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
        return () => backHandler.remove();
    }, [visible, closable, onClose]);

    const backdropAnimatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    const modalAnimatedStyle = useAnimatedStyle(() => {
        const baseStyle = {
            opacity: opacity.value,
        };

        if (animationType === 'scale') {
            return {
                ...baseStyle,
                transform: [{ scale: scale.value }],
            };
        } else if (animationType === 'slide') {
            return {
                ...baseStyle,
                transform: [{ translateY: translateY.value }],
            };
        }

        return baseStyle;
    });

    const getModalContainerStyle = () => {
        const config = sizeConfig[size];

        let positionStyle = {};
        if (position === 'bottom') {
            positionStyle = {
                justifyContent: 'flex-end',
            };
        } else if (position === 'top') {
            positionStyle = {
                justifyContent: 'flex-start',
                paddingTop: Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 0,
            };
        } else {
            positionStyle = {
                justifyContent: 'center',
            };
        }

        return [
            styles.modalContainer,
            positionStyle,
            size === 'fullscreen' && styles.fullscreen,
        ];
    };

    const getContentStyle = () => {
        const config = sizeConfig[size];

        let baseStyle = {
            backgroundColor: colors.surface,
            borderRadius: size === 'fullscreen' ? 0 : 16,
            maxWidth: config.width,
            width: config.width,
        };

        if (size === 'fullscreen') {
            baseStyle = {
                ...baseStyle,
                height: config.height,
                borderRadius: 0,
            };
        } else {
            baseStyle = {
                ...baseStyle,
                maxHeight: config.maxHeight,
            };
        }

        if (position === 'bottom') {
            baseStyle = {
                ...baseStyle,
                borderBottomLeftRadius: 0,
                borderBottomRightRadius: 0,
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
            };
        }

        return baseStyle;
    };

    const handleBackdropPress = () => {
        if (closeOnBackdrop && closable) {
            onClose();
        }
    };

    return (
        <RNModal
            visible={visible}
            transparent
            animationType="none"
            statusBarTranslucent={statusBarTranslucent}
            onRequestClose={closable ? onClose : undefined}
        >
            <View style={styles.overlay}>
                <Animated.View style={[styles.backdrop, backdropAnimatedStyle]}>
                    {Platform.OS === 'ios' ? (
                        <BlurView
                            style={StyleSheet.absoluteFill}
                            blurType={isDark ? 'dark' : 'light'}
                            blurAmount={10}
                        />
                    ) : (
                        <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.overlay }]} />
                    )}

                    <TouchableOpacity
                        style={StyleSheet.absoluteFill}
                        activeOpacity={1}
                        onPress={handleBackdropPress}
                    />
                </Animated.View>

                <View style={getModalContainerStyle()}>
                    <Animated.View style={[getContentStyle(), modalAnimatedStyle]}>
                        {(title || showCloseButton) && (
                            <View style={styles.header}>
                                <View style={styles.titleContainer}>
                                    {title && (
                                        <Text style={[styles.title, { color: colors.text }]}>
                                            {title}
                                        </Text>
                                    )}
                                    {subtitle && (
                                        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                                            {subtitle}
                                        </Text>
                                    )}
                                </View>

                                {showCloseButton && closable && (
                                    <TouchableOpacity
                                        onPress={onClose}
                                        style={styles.closeButton}
                                    >
                                        <Icon
                                            name="close"
                                            size={24}
                                            color={colors.textSecondary}
                                        />
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}

                        <View style={styles.content}>
                            {children}
                        </View>
                    </Animated.View>
                </View>
            </View>
        </RNModal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
    },
    backdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    modalContainer: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    fullscreen: {
        paddingHorizontal: 0,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 16,
    },
    titleContainer: {
        flex: 1,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
    },
    closeButton: {
        padding: 4,
        marginLeft: 16,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
});

export default Modal;