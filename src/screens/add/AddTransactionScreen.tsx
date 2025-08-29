// src/screens/add/AddTransactionScreen.tsx
import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Alert,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeContainer } from '../../components/layout/SafeContainer';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Chip } from '../../components/ui/Chip';
import { Modal } from '../../components/ui/Modal';
import { AmountKeypad } from '../../components/forms/AmountKeypad';
import { FormField, SelectField, TagsField } from '../../components/forms/FormFields';
import { useTransactionForm } from '../../features/transactions/hooks/useTransactionForm';
import { useGetAccountsQuery, useGetCategoriesQuery } from '../../state/api';
import { TransactionType } from '../../types/global';
import { getTransactionTypeColor, getTransactionTypeIcon } from '../../features/transactions/utils/transactionUtils';
import { Spacing } from '../../theme';

export const AddTransactionScreen: React.FC = () => {
    const navigation = useNavigation();
    const [showAmountKeypad, setShowAmountKeypad] = useState(false);
    const [showAccountSelector, setShowAccountSelector] = useState(false);
    const [showCategorySelector, setShowCategorySelector] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Data queries
    const { data: accounts = [] } = useGetAccountsQuery();
    const { data: categories = [] } = useGetCategoriesQuery();

    // Form hook
    const {
        formData,
        errors,
        isSubmitting,
        isValid,
        updateField,
        addTag,
        removeTag,
        setTransactionType,
        submitForm,
        resetForm,
    } = useTransactionForm({
        onSuccess: () => {
            Alert.alert('Success', 'Transaction added successfully!');
            navigation.goBack();
        },
        onError: (error) => {
            Alert.alert('Error', error);
        },
    });

    // Get selected account and category names
    const selectedAccount = accounts.find(acc => acc.id === formData.accountId);
    const selectedCategory = categories.find(cat => cat.id === formData.categoryId);
    const selectedAccountTo = accounts.find(acc => acc.id === formData.accountIdTo);

    // Filter categories by transaction type
    const filteredCategories = categories.filter(cat => cat.type === formData.type);

    // Handle form submission
    const handleSubmit = useCallback(async () => {
        const success = await submitForm();
        if (success) {
            resetForm();
        }
    }, [submitForm, resetForm]);

    // Handle transaction type change
    const handleTypeChange = useCallback((type: TransactionType) => {
        setTransactionType(type);
    }, [setTransactionType]);

    // Handle account selection
    const handleAccountSelect = useCallback((accountId: string) => {
        updateField('accountId', accountId);
        setShowAccountSelector(false);
    }, [updateField]);

    // Handle destination account selection (for transfers)
    const handleAccountToSelect = useCallback((accountId: string) => {
        updateField('accountIdTo', accountId);
        setShowAccountSelector(false);
    }, [updateField]);

    // Handle category selection
    const handleCategorySelect = useCallback((categoryId: string) => {
        updateField('categoryId', categoryId);
        setShowCategorySelector(false);
    }, [updateField]);

    // Handle date selection
    const handleDateSelect = useCallback((date: string) => {
        updateField('date', date);
        setShowDatePicker(false);
    }, [updateField]);

    // Get transaction type options
    const transactionTypes: Array<{ type: TransactionType; label: string; color: string; icon: string }> = [
        { type: 'expense', label: 'Expense', color: getTransactionTypeColor('expense'), icon: getTransactionTypeIcon('expense') },
        { type: 'income', label: 'Income', color: getTransactionTypeColor('income'), icon: getTransactionTypeIcon('income') },
        { type: 'transfer', label: 'Transfer', color: getTransactionTypeColor('transfer'), icon: getTransactionTypeIcon('transfer') },
    ];

    return (
        <SafeContainer>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Add Transaction</Text>
                        <Text style={styles.subtitle}>Record your income, expense, or transfer</Text>
                    </View>

                    {/* Transaction Type Selector */}
                    <Card style={styles.card}>
                        <Text style={styles.sectionTitle}>Transaction Type</Text>
                        <View style={styles.typeSelector}>
                            {transactionTypes.map(({ type, label, color, icon }) => (
                                <Chip
                                    key={type}
                                    label={label}
                                    selected={formData.type === type}
                                    onPress={() => handleTypeChange(type)}
                                    color={color}
                                    icon={icon}
                                    style={styles.typeChip}
                                />
                            ))}
                        </View>
                    </Card>

                    {/* Amount Section */}
                    <Card style={styles.card}>
                        <Text style={styles.sectionTitle}>Amount</Text>
                        <TouchableOpacity
                            style={styles.amountContainer}
                            onPress={() => setShowAmountKeypad(true)}
                        >
                            <Text style={styles.amountLabel}>Amount</Text>
                            <Text style={styles.amountValue}>
                                {formData.amount ? `$${parseFloat(formData.amount).toFixed(2)}` : 'Enter amount'}
                            </Text>
                            {errors.amount && <Text style={styles.errorText}>{errors.amount}</Text>}
                        </TouchableOpacity>
                    </Card>

                    {/* Account Section */}
                    <Card style={styles.card}>
                        <Text style={styles.sectionTitle}>Account</Text>
                        <SelectField
                            label="From Account"
                            value={selectedAccount?.name || ''}
                            onPress={() => setShowAccountSelector(true)}
                            placeholder="Select account"
                            error={errors.accountId}
                            required
                        />

                        {formData.type === 'transfer' && (
                            <SelectField
                                label="To Account"
                                value={selectedAccountTo?.name || ''}
                                onPress={() => setShowAccountSelector(true)}
                                placeholder="Select destination account"
                                error={errors.accountIdTo}
                                required
                            />
                        )}
                    </Card>

                    {/* Category Section (hidden for transfers) */}
                    {formData.type !== 'transfer' && (
                        <Card style={styles.card}>
                            <Text style={styles.sectionTitle}>Category</Text>
                            <SelectField
                                label="Category"
                                value={selectedCategory?.name || ''}
                                onPress={() => setShowCategorySelector(true)}
                                placeholder="Select category"
                                error={errors.categoryId}
                                required
                            />
                        </Card>
                    )}

                    {/* Date Section */}
                    <Card style={styles.card}>
                        <Text style={styles.sectionTitle}>Date</Text>
                        <SelectField
                            label="Date"
                            value={formData.date}
                            onPress={() => setShowDatePicker(true)}
                            placeholder="Select date"
                            error={errors.date}
                            required
                        />
                    </Card>

                    {/* Note Section */}
                    <Card style={styles.card}>
                        <Text style={styles.sectionTitle}>Note</Text>
                        <FormField
                            label="Note"
                            value={formData.note}
                            onChangeText={(text) => updateField('note', text)}
                            placeholder="Add a note (optional)"
                            multiline
                            maxLength={200}
                        />
                    </Card>

                    {/* Tags Section */}
                    <Card style={styles.card}>
                        <Text style={styles.sectionTitle}>Tags</Text>
                        <TagsField
                            label="Tags"
                            tags={formData.tags}
                            onAddTag={addTag}
                            onRemoveTag={removeTag}
                            placeholder="Add tags (optional)"
                        />
                    </Card>

                    {/* Submit Button */}
                    <View style={styles.submitContainer}>
                        <Button
                            title="Save Transaction"
                            onPress={handleSubmit}
                            disabled={!isValid || isSubmitting}
                            loading={isSubmitting}
                            style={styles.submitButton}
                        />
                    </View>
                </ScrollView>

                {/* Amount Keypad Modal */}
                <Modal
                    visible={showAmountKeypad}
                    onClose={() => setShowAmountKeypad(false)}
                    title="Enter Amount"
                >
                    <AmountKeypad
                        value={formData.amount}
                        onChange={(value) => updateField('amount', value)}
                        currencyCode="USD"
                        onDone={() => setShowAmountKeypad(false)}
                    />
                </Modal>

                {/* Account Selector Modal */}
                <Modal
                    visible={showAccountSelector}
                    onClose={() => setShowAccountSelector(false)}
                    title="Select Account"
                >
                    <ScrollView style={styles.selectorList}>
                        {accounts.map((account) => (
                            <TouchableOpacity
                                key={account.id}
                                style={styles.selectorItem}
                                onPress={() => handleAccountSelect(account.id)}
                            >
                                <Text style={styles.selectorItemText}>{account.name}</Text>
                                <Text style={styles.selectorItemSubtext}>{account.type}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </Modal>

                {/* Category Selector Modal */}
                <Modal
                    visible={showCategorySelector}
                    onClose={() => setShowCategorySelector(false)}
                    title="Select Category"
                >
                    <ScrollView style={styles.selectorList}>
                        {filteredCategories.map((category) => (
                            <TouchableOpacity
                                key={category.id}
                                style={styles.selectorItem}
                                onPress={() => handleCategorySelect(category.id)}
                            >
                                <View style={styles.categoryItem}>
                                    <View style={[styles.categoryColor, { backgroundColor: category.color }]} />
                                    <Text style={styles.selectorItemText}>{category.name}</Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </Modal>

                {/* Date Picker Modal */}
                <Modal
                    visible={showDatePicker}
                    onClose={() => setShowDatePicker(false)}
                    title="Select Date"
                >
                    {/* TODO: Implement date picker component */}
                    <View style={styles.datePickerPlaceholder}>
                        <Text>Date picker will be implemented here</Text>
                    </View>
                </Modal>
            </KeyboardAvoidingView>
        </SafeContainer>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    header: {
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.xl,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#111827',
        marginBottom: Spacing.xs,
    },
    subtitle: {
        fontSize: 16,
        color: '#6B7280',
    },
    card: {
        marginHorizontal: Spacing.lg,
        marginBottom: Spacing.md,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
        marginBottom: Spacing.md,
    },
    typeSelector: {
        flexDirection: 'row',
        gap: Spacing.sm,
    },
    typeChip: {
        flex: 1,
    },
    amountContainer: {
        paddingVertical: Spacing.md,
    },
    amountLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        marginBottom: Spacing.sm,
    },
    amountValue: {
        fontSize: 24,
        fontWeight: '700',
        color: '#111827',
        textAlign: 'center',
        paddingVertical: Spacing.lg,
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
    },
    errorText: {
        color: '#EF4444',
        fontSize: 14,
        marginTop: Spacing.xs,
    },
    submitContainer: {
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.xl,
    },
    submitButton: {
        height: 56,
    },
    selectorList: {
        maxHeight: 300,
    },
    selectorItem: {
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    selectorItemText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#111827',
    },
    selectorItemSubtext: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: Spacing.xs,
    },
    categoryItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    categoryColor: {
        width: 16,
        height: 16,
        borderRadius: 8,
        marginRight: Spacing.sm,
    },
    datePickerPlaceholder: {
        padding: Spacing.xl,
        alignItems: 'center',
    },
});


