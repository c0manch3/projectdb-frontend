import { useCallback, useMemo } from 'react';
import { UseFormReturn, FieldPath, FieldValues } from 'react-hook-form';
import { ZodSchema, ZodError } from 'zod';

/**
 * Enhanced form validation hook that works with React Hook Form and Zod
 * Provides additional validation utilities and error handling patterns
 */
export function useFormValidation<T extends FieldValues>(
  form: UseFormReturn<T>,
  schema: ZodSchema<T>
) {
  const { 
    formState: { errors, isSubmitting, isValid, isDirty },
    getValues,
    trigger,
    setError,
    clearErrors,
  } = form;

  // Validate a specific field
  const validateField = useCallback(async (fieldName: FieldPath<T>) => {
    const result = await trigger(fieldName);
    return result;
  }, [trigger]);

  // Validate all fields
  const validateAllFields = useCallback(async () => {
    const result = await trigger();
    return result;
  }, [trigger]);

  // Get field error message
  const getFieldError = useCallback((fieldName: FieldPath<T>): string | undefined => {
    const error = errors[fieldName];
    return error?.message as string | undefined;
  }, [errors]);

  // Check if field has error
  const hasFieldError = useCallback((fieldName: FieldPath<T>): boolean => {
    return !!errors[fieldName];
  }, [errors]);

  // Validate with Zod schema directly
  const validateWithSchema = useCallback(async (data: T) => {
    try {
      const validData = schema.parse(data);
      return { success: true, data: validData, errors: null };
    } catch (error) {
      if (error instanceof ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          const field = err.path.join('.') as FieldPath<T>;
          fieldErrors[field] = err.message;
          setError(field, { message: err.message });
        });
        return { success: false, data: null, errors: fieldErrors };
      }
      return { success: false, data: null, errors: { root: 'Validation failed' } };
    }
  }, [schema, setError]);

  // Clear all form errors
  const clearAllErrors = useCallback(() => {
    clearErrors();
  }, [clearErrors]);

  // Get form state summary
  const formState = useMemo(() => ({
    isValid,
    isDirty,
    isSubmitting,
    hasErrors: Object.keys(errors).length > 0,
    errorCount: Object.keys(errors).length,
  }), [isValid, isDirty, isSubmitting, errors]);

  // Get accessibility props for form fields
  const getFieldProps = useCallback((fieldName: FieldPath<T>) => {
    const hasError = hasFieldError(fieldName);
    const errorId = `${fieldName}-error`;
    
    return {
      'aria-invalid': hasError ? 'true' as const : 'false' as const,
      'aria-describedby': hasError ? errorId : undefined,
      'data-error': hasError,
    };
  }, [hasFieldError]);

  // Get error message props for field error display
  const getErrorProps = useCallback((fieldName: FieldPath<T>) => {
    const errorId = `${fieldName}-error`;
    
    return {
      id: errorId,
      role: 'alert' as const,
      'aria-live': 'polite' as const,
    };
  }, []);

  return {
    // Validation functions
    validateField,
    validateAllFields,
    validateWithSchema,
    
    // Error handling
    getFieldError,
    hasFieldError,
    clearAllErrors,
    
    // Form state
    formState,
    
    // Accessibility helpers
    getFieldProps,
    getErrorProps,
    
    // Direct access to form errors and state
    errors,
    isSubmitting,
    isValid,
    isDirty,
  };
}

/**
 * Form validation utilities
 */
export const FormValidationUtils = {
  // Common validation patterns
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^[\+\d\s\-\(\)]+$/,
  
  // Password strength validation
  validatePasswordStrength: (password: string) => {
    const strength = {
      score: 0,
      feedback: [] as string[],
    };
    
    if (password.length >= 8) strength.score += 1;
    else strength.feedback.push('Минимум 8 символов');
    
    if (/[A-Z]/.test(password)) strength.score += 1;
    else strength.feedback.push('Хотя бы одна заглавная буква');
    
    if (/[a-z]/.test(password)) strength.score += 1;
    else strength.feedback.push('Хотя бы одна строчная буква');
    
    if (/\d/.test(password)) strength.score += 1;
    else strength.feedback.push('Хотя бы одна цифра');
    
    if (/[^A-Za-z\d]/.test(password)) strength.score += 1;
    else strength.feedback.push('Хотя бы один специальный символ');
    
    return strength;
  },
  
  // Age validation
  validateAge: (birthDate: string, minAge = 16, maxAge = 100) => {
    const birth = new Date(birthDate);
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      return age - 1;
    }
    
    return age >= minAge && age <= maxAge;
  },
  
  // File validation
  validateFile: (file: File, options: {
    maxSize?: number; // in bytes
    allowedTypes?: string[];
  } = {}) => {
    const { maxSize = 5 * 1024 * 1024, allowedTypes = [] } = options; // 5MB default
    
    const errors: string[] = [];
    
    if (file.size > maxSize) {
      errors.push(`Размер файла не должен превышать ${Math.round(maxSize / 1024 / 1024)}MB`);
    }
    
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      errors.push(`Разрешены только файлы типов: ${allowedTypes.join(', ')}`);
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  },
};

export default useFormValidation;