import { FormErrors, UseFormReturn } from '@/types';
import { useCallback, useMemo, useState } from 'react';

type ValidationRule<T> = (value: T[keyof T], values: T) => string | undefined;
type ValidationRules<T> = Partial<Record<keyof T, ValidationRule<T>[]>>;

interface UseFormProps<T> {
  initialValues: T;
  validationRules?: ValidationRules<T>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

export const useForm = <T extends Record<string, unknown>>({
  initialValues,
  validationRules = {},
  validateOnChange = true,
  validateOnBlur = true,
}: UseFormProps<T>): UseFormReturn<T> => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<keyof T, boolean>>(
    {} as Record<keyof T, boolean>
  );

  // Validate a single field
  const validateField = useCallback(
    (name: keyof T, value: T[keyof T], allValues: T): string | undefined => {
      const rules = validationRules[name];
      if (!rules) return undefined;

      for (const rule of rules) {
        const error = rule(value, allValues);
        if (error) return error;
      }
      return undefined;
    },
    [validationRules]
  );

  // Validate all fields
  const validateAllFields = useCallback(
    (valuesToValidate: T): FormErrors => {
      const newErrors: FormErrors = {};

      Object.keys(validationRules).forEach((key) => {
        const fieldName = key as keyof T;
        const error = validateField(
          fieldName,
          valuesToValidate[fieldName],
          valuesToValidate
        );
        if (error) {
          newErrors[fieldName as string] = error;
        }
      });

      return newErrors;
    },
    [validationRules, validateField]
  );

  // Check if form is valid
  const isValid = useMemo(() => {
    const currentErrors = validateAllFields(values);
    return Object.keys(currentErrors).length === 0;
  }, [values, validateAllFields]);

  // Handle field change
  const handleChange = useCallback(
    (name: keyof T, value: T[keyof T]) => {
      setValues((prev) => ({ ...prev, [name]: value }));

      // Mark field as touched
      setTouched((prev) => ({ ...prev, [name]: true }));

      // Validate on change if enabled
      if (validateOnChange) {
        const newValues = { ...values, [name]: value };
        const error = validateField(name, value, newValues);

        setErrors((prev) => ({
          ...prev,
          [name]: error,
        }));
      }
    },
    [values, validateField, validateOnChange]
  );

  // Handle field blur
  const handleBlur = useCallback(
    (name: keyof T) => {
      setTouched((prev) => ({ ...prev, [name]: true }));

      if (validateOnBlur) {
        const error = validateField(name, values[name], values);
        setErrors((prev) => ({
          ...prev,
          [name]: error,
        }));
      }
    },
    [values, validateField, validateOnBlur]
  );

  // Handle form submission
  const handleSubmit = useCallback(
    (onSubmit: (values: T) => void) => (e: React.FormEvent) => {
      e.preventDefault();

      // Validate all fields
      const allErrors = validateAllFields(values);
      setErrors(allErrors);

      // Mark all fields as touched
      const allTouched = Object.keys(values).reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        {} as Record<keyof T, boolean>
      );
      setTouched(allTouched);

      // If no errors, submit the form
      if (Object.keys(allErrors).length === 0) {
        onSubmit(values);
      }
    },
    [values, validateAllFields]
  );

  // Reset form to initial values
  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({} as Record<keyof T, boolean>);
  }, [initialValues]);

  // Set field error manually
  const setFieldError = useCallback((field: keyof T, error: string) => {
    setErrors((prev) => ({
      ...prev,
      [field]: error,
    }));
  }, []);

  // Clear all errors
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  // Set field value manually
  const setValue = useCallback((name: keyof T, value: T[keyof T]) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  // Set multiple values at once
  const setMultipleValues = useCallback((newValues: Partial<T>) => {
    setValues((prev) => ({ ...prev, ...newValues }));
  }, []);

  // Get field props for easy integration with form components
  const getFieldProps = useCallback(
    (name: keyof T) => ({
      name: name as string,
      value: values[name],
      onChange: (
        e: React.ChangeEvent<
          HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
      ) => {
        handleChange(name, e.target.value as T[keyof T]);
      },
      onBlur: () => handleBlur(name),
      error: touched[name] ? errors[name as string] : undefined,
      isValid: touched[name] ? !errors[name as string] : undefined,
    }),
    [values, errors, touched, handleChange, handleBlur]
  );

  return {
    values,
    errors,
    isValid,
    handleChange,
    handleSubmit,
    reset,
    setFieldError,
    clearErrors,
    // Additional helper methods
    handleBlur,
    setValue,
    setMultipleValues,
    getFieldProps,
    touched,
  };
};

// Common validation rules
export const validationRules = {
  required:
    <T>(message: string = 'This field is required'): ValidationRule<T> =>
    (value) => {
      if (value === undefined || value === null || value === '') {
        return message;
      }
      return undefined;
    },

  email:
    <T>(
      message: string = 'Please enter a valid email address'
    ): ValidationRule<T> =>
    (value) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (value && !emailRegex.test(String(value))) {
        return message;
      }
      return undefined;
    },

  minLength:
    <T>(min: number, message?: string): ValidationRule<T> =>
    (value) => {
      const defaultMessage = `Minimum ${min} characters required`;
      if (value && String(value).length < min) {
        return message || defaultMessage;
      }
      return undefined;
    },

  maxLength:
    <T>(max: number, message?: string): ValidationRule<T> =>
    (value) => {
      const defaultMessage = `Maximum ${max} characters allowed`;
      if (value && String(value).length > max) {
        return message || defaultMessage;
      }
      return undefined;
    },

  pattern:
    <T>(regex: RegExp, message: string): ValidationRule<T> =>
    (value) => {
      if (value && !regex.test(String(value))) {
        return message;
      }
      return undefined;
    },

  numeric:
    <T>(message: string = 'Please enter a valid number'): ValidationRule<T> =>
    (value) => {
      if (value && isNaN(Number(value))) {
        return message;
      }
      return undefined;
    },

  phone:
    <T>(
      message: string = 'Please enter a valid phone number'
    ): ValidationRule<T> =>
    (value) => {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      if (value && !phoneRegex.test(String(value).replace(/[\s\-\(\)]/g, ''))) {
        return message;
      }
      return undefined;
    },
};
