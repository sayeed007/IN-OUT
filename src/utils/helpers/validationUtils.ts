// src/utils/helpers/validationUtils.ts

/**
 * Validation utilities for forms and data
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface ValidationRule {
  validate: (value: any) => boolean;
  message: string;
}

/**
 * Validate required field
 */
export const validateRequired = (value: any): ValidationResult => {
  const isValid = value !== undefined && value !== null && value !== '';
  return {
    isValid,
    errors: isValid ? [] : ['This field is required']
  };
};

/**
 * Validate number
 */
export const validateNumber = (value: any, min?: number, max?: number): ValidationResult => {
  const errors: string[] = [];
  const num = parseFloat(value);
  
  if (isNaN(num)) {
    errors.push('Must be a valid number');
  } else {
    if (min !== undefined && num < min) {
      errors.push(`Must be at least ${min}`);
    }
    if (max !== undefined && num > max) {
      errors.push(`Must be at most ${max}`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate positive number
 */
export const validatePositiveNumber = (value: any): ValidationResult => {
  const numResult = validateNumber(value, 0.01);
  if (!numResult.isValid) return numResult;
  
  return {
    isValid: true,
    errors: []
  };
};

/**
 * Validate amount
 */
export const validateAmount = (value: any): ValidationResult => {
  const requiredResult = validateRequired(value);
  if (!requiredResult.isValid) return requiredResult;
  
  return validatePositiveNumber(value);
};

/**
 * Validate email
 */
export const validateEmail = (email: string): ValidationResult => {
  const requiredResult = validateRequired(email);
  if (!requiredResult.isValid) return requiredResult;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValid = emailRegex.test(email.trim());
  
  return {
    isValid,
    errors: isValid ? [] : ['Please enter a valid email address']
  };
};

/**
 * Validate string length
 */
export const validateStringLength = (
  value: string,
  minLength: number = 0,
  maxLength: number = Infinity
): ValidationResult => {
  const errors: string[] = [];
  const length = value?.length || 0;
  
  if (length < minLength) {
    errors.push(`Must be at least ${minLength} characters`);
  }
  if (length > maxLength) {
    errors.push(`Must be at most ${maxLength} characters`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate account name
 */
export const validateAccountName = (name: string): ValidationResult => {
  const requiredResult = validateRequired(name);
  if (!requiredResult.isValid) return requiredResult;
  
  return validateStringLength(name.trim(), 1, 50);
};

/**
 * Validate category name
 */
export const validateCategoryName = (name: string): ValidationResult => {
  const requiredResult = validateRequired(name);
  if (!requiredResult.isValid) return requiredResult;
  
  return validateStringLength(name.trim(), 1, 30);
};

/**
 * Validate transaction note
 */
export const validateTransactionNote = (note?: string): ValidationResult => {
  if (!note) {
    return { isValid: true, errors: [] };
  }
  
  return validateStringLength(note, 0, 200);
};

/**
 * Validate PIN
 */
export const validatePIN = (pin: string): ValidationResult => {
  const requiredResult = validateRequired(pin);
  if (!requiredResult.isValid) return requiredResult;
  
  const pinRegex = /^\d{4,6}$/;
  const isValid = pinRegex.test(pin);
  
  return {
    isValid,
    errors: isValid ? [] : ['PIN must be 4-6 digits']
  };
};

/**
 * Validate date
 */
export const validateDate = (date: any): ValidationResult => {
  const requiredResult = validateRequired(date);
  if (!requiredResult.isValid) return requiredResult;
  
  const d = new Date(date);
  const isValid = !isNaN(d.getTime());
  
  return {
    isValid,
    errors: isValid ? [] : ['Please enter a valid date']
  };
};

/**
 * Validate future date
 */
export const validateFutureDate = (date: any): ValidationResult => {
  const dateResult = validateDate(date);
  if (!dateResult.isValid) return dateResult;
  
  const d = new Date(date);
  const now = new Date();
  const isValid = d > now;
  
  return {
    isValid,
    errors: isValid ? [] : ['Date must be in the future']
  };
};

/**
 * Validate currency code
 */
export const validateCurrencyCode = (code: string): ValidationResult => {
  const requiredResult = validateRequired(code);
  if (!requiredResult.isValid) return requiredResult;
  
  const currencyRegex = /^[A-Z]{3}$/;
  const isValid = currencyRegex.test(code.trim());
  
  return {
    isValid,
    errors: isValid ? [] : ['Currency code must be 3 uppercase letters']
  };
};

/**
 * Validate multiple fields with rules
 */
export const validateFields = (
  data: Record<string, any>,
  rules: Record<string, ValidationRule[]>
): Record<string, ValidationResult> => {
  const results: Record<string, ValidationResult> = {};
  
  for (const [field, fieldRules] of Object.entries(rules)) {
    const value = data[field];
    const errors: string[] = [];
    
    for (const rule of fieldRules) {
      if (!rule.validate(value)) {
        errors.push(rule.message);
      }
    }
    
    results[field] = {
      isValid: errors.length === 0,
      errors
    };
  }
  
  return results;
};

/**
 * Check if validation results have any errors
 */
export const hasValidationErrors = (results: Record<string, ValidationResult>): boolean => {
  return Object.values(results).some(result => !result.isValid);
};

/**
 * Get all validation errors as flat array
 */
export const getAllValidationErrors = (results: Record<string, ValidationResult>): string[] => {
  return Object.values(results).flatMap(result => result.errors);
};

/**
 * Validate transaction data
 */
export const validateTransaction = (data: {
  type: string;
  amount: number;
  accountId: string;
  accountIdTo?: string;
  categoryId?: string;
  date: string;
  note?: string;
}): Record<string, ValidationResult> => {
  const results: Record<string, ValidationResult> = {};
  
  // Validate type
  results.type = validateRequired(data.type);
  
  // Validate amount
  results.amount = validateAmount(data.amount);
  
  // Validate account
  results.accountId = validateRequired(data.accountId);
  
  // Validate transfer account if transfer
  if (data.type === 'transfer') {
    results.accountIdTo = validateRequired(data.accountIdTo);
    if (data.accountId === data.accountIdTo && data.accountId && data.accountIdTo) {
      results.accountIdTo = {
        isValid: false,
        errors: ['Cannot transfer to the same account']
      };
    }
  } else {
    // Validate category for income/expense
    results.categoryId = validateRequired(data.categoryId);
  }
  
  // Validate date
  results.date = validateDate(data.date);
  
  // Validate note (optional)
  if (data.note) {
    results.note = validateTransactionNote(data.note);
  }
  
  return results;
};

/**
 * Validate account data
 */
export const validateAccount = (data: {
  name: string;
  type: string;
  openingBalance: number;
  currencyCode: string;
}): Record<string, ValidationResult> => {
  return {
    name: validateAccountName(data.name),
    type: validateRequired(data.type),
    openingBalance: validateNumber(data.openingBalance),
    currencyCode: validateCurrencyCode(data.currencyCode),
  };
};

/**
 * Validate category data
 */
export const validateCategory = (data: {
  name: string;
  type: string;
  color: string;
  icon: string;
}): Record<string, ValidationResult> => {
  return {
    name: validateCategoryName(data.name),
    type: validateRequired(data.type),
    color: validateRequired(data.color),
    icon: validateRequired(data.icon),
  };
};

/**
 * Validate budget data
 */
export const validateBudget = (data: {
  categoryId: string;
  amount: number;
  month: string;
}): Record<string, ValidationResult> => {
  return {
    categoryId: validateRequired(data.categoryId),
    amount: validatePositiveNumber(data.amount),
    month: validateRequired(data.month),
  };
};
