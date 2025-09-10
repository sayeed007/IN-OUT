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

interface AlertModalProps {
    visible: boolean;
    title: string;
    message: string;
    onClose: () => void;
    type?: 'success' | 'error' | 'warning' | 'info';
    buttonText?: string;
}

const AlertModal: React.FC<AlertModalProps> = ({
    visible,
    title,
    message,
    onClose,
    type = 'info',
    buttonText = 'OK',
}) => {
    const { theme } = useTheme();

    const getTypeConfig = () => {
        switch (type) {
            case 'success':
                return {
                    icon: 'checkmark-circle',
                    color: theme.colors.success[500],
                    backgroundColor: theme.colors.success[50],
                };
            case 'error':
                return {
                    icon: 'close-circle',
                    color: theme.colors.error[500],
                    backgroundColor: theme.colors.error[50],
                };
            case 'warning':
                return {
                    icon: 'warning',
                    color: theme.colors.warning[500],
                    backgroundColor: theme.colors.warning[50],
                };
            default:
                return {
                    icon: 'information-circle',
                    color: theme.colors.info[500],
                    backgroundColor: theme.colors.info[50],
                };
        }
    };

    const typeConfig = getTypeConfig();

    return (
        <Modal transparent visible={visible} animationType="fade">
            <View style={styles.overlay}>
                <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
                    
                    {/* Icon */}
                    <View style={[styles.iconContainer, { backgroundColor: typeConfig.backgroundColor }]}>
                        <Icon 
                            name={typeConfig.icon} 
                            size={32} 
                            color={typeConfig.color} 
                        />
                    </View>

                    {/* Title */}
                    <Text style={[styles.title, { color: theme.colors.text }]}>
                        {title}
                    </Text>

                    {/* Message */}
                    <Text style={[styles.message, { color: theme.colors.textSecondary }]}>
                        {message}
                    </Text>

                    {/* Button */}
                    <TouchableOpacity 
                        style={[styles.button, { backgroundColor: typeConfig.color }]}
                        onPress={onClose}
                    >
                        <Text style={styles.buttonText}>
                            {buttonText}
                        </Text>
                    </TouchableOpacity>
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
        maxWidth: 320,
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
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
    button: {
        width: '100%',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
});

export default AlertModal;