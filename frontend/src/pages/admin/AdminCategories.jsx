import { useState, useEffect } from "react";
import apiClient from "../../utils/apiClient";
import Loading from "../../components/Loading";
import Modal from "../../components/Modal";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import useFormValidation from "../../hooks/useFormValidation";
import {
  ValidatedInput,
  ValidatedTextarea,
} from "../../components/ValidationComponents";
import {
  faBackward,
  faMagnifyingGlass,
  faPen,
  faPlus,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";

function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Category form validation
  const categoryFormValidation = useFormValidation(
    {
      name: "",
      description: "",
    },
    "category"
  );

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await apiClient.get("/api/categories");
      setCategories(response.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditCategory = (category) => {
    setSelectedCategory(category);
    categoryFormValidation.setMultipleValues({
      name: category.name,
      description: category.description || "",
    });
    setShowEditModal(true);
  };

  const handleDeleteCategory = (category) => {
    setSelectedCategory(category);
    setShowDeleteModal(true);
  };

  const submitEditCategory = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    // Validate the form
    const isValid = await categoryFormValidation.validate();
    if (!isValid) {
      return;
    }

    let user = localStorage.getItem("user") || sessionStorage.getItem("user");
    let token = "";

    if (user) {
      try {
        user = JSON.parse(user);
        token = user.token || user.accessToken || user.jwt || "";
      } catch {}
    }

    if (!token) return;

    try {
      await apiClient.put(
        `/api/categories/${selectedCategory._id}`,
        categoryFormValidation.values,
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        }
      );
      setShowEditModal(false);
      categoryFormValidation.reset();
      fetchCategories();
    } catch (error) {
      console.error("Error updating category:", error);

      // Handle validation errors from backend
      if (error.response?.data?.errors) {
        const backendErrors = {};
        error.response.data.errors.forEach((err) => {
          if (err.path) {
            backendErrors[err.path] = [err.msg];
          }
        });
        categoryFormValidation.setServerErrors(backendErrors);
      } else {
        alert(error.response?.data?.message || "Failed to update category");
      }
    }
  };

  const confirmDeleteCategory = async () => {
    let user = localStorage.getItem("user") || sessionStorage.getItem("user");
    let token = "";

    if (user) {
      try {
        user = JSON.parse(user);
        token = user.token || user.accessToken || user.jwt || "";
      } catch {}
    }

    if (!token) return;

    try {
      await apiClient.delete(`/api/categories/${selectedCategory._id}`, {
        headers: {
          authorization: `Bearer ${token}`,
        },
      });
      setShowDeleteModal(false);
      fetchCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
      alert(error.response?.data?.message || "Failed to delete category");
    }
  };

  const filteredCategories = Array.isArray(categories)
    ? categories.filter((category) => {
        const matchesSearch =
          (category.name || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (category.description || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
        return matchesSearch;
      })
    : [];

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-black">
          <i className="fas fa-tags me-2"></i>
          Categories Management
        </h2>{" "}
        <Link to={-1} className="btn btn-outline-secondary">
          <FontAwesomeIcon icon={faBackward} /> Go Back
        </Link>
      </div>

      {/* Search */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Search categories by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="input-group-text">
              <FontAwesomeIcon icon={faMagnifyingGlass} />
            </span>
          </div>
        </div>{" "}
        <div
          className="col-md-6 d-flex justify-content-end"
          style={{ gap: "10px" }}
        >
          <Link
            to="/categories/new"
            className="btn btn-dark me-2 d-flex align-items-center"
          >
            <FontAwesomeIcon icon={faPlus} className="me-2" />
            Add Category
          </Link>
        </div>
      </div>

      {/* Categories Table */}
      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Books</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center text-muted">
                      {searchTerm
                        ? "No categories found matching your search."
                        : "No categories available."}
                    </td>
                  </tr>
                )}
                {filteredCategories.map((category) => (
                  <tr key={category._id}>
                    <td>
                      <strong>{category.name || "Unnamed Category"}</strong>
                    </td>
                    <td>
                      <span
                        title={
                          category.description || "No description available"
                        }
                        style={{
                          cursor: category.description ? "help" : "default",
                        }}
                      >
                        {category.description ? (
                          category.description.length > 80 ? (
                            `${category.description.slice(0, 80)}...`
                          ) : (
                            category.description
                          )
                        ) : (
                          <em className="text-muted">No description</em>
                        )}
                      </span>
                    </td>
                    <td>
                      <span className="badge bg-secondary">
                        {category.bookCount || 0}
                      </span>
                    </td>
                    <td>
                      {category.createdAt
                        ? new Date(category.createdAt).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        <button
                          className="btn btn-outline-primary"
                          onClick={() => handleEditCategory(category)}
                          title="Edit Category"
                        >
                          <FontAwesomeIcon icon={faPen} />
                        </button>
                        <button
                          className="btn btn-outline-danger"
                          onClick={() => handleDeleteCategory(category)}
                          title="Delete Category"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {filteredCategories.length === 0 && (
        <div className="text-center py-5">
          <i className="fas fa-tags fa-3x text-muted mb-3"></i>
          <h4 className="text-muted">No categories found</h4>
          <p className="text-muted">
            {searchTerm
              ? "Try adjusting your search terms"
              : "Start by adding your first category"}
          </p>
          {!searchTerm && (
            <Link className="dropdown-item" to="/categories/new">
              <FontAwesomeIcon icon={faPlus} className="me-2" />
              Add Category
            </Link>
          )}
        </div>
      )}

      {/* Edit Category Modal */}
      <Modal
        show={showEditModal}
        onHide={() => {
          setShowEditModal(false);
          categoryFormValidation.reset();
        }}
        title="Edit Category"
        type="confirm"
        onConfirm={submitEditCategory}
        confirmText="Update"
        confirmButtonClass="btn-primary"
        confirmDisabled={
          !categoryFormValidation.isValid || categoryFormValidation.isSubmitting
        }
      >
        <form onSubmit={submitEditCategory}>
          <ValidatedInput
            label="Category Name"
            fieldName="name"
            required={true}
            formValidation={categoryFormValidation}
            placeholder="Enter category name"
          />
          <ValidatedTextarea
            label="Description"
            fieldName="description"
            formValidation={categoryFormValidation}
            rows={3}
            placeholder="Enter category description (optional)"
          />
        </form>
      </Modal>

      {/* Delete Category Modal */}
      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        title="Delete Category"
        type="confirm"
        onConfirm={confirmDeleteCategory}
        confirmText="Delete"
        confirmButtonClass="btn-danger"
      >
        <p>
          Are you sure you want to delete the category{" "}
          <strong>{selectedCategory?.name}</strong>?
        </p>
        <p className="text-muted">
          This action cannot be undone. Books in this category will become
          uncategorized.
        </p>
        {selectedCategory?.bookCount > 0 && (
          <div className="alert alert-warning">
            <i className="fas fa-exclamation-triangle me-2"></i>
            This category contains {selectedCategory.bookCount} book(s).
          </div>
        )}
      </Modal>
    </div>
  );
}

export default AdminCategories;
