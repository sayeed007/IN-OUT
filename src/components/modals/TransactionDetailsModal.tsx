// src/components/modals/TransactionDetailsModal.tsx
import React from 'react';
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import dayjs from 'dayjs';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../app/providers/ThemeProvider';
import { Transaction, Account, Category } from '../../types/global';

interface TransactionDetailsModalProps {
    visible: boolean;
    onClose: () => void;
    transaction: Transaction | null;
    accounts: Account[];
    categories: Category[];
    onEdit?: (transaction: Transaction) => void;
    onDelete?: (transaction: Transaction) => void;
}

const TransactionDetailsModal: React.FC<TransactionDetailsModalProps> = ({
    visible,
    onClose,
    transaction,
    accounts,
    categories,
    onEdit,
    onDelete,
}) => {
    const { theme } = useTheme();

    if (!transaction) return null;

    const getAccount = (accountId: string) =>
        accounts.find(acc => acc.id === accountId);

    const getCategory = (categoryId: string | null) =>
        categoryId ? categories.find(cat => cat.id === categoryId) : null;

    const getTransactionColors = (type: Transaction['type']) => {
        switch (type) {
            case 'income':
                return {
                    main: theme.colors.success[500],
                    light: theme.colors.success[50],
                    icon: 'arrow-down-circle',
                };
            case 'expense':
                return {
                    main: theme.colors.error[500],
                    light: theme.colors.error[50],
                    icon: 'arrow-up-circle',
                };
            case 'transfer':
                return {
                    main: theme.colors.info[500],
                    light: theme.colors.info[50],
                    icon: 'swap-horizontal',
                };
            default:
                return {
                    main: theme.colors.textSecondary,
                    light: theme.colors.background,
                    icon: 'help-circle',
                };
        }
    };

    const colors = getTransactionColors(transaction.type);
    const fromAccount = getAccount(transaction.accountId);
    const toAccount = transaction.accountIdTo ? getAccount(transaction.accountIdTo) : null;
    const category = getCategory(transaction.categoryId);

    const formatAmount = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: transaction.currencyCode,
            minimumFractionDigits: 2,
        }).format(amount);
    };

    const getTransactionTitle = () => {
        switch (transaction.type) {
            case 'income':
                return 'Income Transaction';
            case 'expense':
                return 'Expense Transaction';
            case 'transfer':
                return 'Transfer Transaction';
            default:
                return 'Transaction Details';
        }
    };

    return (
        <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <TouchableOpacity
                    style={styles.backdrop}
                    activeOpacity={1}
                    onPress={onClose}
                />

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardAvoid}
                >
                    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
                        {/* Header */}
                        <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
                            <Text style={[styles.title, { color: theme.colors.text }]}>
                                {getTransactionTitle()}
                            </Text>
                            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                <Icon name="close" size={24} color={theme.colors.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        {/* Amount Section */}
                        <View style={[styles.amountSection, { backgroundColor: colors.light }]}>
                            <Icon
                                name={colors.icon}
                                size={32}
                                color={colors.main}
                                style={styles.typeIcon}
                            />
                            <Text style={[styles.amountText, { color: colors.main }]}>
                                {transaction.type === 'expense' ? '-' : '+'}{formatAmount(transaction.amount)}
                            </Text>
                            <Text style={[styles.typeText, { color: theme.colors.textSecondary }]}>
                                {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                            </Text>
                        </View>

                        {/* Details Section */}
                        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                            <View style={styles.detailsSection}>
                                {/* Date */}
                                <View style={styles.detailRow}>
                                    <View style={styles.detailLabel}>
                                        <Icon name="calendar-outline" size={20} color={theme.colors.textSecondary} />
                                        <Text style={[styles.detailLabelText, { color: theme.colors.textSecondary }]}>
                                            Date
                                        </Text>
                                    </View>
                                    <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                                        {dayjs(transaction.date).format('MMM DD, YYYY - h:mm A')}
                                    </Text>
                                </View>

                                {/* Account(s) */}
                                {transaction.type === 'transfer' ? (
                                    <>
                                        <View style={styles.detailRow}>
                                            <View style={styles.detailLabel}>
                                                <Icon name="arrow-up-circle-outline" size={20} color={theme.colors.textSecondary} />
                                                <Text style={[styles.detailLabelText, { color: theme.colors.textSecondary }]}>
                                                    From Account
                                                </Text>
                                            </View>
                                            <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                                                {fromAccount?.name || 'Unknown Account'}
                                            </Text>
                                        </View>
                                        <View style={styles.detailRow}>
                                            <View style={styles.detailLabel}>
                                                <Icon name="arrow-down-circle-outline" size={20} color={theme.colors.textSecondary} />
                                                <Text style={[styles.detailLabelText, { color: theme.colors.textSecondary }]}>
                                                    To Account
                                                </Text>
                                            </View>
                                            <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                                                {toAccount?.name || 'Unknown Account'}
                                            </Text>
                                        </View>
                                    </>
                                ) : (
                                    <View style={styles.detailRow}>
                                        <View style={styles.detailLabel}>
                                            <Icon name="wallet-outline" size={20} color={theme.colors.textSecondary} />
                                            <Text style={[styles.detailLabelText, { color: theme.colors.textSecondary }]}>
                                                Account
                                            </Text>
                                        </View>
                                        <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                                            {fromAccount?.name || 'Unknown Account'}
                                        </Text>
                                    </View>
                                )}

                                {/* Category (for income/expense) */}
                                {transaction.type !== 'transfer' && (
                                    <View style={styles.detailRow}>
                                        <View style={styles.detailLabel}>
                                            <Icon name="folder-outline" size={20} color={theme.colors.textSecondary} />
                                            <Text style={[styles.detailLabelText, { color: theme.colors.textSecondary }]}>
                                                Category
                                            </Text>
                                        </View>
                                        <View style={styles.categoryValue}>
                                            {category && (
                                                <View
                                                    style={[
                                                        styles.categoryColorDot,
                                                        { backgroundColor: category.color || colors.main }
                                                    ]}
                                                />
                                            )}
                                            <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                                                {category?.name || 'No Category'}
                                            </Text>
                                        </View>
                                    </View>
                                )}

                                {/* Note */}
                                {transaction.note && (
                                    <View style={[styles.detailRow, styles.noteRow]}>
                                        <View style={styles.detailLabel}>
                                            <Icon name="document-text-outline" size={20} color={theme.colors.textSecondary} />
                                            <Text style={[styles.detailLabelText, { color: theme.colors.textSecondary }]}>
                                                Note
                                            </Text>
                                        </View>
                                        <Text style={[styles.detailValue, styles.noteText, { color: theme.colors.text }]}>
                                            {transaction.note}
                                        </Text>
                                    </View>
                                )}

                                {/* Tags */}
                                {transaction.tags.length > 0 && (
                                    <View style={[styles.detailRow, styles.tagsRow]}>
                                        <View style={styles.detailLabel}>
                                            <Icon name="pricetags-outline" size={20} color={theme.colors.textSecondary} />
                                            <Text style={[styles.detailLabelText, { color: theme.colors.textSecondary }]}>
                                                Tags
                                            </Text>
                                        </View>
                                        <View style={styles.tagsContainer}>
                                            {transaction.tags.map((tag, index) => (
                                                <View
                                                    key={index}
                                                    style={[
                                                        styles.tag,
                                                        {
                                                            backgroundColor: theme.colors.primary[50],
                                                            borderColor: theme.colors.primary[200]
                                                        }
                                                    ]}
                                                >
                                                    <Text style={[styles.tagText, { color: theme.colors.primary[600] }]}>
                                                        {tag}
                                                    </Text>
                                                </View>
                                            ))}
                                        </View>
                                    </View>
                                )}

                                {/* Transaction ID */}
                                <View style={styles.detailRow}>
                                    <View style={styles.detailLabel}>
                                        <Icon name="finger-print-outline" size={20} color={theme.colors.textSecondary} />
                                        <Text style={[styles.detailLabelText, { color: theme.colors.textSecondary }]}>
                                            ID
                                        </Text>
                                    </View>
                                    <Text style={[styles.detailValue, styles.idText, { color: theme.colors.textSecondary }]}>
                                        {transaction.id.substring(0, 8)}...
                                    </Text>
                                </View>
                            </View>
                        </ScrollView>

                        {/* Action Buttons */}
                        {(onEdit || onDelete) && (
                            <View style={[
                                styles.actionButtons,
                                {
                                    backgroundColor: theme.colors.surface,
                                    borderTopColor: theme.colors.border
                                }
                            ]}>
                                {onEdit && (
                                    <TouchableOpacity
                                        onPress={() => {
                                            onEdit(transaction);
                                            onClose();
                                        }}
                                        style={[
                                            styles.actionButton,
                                            {
                                                backgroundColor: theme.colors.primary[500],
                                            }
                                        ]}
                                        activeOpacity={0.8}
                                    >
                                        <Icon name="create-outline" size={20} color={theme.colors.onPrimary} />
                                        <Text style={[styles.actionButtonText, { color: theme.colors.onPrimary }]}>
                                            Edit
                                        </Text>
                                    </TouchableOpacity>
                                )}
                                {onDelete && (
                                    <TouchableOpacity
                                        onPress={() => {
                                            onDelete(transaction);
                                            onClose();
                                        }}
                                        style={[
                                            styles.actionButton,
                                            {
                                                backgroundColor: theme.colors.error[500],
                                            }
                                        ]}
                                        activeOpacity={0.8}
                                    >
                                        <Icon name="trash-outline" size={20} color={theme.colors.onError} />
                                        <Text style={[styles.actionButtonText, { color: theme.colors.onError }]}>
                                            Delete
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}
                    </View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    keyboardAvoid: {
        justifyContent: 'flex-end',
    },
    container: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: '85%',
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
    },
    closeButton: {
        padding: 4,
    },
    scrollContainer: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    amountSection: {
        alignItems: 'center',
        paddingVertical: 24,
        paddingHorizontal: 20,
        marginHorizontal: 20,
        borderRadius: 16,
        marginTop: 16,
        marginBottom: 16,
    },
    typeIcon: {
        marginBottom: 8,
    },
    amountText: {
        fontSize: 32,
        fontWeight: '700',
        marginBottom: 4,
    },
    typeText: {
        fontSize: 16,
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    detailsSection: {
        gap: 16,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        paddingVertical: 8,
    },
    noteRow: {
        alignItems: 'flex-start',
    },
    tagsRow: {
        alignItems: 'flex-start',
    },
    detailLabel: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: 16,
    },
    detailLabelText: {
        fontSize: 14,
        fontWeight: '500',
        marginLeft: 8,
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '400',
        flex: 1,
        textAlign: 'right',
    },
    categoryValue: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        justifyContent: 'flex-end',
    },
    categoryColorDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 8,
    },
    noteText: {
        textAlign: 'right',
        lineHeight: 20,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        flex: 1,
        justifyContent: 'flex-end',
    },
    tag: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
    },
    tagText: {
        fontSize: 12,
        fontWeight: '500',
    },
    idText: {
        fontSize: 12,
        fontFamily: 'monospace',
    },
    actionButtons: {
        flexDirection: 'row',
        padding: 16,
        paddingBottom: 24,
        borderTopWidth: 1,
        gap: 12,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 12,
        gap: 8,
    },
    actionButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});

export default TransactionDetailsModal;