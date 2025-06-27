import { useState, useCallback } from 'react';
import { ZodError, ZodType } from 'zod';
import { showApiErrorToast } from '../lib/apiErrorHandler';

export interface FormField<T> {
  value: T;
  error?: string;
  touched: boolean;
}

export interface FormState<T extends Record<string, any>> {
  values: T;
  errors: Record<keyof T, string | undefined>;
  touched: Record<keyof T, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
}

export const useForm = <T extends Record<string, any>>(
  initialValues: T,
  validationSchema: ZodType<any>
) => {
  const [state, setState] = useState<FormState<T>>({
    values: { ...initialValues },
    errors: {} as Record<keyof T, string | undefined>,
    touched: {} as Record<keyof T, boolean>,
    isSubmitting: false,
    isValid: false,
  });

  // Validate form against the schema
  const validate = useCallback((values: T) => {
    try {
      validationSchema.parse(values);
      return { isValid: true, errors: {} as Record<keyof T, string> };
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = (error as ZodError).errors.reduce<Record<string, string>>(
          (acc: Record<string, string>, curr: { path: (string | number)[]; message: string }) => {
            const key = curr.path[0] as string;
            if (key) {
              acc[key] = curr.message;
            }
            return acc;
          }, 
          {}
        );
        return { 
          isValid: false, 
          errors: errors as Record<keyof T, string> 
        };
      }
      return { 
        isValid: false, 
        errors: { _: 'An unknown error occurred' } as unknown as Record<keyof T, string> 
      };
    }
  }, [validationSchema]);

  // Handle input change
  const handleChange = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setState(prev => {
      const newValues = { ...prev.values, [field]: value };
      const { isValid, errors } = validate(newValues);
      
      return {
        ...prev,
        values: newValues,
        errors: { ...prev.errors, [field]: errors[field as string] },
        isValid,
      };
    });
  }, [validate]);

  // Handle blur event
  const handleBlur = useCallback(<K extends keyof T>(field: K) => {
    setState(prev => ({
      ...prev,
      touched: { ...prev.touched, [field]: true },
    }));
  }, []);

  // Set form errors
  const setErrors = useCallback((errors: Record<keyof T, string | undefined>) => {
    setState(prev => ({
      ...prev,
      errors: { ...prev.errors, ...errors },
    }));
  }, []);

  // Set form values
  const setValues = useCallback((values: Partial<T>) => {
    setState(prev => {
      const newValues = { ...prev.values, ...values };
      const { isValid, errors } = validate(newValues);
      
      return {
        ...prev,
        values: newValues,
        errors,
        isValid,
      };
    });
  }, [validate]);

  // Reset form
  const resetForm = useCallback(() => {
    setState({
      values: { ...initialValues },
      errors: {} as Record<keyof T, string | undefined>,
      touched: {} as Record<keyof T, boolean>,
      isSubmitting: false,
      isValid: false,
    });
  }, [initialValues]);

  // Handle form submission
  const handleSubmit = useCallback(async (
    callback: (values: T) => Promise<void> | void
  ) => {
    const { isValid, errors } = validate(state.values);
    
    if (!isValid) {
      setState(prev => ({
        ...prev,
        errors: errors as Record<keyof T, string | undefined>,
        touched: Object.keys(prev.values).reduce(
          (acc, key) => ({ ...acc, [key]: true }),
          {} as Record<keyof T, boolean>
        ),
      }));
      return false;
    }

    setState(prev => ({ ...prev, isSubmitting: true }));
    
    try {
      await callback(state.values);
      return true;
    } catch (error) {
      showApiErrorToast(error);
      return false;
    } finally {
      setState(prev => ({ ...prev, isSubmitting: false }));
    }
  }, [state.values, validate]);

  // Get field props for form inputs
  const getFieldProps = <K extends keyof T>(field: K) => ({
    value: state.values[field],
    onChange: (value: T[K]) => handleChange(field, value),
    onBlur: () => handleBlur(field),
    error: state.touched[field] ? state.errors[field] : undefined,
  });

  return {
    values: state.values,
    errors: state.errors,
    touched: state.touched,
    isSubmitting: state.isSubmitting,
    isValid: state.isValid,
    handleChange,
    handleBlur,
    handleSubmit,
    setErrors,
    setValues,
    resetForm,
    getFieldProps,
  };
};

export default useForm;
