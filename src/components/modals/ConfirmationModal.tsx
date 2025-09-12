import React from 'react';
import {
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../app/providers/ThemeProvider';

interface ConfirmationModalProps {
    visible: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
    confirmStyle?: 'default' | 'destructive';
    icon?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    visible,
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    confirmStyle = 'default',
    icon,
}) => {
    const { theme } = useTheme();

    const getConfirmButtonColor = () => {
        switch (confirmStyle) {
            case 'destructive':
                return theme.colors.error[500];
            default:
                return theme.colors.primary[500];
        }
    };

    return (
        <Modal transparent visible={visible} animationType="fade">
            <View style={styles.overlay}>
                <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
                    
                    {/* Icon */}
                    {icon && (
                        <View style={styles.iconContainer}>
                            <Icon 
                                name={icon} 
                                size={48} 
                                color={confirmStyle === 'destructive' ? theme.colors.error[500] : theme.colors.primary[500]} 
                            />
                        </View>
                    )}

                    {/* Title */}
                    <Text style={[styles.title, { color: theme.colors.text }]}>
                        {title}
                    </Text>

                    {/* Message */}
                    <Text style={[styles.message, { color: theme.colors.textSecondary }]}>
                        {message}
                    </Text>

                    {/* Buttons */}
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity 
                            style={[
                                styles.button, 
                                styles.cancelButton,
                                { 
                                    backgroundColor: theme.colors.background,
                                    borderColor: theme.colors.border
                                }
                            ]}
                            onPress={onCancel}
                        >
                            <Text style={[styles.buttonText, { color: theme.colors.textSecondary }]}>
                                {cancelText}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={[
                                styles.button, 
                                styles.confirmButton,
                                { backgroundColor: getConfirmButtonColor() }
                            ]}
                            onPress={onConfirm}
                        >
                            <Text style={styles.confirmButtonText}>
                                {confirmText}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    container: {
        width: '100%',
        maxWidth: 340,
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
    },
    iconContainer: {
        marginBottom: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 8,
    },
    message: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 24,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    button: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelButton: {
        borderWidth: 1,
    },
    confirmButton: {
        // backgroundColor set dynamically
    },
    buttonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    confirmButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
    },
});

export default ConfirmationModal;