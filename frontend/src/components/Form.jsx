import { useState, useEffect } from "react";
import apiClient from "../utils/apiClient";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBackward } from "@fortawesome/free-solid-svg-icons";

// Form field configurations for different entity types
const FORM_CONFIGS = {
  category: {
    title: "Add New Category",
    endpoint: "/api/categories",
    successMessage: "Category added successfully!",
    submitButtonText: "Add Category",
    fields: [
      {
        name: "name",
        label: "Category Name",
        type: "text",
        required: true,
        placeholder: "Enter category name",
      },
      {
        name: "description",
        label: "Description",
        type: "textarea",
        required: false,
        placeholder: "Enter category description",
        rows: 3,
      },
    ],
    initialData: {
      name: "",
      description: "",
    },
  },
  author: {
    title: "Add New Author",
    endpoint: "/api/authors",
    successMessage: "Author added successfully!",
    submitButtonText: "Add Author",
    hasFileUpload: true,
    fileFieldName: "picture",
    fileLabel: "Author Image",
    fileAccept: "image/*",
    fileHelpText: "Upload an image for the author (optional)",
    fields: [
      {
        name: "firstName",
        label: "First Name",
        type: "text",
        required: true,
        placeholder: "Enter first name",
        className: "col-md-6",
      },
      {
        name: "lastName",
        label: "Last Name",
        type: "text",
        required: true,
        placeholder: "Enter last name",
        className: "col-md-6",
      },
      {
        name: "birthday",
        label: "Birthday",
        type: "date",
        required: false,
      },
      {
        name: "bio",
        label: "Bio",
        type: "textarea",
        required: false,
        placeholder: "Enter author bio",
        rows: 3,
      },
    ],
    initialData: {
      firstName: "",
      lastName: "",
      birthday: "",
      bio: "",
    },
  },
  book: {
    title: "Add New Book",
    endpoint: "/api/books",
    successMessage: "Book added successfully!",
    submitButtonText: "Add Book",
    hasFileUpload: true,
    fileFieldName: "picture",
    fileLabel: "Book Cover",
    fileAccept: "image/*",
    fileHelpText: "Upload a cover image for the book (optional)",
    hasRelatedData: true,
    requiresAuth: true,
    adminOnly: true,
    redirectAfterSuccess: "/books",
    fields: [
      {
        name: "title",
        label: "Book Title",
        type: "text",
        required: true,
        placeholder: "Enter book title",
      },
      {
        name: "author",
        label: "Author",
        type: "select",
        required: true,
        relatedDataKey: "authors",
        optionValue: "_id",
        optionLabel: (item) =>
          item.firstName && item.lastName
            ? `${item.firstName} ${item.lastName}`
            : item.firstname && item.lastname
            ? `${item.firstname} ${item.lastname}`
            : item.name || "Unknown Author",
        placeholder: "Select an author",
        loadingText: "Loading authors...",
        emptyText:
          "No authors found. Please add authors first before creating books.",
      },
      {
        name: "category",
        label: "Category",
        type: "select",
        required: true,
        relatedDataKey: "categories",
        optionValue: "_id",
        optionLabel: (item) => item.name,
        placeholder: "Select a category",
        loadingText: "Loading categories...",
        emptyText:
          "No categories found. Please add categories first before creating books.",
      },
      {
        name: "description",
        label: "Description",
        type: "textarea",
        required: false,
        placeholder: "Enter book description",
        rows: 4,
      },
      {
        name: "publishedDate",
        label: "Published Date",
        type: "date",
        required: false,
        className: "col-md-6",
      },
      {
        name: "pages",
        label: "Pages",
        type: "number",
        required: false,
        placeholder: "Number of pages",
        className: "col-md-6",
      },
      {
        name: "language",
        label: "Language",
        type: "text",
        required: false,
        placeholder: "Book language",
        defaultValue: "English",
        className: "col-md-6",
      },
      {
        name: "totalQuantity",
        label: "Total Quantity",
        type: "number",
        required: true,
        min: 1,
        defaultValue: 1,
        className: "col-md-6",
      },
      {
        name: "availableQuantity",
        label: "Available Quantity",
        type: "number",
        required: true,
        min: 0,
        defaultValue: 1,
        className: "col-md-6",
        dependsOn: "totalQuantity",
      },
    ],
    initialData: {
      title: "",
      author: "",
      description: "",
      category: "",
      publishedDate: "",
      pages: "",
      language: "English",
      totalQuantity: 1,
      availableQuantity: 1,
    },
  },
};

function Form({ type = "category" }) {
  const config = FORM_CONFIGS[type];
  const navigate = useNavigate();

  const [formData, setFormData] = useState(config.initialData);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [user, setUser] = useState(null);

  // Related data for dropdowns (authors, categories)
  const [relatedData, setRelatedData] = useState({});
  const [loadingRelatedData, setLoadingRelatedData] = useState({});

  useEffect(() => {
    // Check user authentication if required
    if (config.requiresAuth || config.adminOnly) {
      const storedUser =
        localStorage.getItem("user") || sessionStorage.getItem("user");
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setUser(userData);

        if (config.adminOnly && userData.role !== "admin") {
          return;
        }
      } else if (config.requiresAuth) {
        return;
      }
    }

    // Load related data (authors, categories) if needed
    if (config.hasRelatedData) {
      const relatedFields = config.fields.filter(
        (field) => field.relatedDataKey
      );

      relatedFields.forEach((field) => {
        const dataKey = field.relatedDataKey;
        setLoadingRelatedData((prev) => ({ ...prev, [dataKey]: true }));

        apiClient
          .get(`/api/${dataKey}`)
          .then((res) => {
            let data = [];
            if (Array.isArray(res.data)) {
              data = res.data;
            } else if (res.data && Array.isArray(res.data[dataKey])) {
              data = res.data[dataKey];
            }
            setRelatedData((prev) => ({ ...prev, [dataKey]: data }));
          })
          .catch((error) => {
            console.error(`Error fetching ${dataKey}:`, error);
            if (error.response?.status === 404) {
              setRelatedData((prev) => ({ ...prev, [dataKey]: [] }));
            }
          })
          .finally(() => {
            setLoadingRelatedData((prev) => ({ ...prev, [dataKey]: false }));
          });
      });
    }
  }, [type]);

  const handleChange = (e) => {
    const { name, value, type: inputType } = e.target;

    if (inputType === "file") {
      setFile(e.target.files[0]);
      return;
    }

    // Handle special quantity validation for books
    if (type === "book") {
      if (name === "totalQuantity") {
        const totalQty = parseInt(value) || 0;
        setFormData((prev) => ({
          ...prev,
          [name]: value,
          availableQuantity: Math.min(prev.availableQuantity, totalQty),
        }));
        return;
      } else if (name === "availableQuantity") {
        const availableQty = parseInt(value) || 0;
        const totalQty = parseInt(formData.totalQuantity) || 0;
        setFormData((prev) => ({
          ...prev,
          [name]: Math.min(availableQty, totalQty),
        }));
        return;
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // Get token
      let user = localStorage.getItem("user") || sessionStorage.getItem("user");
      let token = "";
      if (user) {
        try {
          user = JSON.parse(user);
          token = user.token || user.accessToken || user.jwt || "";
        } catch {}
      }

      // Prepare data
      let data;
      let headers = {
        authorization: token ? `Bearer ${token}` : "",
      };

      if (config.hasFileUpload && file) {
        // Use FormData for file uploads
        data = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
          data.append(key, value);
        });
        data.append(config.fileFieldName, file);
        headers["Content-Type"] = "multipart/form-data";
      } else {
        // Use JSON for simple forms
        data = formData;
        headers["Content-Type"] = "application/json";
      }

      const response = await apiClient.post(config.endpoint, data, { headers });

      setSuccess(config.successMessage);
      setFormData(config.initialData);
      setFile(null);

      // Redirect if specified
      if (config.redirectAfterSuccess) {
        setTimeout(() => {
          navigate(config.redirectAfterSuccess);
        }, 2000);
      }
    } catch (err) {
      console.error(`${type} form error:`, err);
      setError(err.response?.data?.message || `Failed to add ${type}.`);
    } finally {
      setLoading(false);
    }
  };

  // Check admin access for admin-only forms
  if (config.adminOnly && (!user || user.role !== "admin")) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger text-center">
          Only admins can add {type}s.
        </div>
      </div>
    );
  }

  const renderField = (field) => {
    const {
      name,
      label,
      type: fieldType,
      required,
      placeholder,
      rows,
      className,
      min,
      relatedDataKey,
      optionValue,
      optionLabel,
      loadingText,
      emptyText,
      defaultValue,
    } = field;

    const commonProps = {
      id: name,
      name,
      value: formData[name] || defaultValue || "",
      onChange: handleChange,
      required,
      className: "form-control",
    };

    const fieldWrapper = (content, key) => (
      <div key={key} className={className ? `${className} mb-3` : "mb-3"}>
        <label htmlFor={name} className="form-label">
          {label} {required && "*"}
        </label>
        {content}
      </div>
    );

    switch (fieldType) {
      case "textarea":
        return fieldWrapper(
          <textarea
            {...commonProps}
            rows={rows || 3}
            placeholder={placeholder}
          />,
          `field-${name}`
        );

      case "select":
        if (relatedDataKey) {
          const data = relatedData[relatedDataKey] || [];
          const isLoading = loadingRelatedData[relatedDataKey];

          return fieldWrapper(
            <>
              <select {...commonProps} className="form-select">
                <option value="">
                  {isLoading
                    ? loadingText
                    : data.length === 0
                    ? emptyText
                    : placeholder}
                </option>
                {Array.isArray(data) &&
                  data.map((item) => (
                    <option
                      key={item[optionValue] || item.id}
                      value={item[optionValue] || item.id}
                    >
                      {typeof optionLabel === "function"
                        ? optionLabel(item)
                        : item[optionLabel]}
                    </option>
                  ))}
              </select>
              {isLoading && (
                <div className="form-text text-muted">{loadingText}</div>
              )}
              {!isLoading && data.length === 0 && (
                <div className="form-text text-danger">
                  <i className="fas fa-exclamation-triangle me-1"></i>
                  {emptyText}
                </div>
              )}
            </>,
            `field-${name}`
          );
        }
        break;

      case "number":
        return fieldWrapper(
          <input
            {...commonProps}
            type="number"
            placeholder={placeholder}
            min={min}
          />,
          `field-${name}`
        );

      case "date":
        return fieldWrapper(
          <input {...commonProps} type="date" />,
          `field-${name}`
        );

      default:
        return fieldWrapper(
          <input {...commonProps} type="text" placeholder={placeholder} />,
          `field-${name}`
        );
    }
  };

  const renderFileUpload = () => {
    if (!config.hasFileUpload) return null;

    return (
      <div className="mb-3">
        <label htmlFor={config.fileFieldName} className="form-label">
          {config.fileLabel}
        </label>
        <input
          type="file"
          className="form-control"
          id={config.fileFieldName}
          name={config.fileFieldName}
          accept={config.fileAccept}
          onChange={handleChange}
        />
        <div className="form-text">{config.fileHelpText}</div>
        {file && (
          <div className="mt-2">
            <img
              src={URL.createObjectURL(file)}
              alt="Preview"
              style={{
                maxWidth: 120,
                maxHeight: 160,
                borderRadius: 8,
                border: "1px solid #ccc",
              }}
            />
          </div>
        )}
      </div>
    );
  };

  const shouldRenderInRow = (field, index) => {
    return field.className && field.className.includes("col-md-");
  };

  const renderFields = () => {
    const fields = [];
    let i = 0;

    while (i < config.fields.length) {
      const field = config.fields[i];

      if (shouldRenderInRow(field, i)) {
        // Check if next field should also be in the same row
        const nextField = config.fields[i + 1];
        if (nextField && shouldRenderInRow(nextField, i + 1)) {
          // Render both fields in a row
          fields.push(
            <div key={`row-${i}`} className="row">
              {renderField(field)}
              {renderField(nextField)}
            </div>
          );
          i += 2;
        } else {
          // Render single field in a row
          fields.push(
            <div key={`row-${i}`} className="row">
              {renderField(field)}
            </div>
          );
          i += 1;
        }
      } else {
        // Render field normally
        fields.push(renderField(field));
        i += 1;
      }
    }

    return fields;
  };

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0">{config.title}</h5>
              <Link to={-1} className="btn btn-dark">
                <FontAwesomeIcon icon={faBackward} /> Go Back
              </Link>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                {renderFields()}
                {renderFileUpload()}

                {error && <div className="alert alert-danger">{error}</div>}
                {success && (
                  <div className="alert alert-success">{success}</div>
                )}

                <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? "Adding..." : config.submitButtonText}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Form;
