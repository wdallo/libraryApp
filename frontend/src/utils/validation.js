// Frontend validation utilities that mirror backend validation rules
// This ensures consistent validation between frontend and backend

/**
 * Validation error class
 */
class ValidationError extends Error {
  constructor(field, message) {
    super(message);
    this.field = field;
    this.name = "ValidationError";
  }
}

/**
 * Validation utilities
 */
const validators = {
  // String validators
  isRequired: (value, fieldName) => {
    if (!value || (typeof value === "string" && value.trim() === "")) {
      throw new ValidationError(fieldName, `${fieldName} is required`);
    }
    return true;
  },

  isLength: (value, options, fieldName) => {
    const length = value ? value.toString().length : 0;
    if (options.min && length < options.min) {
      throw new ValidationError(
        fieldName,
        `${fieldName} must be at least ${options.min} characters long`
      );
    }
    if (options.max && length > options.max) {
      throw new ValidationError(
        fieldName,
        `${fieldName} cannot exceed ${options.max} characters`
      );
    }
    return true;
  },

  isEmail: (value, fieldName) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (value && !emailRegex.test(value)) {
      throw new ValidationError(fieldName, "Please provide a valid email");
    }
    return true;
  },

  isPassword: (value, fieldName) => {
    if (!value || value.length < 6) {
      throw new ValidationError(
        fieldName,
        "Password must be at least 6 characters long"
      );
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!passwordRegex.test(value)) {
      throw new ValidationError(
        fieldName,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      );
    }
    return true;
  },

  isInt: (value, options, fieldName) => {
    const num = parseInt(value);
    if (isNaN(num)) {
      throw new ValidationError(fieldName, `${fieldName} must be a number`);
    }
    if (options.min !== undefined && num < options.min) {
      throw new ValidationError(
        fieldName,
        `${fieldName} must be at least ${options.min}`
      );
    }
    if (options.max !== undefined && num > options.max) {
      throw new ValidationError(
        fieldName,
        `${fieldName} cannot exceed ${options.max}`
      );
    }
    return true;
  },

  isDate: (value, fieldName) => {
    if (value && isNaN(Date.parse(value))) {
      throw new ValidationError(fieldName, "Please provide a valid date");
    }
    return true;
  },

  isFutureDate: (value, fieldName) => {
    if (value && new Date(value) <= new Date()) {
      throw new ValidationError(
        fieldName,
        `${fieldName} must be in the future`
      );
    }
    return true;
  },

  isMongoId: (value, fieldName) => {
    const mongoIdRegex = /^[0-9a-fA-F]{24}$/;
    if (value && !mongoIdRegex.test(value)) {
      throw new ValidationError(fieldName, `Invalid ${fieldName}`);
    }
    return true;
  },

  isIn: (value, options, fieldName) => {
    if (value && !options.includes(value)) {
      throw new ValidationError(
        fieldName,
        `${fieldName} must be one of: ${options.join(", ")}`
      );
    }
    return true;
  },
};

/**
 * Validation rules that mirror backend validation
 */
export const validationRules = {
  // User Registration
  userRegistration: {
    firstName: [
      { validator: "isRequired", message: "First name is required" },
      {
        validator: "isLength",
        options: { max: 50 },
        message: "First name cannot exceed 50 characters",
      },
    ],
    lastName: [
      { validator: "isRequired", message: "Last name is required" },
      {
        validator: "isLength",
        options: { max: 50 },
        message: "Last name cannot exceed 50 characters",
      },
    ],
    email: [
      { validator: "isRequired", message: "Email is required" },
      { validator: "isEmail" },
    ],
    password: [
      { validator: "isRequired", message: "Password is required" },
      { validator: "isPassword" },
    ],
    confirmPassword: [
      { validator: "isRequired", message: "Please confirm your password" },
    ],
  },

  // User Login
  userLogin: {
    email: [
      { validator: "isRequired", message: "Email is required" },
      { validator: "isEmail" },
    ],
    password: [{ validator: "isRequired", message: "Password is required" }],
  },

  // User Update
  userUpdate: {
    firstName: [
      {
        validator: "isLength",
        options: { max: 50 },
        message: "First name cannot exceed 50 characters",
      },
    ],
    lastName: [
      {
        validator: "isLength",
        options: { max: 50 },
        message: "Last name cannot exceed 50 characters",
      },
    ],
    email: [{ validator: "isEmail" }],
    role: [
      {
        validator: "isIn",
        options: ["user", "admin"],
        message: "Role must be either user or admin",
      },
    ],
  },

  // Book
  book: {
    title: [
      { validator: "isRequired", message: "Title is required" },
      {
        validator: "isLength",
        options: { max: 200 },
        message: "Title cannot exceed 200 characters",
      },
    ],
    author: [
      { validator: "isRequired", message: "Author is required" },
      {
        validator: "isLength",
        options: { max: 100 },
        message: "Author name cannot exceed 100 characters",
      },
    ],
    category: [
      { validator: "isRequired", message: "Category is required" },
      { validator: "isMongoId", message: "Invalid category ID" },
    ],
    totalQuantity: [
      { validator: "isRequired", message: "Total quantity is required" },
      {
        validator: "isInt",
        options: { min: 1 },
        message: "Total quantity must be a positive integer",
      },
    ],
    availableQuantity: [
      { validator: "isRequired", message: "Available quantity is required" },
      {
        validator: "isInt",
        options: { min: 0 },
        message: "Available quantity must be a non-negative integer",
      },
    ],
    description: [
      {
        validator: "isLength",
        options: { max: 1000 },
        message: "Description cannot exceed 1000 characters",
      },
    ],
    pages: [
      {
        validator: "isInt",
        options: { min: 1 },
        message: "Pages must be a positive integer",
      },
    ],
    language: [
      {
        validator: "isLength",
        options: { max: 50 },
        message: "Language cannot exceed 50 characters",
      },
    ],
    publishedDate: [
      { validator: "isDate", message: "Please provide a valid date" },
    ],
  },

  // Author
  author: {
    firstName: [
      { validator: "isRequired", message: "First name is required" },
      {
        validator: "isLength",
        options: { max: 50 },
        message: "First name cannot exceed 50 characters",
      },
    ],
    lastName: [
      { validator: "isRequired", message: "Last name is required" },
      {
        validator: "isLength",
        options: { max: 50 },
        message: "Last name cannot exceed 50 characters",
      },
    ],
    birthday: [{ validator: "isDate", message: "Please provide a valid date" }],
    bio: [
      {
        validator: "isLength",
        options: { max: 1000 },
        message: "Bio cannot exceed 1000 characters",
      },
    ],
  },

  // Category
  category: {
    name: [
      { validator: "isRequired", message: "Category name is required" },
      {
        validator: "isLength",
        options: { max: 50 },
        message: "Category name cannot exceed 50 characters",
      },
    ],
    description: [
      {
        validator: "isLength",
        options: { max: 500 },
        message: "Description cannot exceed 500 characters",
      },
    ],
  },

  // Reservation
  reservation: {
    bookId: [
      { validator: "isRequired", message: "Book ID is required" },
      { validator: "isMongoId", message: "Invalid book ID" },
    ],
    dueDate: [
      { validator: "isDate", message: "Please provide a valid due date" },
      { validator: "isFutureDate", message: "Due date must be in the future" },
    ],
  },
};

/**
 * Main validation function
 */
export const validateField = (
  fieldName,
  value,
  ruleName,
  customRules = null
) => {
  const rules = customRules || validationRules[ruleName];
  if (!rules || !rules[fieldName]) {
    return { isValid: true, errors: [] };
  }

  const fieldRules = rules[fieldName];
  const errors = [];

  // Skip validation for optional fields that are empty
  if (!value && !fieldRules.some((rule) => rule.validator === "isRequired")) {
    return { isValid: true, errors: [] };
  }

  for (const rule of fieldRules) {
    try {
      const validatorFn = validators[rule.validator];
      if (validatorFn) {
        if (rule.options) {
          validatorFn(value, rule.options, fieldName);
        } else {
          validatorFn(value, fieldName);
        }
      }
    } catch (error) {
      errors.push(rule.message || error.message);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate entire form
 */
export const validateForm = (formData, ruleName, customRules = null) => {
  const rules = customRules || validationRules[ruleName];
  if (!rules) {
    return { isValid: true, errors: {} };
  }

  const errors = {};
  let isValid = true;

  // Validate each field
  for (const fieldName in rules) {
    const fieldValidation = validateField(
      fieldName,
      formData[fieldName],
      ruleName,
      customRules
    );
    if (!fieldValidation.isValid) {
      errors[fieldName] = fieldValidation.errors;
      isValid = false;
    }
  }

  // Custom validations
  if (
    ruleName === "book" &&
    formData.availableQuantity &&
    formData.totalQuantity
  ) {
    if (
      parseInt(formData.availableQuantity) > parseInt(formData.totalQuantity)
    ) {
      errors.availableQuantity = errors.availableQuantity || [];
      errors.availableQuantity.push(
        "Available quantity cannot exceed total quantity"
      );
      isValid = false;
    }
  }

  return { isValid, errors };
};

/**
 * Get validation errors as array of strings
 */
export const getValidationErrorsArray = (errors) => {
  // Handle backend validation errors (array of error objects)
  if (Array.isArray(errors)) {
    return errors.map((error) => error.msg || error.message || error);
  }

  // Handle frontend validation errors (object with field arrays)
  const errorArray = [];
  for (const field in errors) {
    if (Array.isArray(errors[field])) {
      errorArray.push(...errors[field]);
    }
  }
  return errorArray;
};

/**
 * Real-time field validation hook for React components
 */
export const useFieldValidation = (fieldName, value, ruleName) => {
  const validation = validateField(fieldName, value, ruleName);
  return {
    isValid: validation.isValid,
    errors: validation.errors,
    hasError: !validation.isValid,
    errorMessage: validation.errors[0] || "",
  };
};
