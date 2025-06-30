import React from "react";

/**
 * Form input component with validation
 */
export const ValidatedInput = ({
  label,
  fieldName,
  type = "text",
  placeholder,
  required = false,
  formValidation,
  className = "",
  ...props
}) => {
  const fieldProps = formValidation.getFieldProps(fieldName);
  const hasError = formValidation.hasFieldError(fieldName);
  const errorMessage = formValidation.getFieldError(fieldName);

  return (
    <div className={`mb-3 ${className}`}>
      {label && (
        <label htmlFor={fieldName} className="form-label">
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}
      <input
        id={fieldName}
        type={type}
        className={`form-control ${hasError ? "is-invalid" : ""}`}
        placeholder={placeholder}
        {...fieldProps}
        {...props}
      />
      {hasError && <div className="invalid-feedback">{errorMessage}</div>}
    </div>
  );
};

/**
 * Form textarea component with validation
 */
export const ValidatedTextarea = ({
  label,
  fieldName,
  placeholder,
  required = false,
  formValidation,
  rows = 3,
  className = "",
  ...props
}) => {
  const fieldProps = formValidation.getFieldProps(fieldName);
  const hasError = formValidation.hasFieldError(fieldName);
  const errorMessage = formValidation.getFieldError(fieldName);

  return (
    <div className={`mb-3 ${className}`}>
      {label && (
        <label htmlFor={fieldName} className="form-label">
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}
      <textarea
        id={fieldName}
        className={`form-control ${hasError ? "is-invalid" : ""}`}
        placeholder={placeholder}
        rows={rows}
        {...fieldProps}
        {...props}
      />
      {hasError && <div className="invalid-feedback">{errorMessage}</div>}
    </div>
  );
};

/**
 * Form select component with validation
 */
export const ValidatedSelect = ({
  label,
  fieldName,
  options = [],
  required = false,
  formValidation,
  placeholder = "Select an option",
  className = "",
  ...props
}) => {
  const fieldProps = formValidation.getFieldProps(fieldName);
  const hasError = formValidation.hasFieldError(fieldName);
  const errorMessage = formValidation.getFieldError(fieldName);

  return (
    <div className={`mb-3 ${className}`}>
      {label && (
        <label htmlFor={fieldName} className="form-label">
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}
      <select
        id={fieldName}
        className={`form-select ${hasError ? "is-invalid" : ""}`}
        {...fieldProps}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {hasError && <div className="invalid-feedback">{errorMessage}</div>}
    </div>
  );
};
