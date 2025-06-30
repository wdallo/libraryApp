import { useState, useCallback } from "react";
import { validateForm, validateField } from "../utils/validation";

/**
 * Custom hook for form validation
 */
const useFormValidation = (initialValues, ruleName) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate single field
  const validateSingleField = useCallback(
    (fieldName, value) => {
      const fieldValidation = validateField(fieldName, value, ruleName);
      return fieldValidation;
    },
    [ruleName]
  );

  // Handle field change
  const handleChange = useCallback(
    (e) => {
      const { name, value, type, checked } = e.target;
      let fieldValue = type === "checkbox" ? checked : value;

      // Convert number inputs to actual numbers
      if (type === "number" && value !== "") {
        const numValue = parseFloat(value);
        fieldValue = isNaN(numValue) ? value : numValue;
      }

      setValues((prev) => ({
        ...prev,
        [name]: fieldValue,
      }));

      // Real-time validation for touched fields
      if (touched[name]) {
        const fieldValidation = validateSingleField(name, fieldValue);
        setErrors((prev) => ({
          ...prev,
          [name]: fieldValidation.errors,
        }));
      }
    },
    [touched, validateSingleField]
  );

  // Handle field blur
  const handleBlur = useCallback(
    (e) => {
      const { name, value } = e.target;

      setTouched((prev) => ({
        ...prev,
        [name]: true,
      }));

      // Validate field on blur
      const fieldValidation = validateSingleField(name, value);
      setErrors((prev) => ({
        ...prev,
        [name]: fieldValidation.errors,
      }));
    },
    [validateSingleField]
  );

  // Validate entire form
  const validate = useCallback(() => {
    const formValidation = validateForm(values, ruleName);
    setErrors(formValidation.errors);

    // Mark all fields as touched when validating
    const allTouched = {};
    Object.keys(values).forEach((key) => {
      allTouched[key] = true;
    });
    setTouched(allTouched);

    return formValidation.isValid;
  }, [values, ruleName]);

  // Handle form submission
  const handleSubmit = useCallback(
    (onSubmit) => {
      return async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Mark all fields as touched
        const allTouched = {};
        Object.keys(values).forEach((key) => {
          allTouched[key] = true;
        });
        setTouched(allTouched);

        // Validate form
        const isValid = validate();

        if (isValid && onSubmit) {
          try {
            await onSubmit(values);
          } catch (error) {
            console.error("Form submission error:", error);
          }
        }

        setIsSubmitting(false);
      };
    },
    [values, validate]
  );

  // Reset form
  const reset = useCallback(
    (newValues = initialValues) => {
      setValues(newValues);
      setErrors({});
      setTouched({});
      setIsSubmitting(false);
    },
    [initialValues]
  );

  // Set field value programmatically
  const setValue = useCallback(
    (fieldName, value) => {
      setValues((prev) => ({
        ...prev,
        [fieldName]: value,
      }));

      // Validate if field is touched
      if (touched[fieldName]) {
        const fieldValidation = validateSingleField(fieldName, value);
        setErrors((prev) => ({
          ...prev,
          [fieldName]: fieldValidation.errors,
        }));
      }
    },
    [touched, validateSingleField]
  );

  // Set multiple values
  const setMultipleValues = useCallback((newValues) => {
    setValues((prev) => ({
      ...prev,
      ...newValues,
    }));
  }, []);

  // Get field props for easy binding
  const getFieldProps = useCallback(
    (fieldName) => ({
      name: fieldName,
      value: values[fieldName] || "",
      onChange: handleChange,
      onBlur: handleBlur,
    }),
    [values, handleChange, handleBlur]
  );

  // Get field error message
  const getFieldError = useCallback(
    (fieldName) => {
      const fieldErrors = errors[fieldName];
      return fieldErrors && fieldErrors.length > 0 ? fieldErrors[0] : "";
    },
    [errors]
  );

  // Check if field has error
  const hasFieldError = useCallback(
    (fieldName) => {
      return (
        touched[fieldName] && errors[fieldName] && errors[fieldName].length > 0
      );
    },
    [touched, errors]
  );

  // Set errors programmatically (useful for backend validation errors)
  const setServerErrors = useCallback((newErrors) => {
    setErrors(newErrors);
  }, []);

  // Check if form is valid
  const isValid = Object.keys(errors).every(
    (key) => !errors[key] || errors[key].length === 0
  );

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    handleChange,
    handleBlur,
    handleSubmit,
    validate,
    reset,
    setValue,
    setMultipleValues,
    setServerErrors,
    getFieldProps,
    getFieldError,
    hasFieldError,
  };
};

export default useFormValidation;
