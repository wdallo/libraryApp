# Frontend Validation System

This document explains how to use the frontend validation system that mirrors the backend validation rules.

## Overview

The frontend validation system provides:

- **Real-time validation** as users type
- **Consistent rules** that match backend validation
- **User-friendly error messages**
- **Reusable components** for common form inputs
- **Automatic form handling** with proper state management

## Files Structure

```
frontend/src/
├── utils/validation.js              # Core validation rules and functions
├── hooks/useFormValidation.jsx      # React hook for form validation
├── components/ValidationComponents.jsx # Validation form components
└── pages/
    ├── Login.jsx                   # Example: Login form with validation
    └── Register.jsx                # Example: Registration form with validation
```

## Quick Start

### 1. Import the validation hook and components

```javascript
import useFormValidation from "../hooks/useFormValidation.jsx";
import {
  ValidatedInput,
  ValidatedSelect,
  ValidatedTextarea,
} from "../components/ValidationComponents.jsx";
```

### 2. Set up form validation in your component

```javascript
function MyForm() {
  const formValidation = useFormValidation(
    {
      title: "",
      author: "",
      category: "",
      totalQuantity: 0,
      availableQuantity: 0,
      description: "",
    },
    "book"
  ); // 'book' refers to the validation rule set

  const handleSubmit = formValidation.handleSubmit(async (values) => {
    // Handle form submission
    const response = await apiClient.post("/api/books", values);
  });

  return (
    <form onSubmit={handleSubmit}>
      <ValidatedInput
        label="Book Title"
        fieldName="title"
        required={true}
        formValidation={formValidation}
        placeholder="Enter book title"
      />

      <ValidatedSelect
        label="Category"
        fieldName="category"
        required={true}
        formValidation={formValidation}
        options={categories.map((cat) => ({ value: cat._id, label: cat.name }))}
      />

      <ValidatedTextarea
        label="Description"
        fieldName="description"
        formValidation={formValidation}
        placeholder="Enter book description"
        rows={4}
      />

      <button
        type="submit"
        disabled={!formValidation.isValid || formValidation.isSubmitting}
      >
        {formValidation.isSubmitting ? "Saving..." : "Save Book"}
      </button>
    </form>
  );
}
```

## Available Validation Rule Sets

### User Registration (`userRegistration`)

- **Fields**: userName, firstName, lastName, email, password
- **Rules**: Username 3-20 chars, names max 50 chars, email format, strong password

### User Login (`userLogin`)

- **Fields**: email, password
- **Rules**: Email format, required fields

### User Update (`userUpdate`)

- **Fields**: firstName, lastName, email, role
- **Rules**: Optional fields with same constraints as registration

### Book (`book`)

- **Fields**: title, author, category, totalQuantity, availableQuantity, description, pages, language, publisher, publishedDate
- **Rules**: Required fields, MongoDB ID validation, quantity logic, character limits

### Author (`author`)

- **Fields**: firstName, lastName, birthday, bio
- **Rules**: Required names, optional date and bio with limits

### Category (`category`)

- **Fields**: name, description
- **Rules**: Required name, optional description with limits

### Reservation (`reservation`)

- **Fields**: bookId, dueDate
- **Rules**: MongoDB ID validation, future date validation

## Validation Components

### ValidatedInput

```javascript
<ValidatedInput
  label="Field Label"
  fieldName="fieldName"
  type="text" // text, email, password, number, date
  placeholder="Enter value"
  required={true} // Shows red asterisk
  formValidation={formValidation}
  autoComplete="off"
  className="custom-class"
/>
```

### ValidatedSelect

```javascript
<ValidatedSelect
  label="Select Option"
  fieldName="category"
  required={true}
  formValidation={formValidation}
  placeholder="Choose an option"
  options={[
    { value: "1", label: "Option 1" },
    { value: "2", label: "Option 2" },
  ]}
/>
```

### ValidatedTextarea

```javascript
<ValidatedTextarea
  label="Description"
  fieldName="description"
  formValidation={formValidation}
  placeholder="Enter description"
  rows={3}
/>
```

## Manual Field Validation

For custom inputs or special cases:

```javascript
const formValidation = useFormValidation(initialValues, "book");

// Get field properties for manual binding
const fieldProps = formValidation.getFieldProps("title");

// Check if field has error
const hasError = formValidation.hasFieldError("title");

// Get error message
const errorMessage = formValidation.getFieldError("title");

// Set field value programmatically
formValidation.setValue("title", "New Title");

// Validate manually
const isValid = formValidation.validate();
```

## Error Handling

### Backend Integration

The validation system automatically handles backend validation errors:

```javascript
const handleSubmit = formValidation.handleSubmit(async (values) => {
  try {
    await apiClient.post("/api/books", values);
  } catch (err) {
    if (err.response?.data?.errors) {
      // Backend validation errors are automatically handled
      const backendErrors = getValidationErrorsArray(err.response.data.errors);
      setError(backendErrors.join(", "));
    }
  }
});
```

### Custom Error Display

```javascript
{
  error && <div className="alert alert-danger">{error}</div>;
}
```

## Important Notes for Modal Forms

When using validation in modal forms that have both form submission and modal confirmation:

1. **Event Handling**: Form submission handlers should handle cases where the event parameter might be undefined:

```javascript
const handleSubmit = async (e) => {
  // Handle both form submission and modal confirmation
  if (e && e.preventDefault) {
    e.preventDefault();
  }

  // Validate the form
  const isValid = await formValidation.validate();
  if (!isValid) {
    return;
  }

  // Process form data
  // ...
};
```

2. **Modal Integration**: When using with Modal components, ensure proper cleanup:

```javascript
<Modal
  show={showModal}
  onHide={() => {
    setShowModal(false);
    formValidation.reset(); // Reset form state
  }}
  onConfirm={handleSubmit}
  confirmDisabled={!formValidation.isValid || formValidation.isSubmitting}
>
  <form onSubmit={handleSubmit}>{/* Form fields */}</form>
</Modal>
```

3. **Error Handling**: Backend validation errors should be handled properly:

```javascript
} catch (error) {
  if (error.response?.data?.errors) {
    const backendErrors = {};
    error.response.data.errors.forEach(err => {
      if (err.path) {
        backendErrors[err.path] = [err.msg];
      }
    });
    formValidation.setServerErrors(backendErrors);
  } else {
    // Handle other types of errors
    alert(error.response?.data?.message || "Operation failed");
  }
}
```

## Advanced Usage

### Custom Validation Rules

```javascript
const customRules = {
  customField: [
    { validator: "isRequired", message: "This field is required" },
    { validator: "isLength", options: { max: 100 }, message: "Too long" },
  ],
};

const formValidation = useFormValidation(initialValues, null, customRules);
```

### Conditional Validation

```javascript
// In the form component
useEffect(() => {
  if (formValidation.values.type === "special") {
    // Add special validation rules
    formValidation.setValue("specialField", "");
  }
}, [formValidation.values.type]);
```

## Best Practices

1. **Always use validation** for forms that submit to the backend
2. **Use appropriate rule sets** that match your backend validation
3. **Handle loading states** during form submission
4. **Provide clear error messages** that help users fix issues
5. **Disable submit buttons** when form is invalid or submitting
6. **Use proper autocomplete** attributes for better UX

## Examples in the Codebase

- **Login Form**: `src/pages/Login.jsx`
- **Registration Form**: `src/pages/Register.jsx`
- **Admin Book Edit**: Can be updated in `src/pages/admin/AdminBooks.jsx`

## Migration Guide

To migrate existing forms:

1. **Import validation hooks and components**:

   ```javascript
   import useFormValidation from "../hooks/useFormValidation.jsx";
   import { ValidatedInput } from "../components/ValidationComponents.jsx";
   ```

2. **Replace useState with useFormValidation**:

   ```javascript
   // Before
   const [formData, setFormData] = useState({...});

   // After
   const formValidation = useFormValidation({...}, 'validationRuleSet');
   ```

3. **Replace form inputs**:

   ```javascript
   // Before
   <input
     name="title"
     value={formData.title}
     onChange={handleChange}
     className="form-control"
   />

   // After
   <ValidatedInput
     fieldName="title"
     label="Title"
     formValidation={formValidation}
   />
   ```

4. **Update form submission**:

   ```javascript
   // Before
   const handleSubmit = async (e) => {
     e.preventDefault();
     // validation logic...
     await apiClient.post("/api/endpoint", formData);
   };

   // After
   const handleSubmit = formValidation.handleSubmit(async (values) => {
     await apiClient.post("/api/endpoint", values);
   });
   ```

This validation system ensures consistent, user-friendly forms across your entire application while maintaining perfect sync with your backend validation rules.
