// src/utils/hooks/useTransactionForm.ts
import { useState } from 'react';
import type { TransactionType } from '../../types/global';

interface TransactionFormData {
  amount: number;
  description: string;
  type: TransactionType;
  categoryId: string;
  accountId: string;
  accountIdTo?: string; // For transfers
  date: string;
  tags: string[];
  note?: string;
}

interface TransactionFormErrors {
  amount?: string;
  description?: string;
  categoryId?: string;
  accountId?: string;
  accountIdTo?: string;
}

interface UseTransactionFormReturn {
  formData: TransactionFormData;
  errors: TransactionFormErrors;
  isSubmitting: boolean;
  isValid: boolean;
  updateField: (field: keyof TransactionFormData, value: any) => void;
  addTag: (tag: string) => void;
  removeTag: (tag: string) => void;
  submitTransaction: () => Promise<void>;
  resetForm: () => void;
}

const initialFormData: TransactionFormData = {
  amount: 0,
  description: '',
  type: 'expense',
  categoryId: '',
  accountId: '',
  date: new Date().toISOString(),
  tags: [],
  note: '',
};

export const useTransactionForm = (): UseTransactionFormReturn => {
  const [formData, setFormData] = useState<TransactionFormData>(initialFormData);
  const [errors, setErrors] = useState<TransactionFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: TransactionFormErrors = {};

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Amount is required and must be greater than 0';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.accountId) {
      newErrors.accountId = 'Account is required';
    }

    if (formData.type !== 'transfer' && !formData.categoryId) {
      newErrors.categoryId = 'Category is required';
    }

    if (formData.type === 'transfer' && !formData.accountIdTo) {
      newErrors.accountIdTo = 'Destination account is required for transfers';
    }

    if (formData.type === 'transfer' && formData.accountId === formData.accountIdTo) {
      newErrors.accountIdTo = 'Destination account must be different from source account';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const updateField = (field: keyof TransactionFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for the field being updated
    if (errors[field as keyof TransactionFormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const addTag = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const submitTransaction = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: Implement actual transaction submission
      // This would typically call an API or dispatch a Redux action
      console.log('Submitting transaction:', formData);
      
      // Simulate API call
      await new Promise<void>(resolve => setTimeout(() => resolve(), 1000));
      
      // Reset form on success
      resetForm();
    } catch (error) {
      console.error('Failed to submit transaction:', error);
      // Handle error (could set form-level error state)
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setErrors({});
  };

  const isValid = Object.keys(errors).length === 0 && 
                  formData.amount > 0 && 
                  formData.description.trim() !== '' &&
                  formData.accountId !== '';

  return {
    formData,
    errors,
    isSubmitting,
    isValid,
    updateField,
    addTag,
    removeTag,
    submitTransaction,
    resetForm,
  };
};