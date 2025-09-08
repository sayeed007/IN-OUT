import { useState, useCallback, useMemo } from 'react';
import { useAddTransactionMutation, useUpdateTransactionMutation } from '../../../state/api';
import { Transaction, TransactionType } from '../../../types/global';

interface TransactionFormData {
    type: TransactionType;
    amount: string;
    accountId: string;
    accountIdTo?: string;
    categoryId?: string;
    date: string;
    note: string;
    tags: string[];
}

interface UseTransactionFormProps {
    initialData?: Partial<Transaction>;
    onSuccess?: () => void;
    onError?: (error: string) => void;
}

export const useTransactionForm = ({
    initialData,
    onSuccess,
    onError,
}: UseTransactionFormProps = {}) => {
    const [addTransaction] = useAddTransactionMutation();
    const [updateTransaction] = useUpdateTransactionMutation();

    const [formData, setFormData] = useState<TransactionFormData>({
        type: initialData?.type || 'expense',
        amount: initialData?.amount?.toString() || '',
        accountId: initialData?.accountId || '',
        accountIdTo: initialData?.accountIdTo || undefined,
        categoryId: initialData?.categoryId || undefined,
        date: initialData?.date || new Date().toISOString().split('T')[0],
        note: initialData?.note || '',
        tags: initialData?.tags || [],
    });

    const [errors, setErrors] = useState<Partial<Record<keyof TransactionFormData, string>>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Validation rules
    const validateForm = useCallback((): boolean => {
        const newErrors: Partial<Record<keyof TransactionFormData, string>> = {};

        // Amount validation
        if (!formData.amount || parseFloat(formData.amount) <= 0) {
            newErrors.amount = 'Amount must be greater than 0';
        }

        // Account validation
        if (!formData.accountId) {
            newErrors.accountId = 'Account is required';
        }

        // Transfer validation
        if (formData.type === 'transfer') {
            if (!formData.accountIdTo) {
                newErrors.accountIdTo = 'Destination account is required for transfers';
            }
            if (formData.accountId === formData.accountIdTo) {
                newErrors.accountIdTo = 'Source and destination accounts must be different';
            }
        } else {
            // Income/Expense validation
            if (!formData.categoryId) {
                newErrors.categoryId = 'Category is required';
            }
        }

        // Date validation
        if (!formData.date) {
            newErrors.date = 'Date is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData]);

    // Update form field
    const updateField = useCallback((field: keyof TransactionFormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        // Clear error for this field when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    }, [errors]);

    // Add tag
    const addTag = useCallback((tag: string) => {
        const trimmedTag = tag.trim();
        if (trimmedTag && !formData.tags.includes(trimmedTag)) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, trimmedTag],
            }));
        }
    }, [formData.tags]);

    // Remove tag
    const removeTag = useCallback((index: number) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter((_, i) => i !== index),
        }));
    }, []);

    // Handle transaction type change
    const setTransactionType = useCallback((type: TransactionType) => {
        setFormData(prev => ({
            ...prev,
            type,
            // Clear category for transfers
            categoryId: type === 'transfer' ? undefined : prev.categoryId,
            // Clear destination account for non-transfers
            accountIdTo: type === 'transfer' ? prev.accountIdTo : undefined,
        }));
    }, []);

    // Submit form
    const submitForm = useCallback(async () => {
        if (!validateForm()) {
            return false;
        }

        setIsSubmitting(true);

        try {
            const transactionData: Partial<Transaction> = {
                type: formData.type,
                amount: parseFloat(formData.amount),
                accountId: formData.accountId,
                accountIdTo: formData.accountIdTo,
                categoryId: formData.categoryId,
                date: formData.date,
                note: formData.note,
                tags: formData.tags,
                currencyCode: 'BDT', // TODO: Get from user preferences
            };

            if (initialData?.id) {
                // Update existing transaction
                await updateTransaction({ id: initialData.id, ...transactionData }).unwrap();
            } else {
                // Create new transaction
                await addTransaction(transactionData).unwrap();
            }

            onSuccess?.();
            return true;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to save transaction';
            onError?.(errorMessage);
            return false;
        } finally {
            setIsSubmitting(false);
        }
    }, [
        formData,
        validateForm,
        initialData?.id,
        addTransaction,
        updateTransaction,
        onSuccess,
        onError,
    ]);

    // Reset form
    const resetForm = useCallback(() => {
        setFormData({
            type: 'expense',
            amount: '',
            accountId: '',
            accountIdTo: undefined,
            categoryId: undefined,
            date: new Date().toISOString().split('T')[0],
            note: '',
            tags: [],
        });
        setErrors({});
    }, []);

    // Check if form is valid
    const isValid = useMemo(() => {
        return formData.amount &&
            parseFloat(formData.amount) > 0 &&
            formData.accountId &&
            formData.date &&
            (formData.type !== 'transfer' ? formData.categoryId : formData.accountIdTo);
    }, [formData]);

    // Check if form has changes
    const hasChanges = useMemo(() => {
        if (!initialData) return true;

        return formData.type !== initialData.type ||
            formData.amount !== initialData.amount?.toString() ||
            formData.accountId !== initialData.accountId ||
            formData.accountIdTo !== initialData.accountIdTo ||
            formData.categoryId !== initialData.categoryId ||
            formData.date !== initialData.date ||
            formData.note !== initialData.note ||
            JSON.stringify(formData.tags) !== JSON.stringify(initialData.tags);
    }, [formData, initialData]);

    return {
        formData,
        errors,
        isSubmitting,
        isValid,
        hasChanges,
        updateField,
        addTag,
        removeTag,
        setTransactionType,
        submitForm,
        resetForm,
        validateForm,
    };
};
