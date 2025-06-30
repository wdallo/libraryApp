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
  faUserEdit,
} from "@fortawesome/free-solid-svg-icons";

function AdminAuthors() {
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAuthor, setSelectedAuthor] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Author form validation
  const authorFormValidation = useFormValidation(
    {
      firstName: "",
      lastName: "",
      birthday: "",
      bio: "",
    },
    "author"
  );

  useEffect(() => {
    fetchAuthors();
  }, []);

  const fetchAuthors = async () => {
    try {
      const response = await apiClient.get("/api/authors");
      setAuthors(response.data.authors || []);
    } catch (error) {
      console.error("Error fetching authors:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditAuthor = (author) => {
    setSelectedAuthor(author);
    authorFormValidation.setMultipleValues({
      firstName: author.firstName,
      lastName: author.lastName,
      birthday: author.birthday ? author.birthday.split("T")[0] : "",
      bio: author.bio || "",
    });
    setShowEditModal(true);
  };

  const handleDeleteAuthor = (author) => {
    setSelectedAuthor(author);
    setShowDeleteModal(true);
  };

  const submitEditAuthor = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    // Validate the form
    const isValid = await authorFormValidation.validate();
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
      const formDataToSend = new FormData();
      formDataToSend.append("firstName", authorFormValidation.values.firstName);
      formDataToSend.append("lastName", authorFormValidation.values.lastName);
      if (authorFormValidation.values.birthday)
        formDataToSend.append("birthday", authorFormValidation.values.birthday);
      if (authorFormValidation.values.bio)
        formDataToSend.append("bio", authorFormValidation.values.bio);

      await apiClient.put(
        `/api/authors/${selectedAuthor._id}`,
        formDataToSend,
        {
          headers: {
            authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setShowEditModal(false);
      authorFormValidation.reset();
      fetchAuthors();
    } catch (error) {
      console.error("Error updating author:", error);

      // Handle validation errors from backend
      if (error.response?.data?.errors) {
        const backendErrors = {};
        error.response.data.errors.forEach((err) => {
          if (err.path) {
            backendErrors[err.path] = [err.msg];
          }
        });
        authorFormValidation.setServerErrors(backendErrors);
      } else {
        alert(error.response?.data?.message || "Failed to update author");
      }
    }
  };

  const confirmDeleteAuthor = async () => {
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
      await apiClient.delete(`/api/authors/${selectedAuthor._id}`, {
        headers: {
          authorization: `Bearer ${token}`,
        },
      });
      setShowDeleteModal(false);
      fetchAuthors();
    } catch (error) {
      console.error("Error deleting author:", error);
      alert(error.response?.data?.message || "Failed to delete author");
    }
  };

  const filteredAuthors = authors.filter((author) =>
    `${author.firstName} ${author.lastName}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-black">
          <FontAwesomeIcon icon={faUserEdit} className="me-2" />
          Authors Management
        </h2>{" "}
        <Link to={-1} className="btn btn-outline-secondary">
          <FontAwesomeIcon icon={faBackward} /> Go Back
        </Link>
      </div>

      {/* Search and Actions */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Search authors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="input-group-text">
              <FontAwesomeIcon icon={faMagnifyingGlass} />
            </span>
          </div>
        </div>
        <div
          className="col-md-6 d-flex justify-content-end"
          style={{ gap: "10px" }}
        >
          <Link
            to="/authors/new"
            className="btn btn-dark d-flex align-items-center"
          >
            Add Author
          </Link>
        </div>
      </div>

      {/* Authors Table */}
      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Photo</th>
                  <th>Name</th>
                  <th>Birthday</th>
                  <th>Biography</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAuthors.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center text-muted">
                      No authors found.
                    </td>
                  </tr>
                )}
                {filteredAuthors.map((author) => (
                  <tr key={author._id}>
                    <td>
                      <img
                        src={
                          author.picture
                            ? `${import.meta.env.VITE_API_URL}${author.picture}`
                            : `${
                                import.meta.env.VITE_API_URL
                              }/uploads/notfound.png`
                        }
                        alt={`${author.firstName} ${author.lastName}`}
                        className="rounded-circle"
                        style={{ width: 40, height: 40, objectFit: "cover" }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            import.meta.env.VITE_API_URL +
                            "/uploads/notfound.png";
                        }}
                      />
                    </td>
                    <td>
                      <strong>{`${author.firstName} ${author.lastName}`}</strong>
                    </td>
                    <td>
                      {author.birthday
                        ? new Date(author.birthday).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td>
                      <span
                        title={author.bio || "No biography available"}
                        style={{ cursor: "help" }}
                      >
                        {(author.bio || "No biography available").slice(0, 60)}
                        {author.bio && author.bio.length > 60 ? "..." : ""}
                      </span>
                    </td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        <button
                          className="btn btn-outline-primary"
                          onClick={() => handleEditAuthor(author)}
                          title="Edit Author"
                        >
                          <FontAwesomeIcon icon={faPen} />
                        </button>
                        <button
                          className="btn btn-outline-danger"
                          onClick={() => handleDeleteAuthor(author)}
                          title="Delete Author"
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

      {/* Edit Author Modal */}
      <Modal
        show={showEditModal}
        onHide={() => {
          setShowEditModal(false);
          authorFormValidation.reset();
        }}
        title="Edit Author"
        type="confirm"
        onConfirm={submitEditAuthor}
        confirmText="Update"
        confirmButtonClass="btn-primary"
        confirmDisabled={
          !authorFormValidation.isValid || authorFormValidation.isSubmitting
        }
      >
        <form onSubmit={submitEditAuthor}>
          <div className="row">
            <div className="col-md-6">
              <ValidatedInput
                label="First Name"
                fieldName="firstName"
                required={true}
                formValidation={authorFormValidation}
                placeholder="Enter first name"
              />
            </div>
            <div className="col-md-6">
              <ValidatedInput
                label="Last Name"
                fieldName="lastName"
                required={true}
                formValidation={authorFormValidation}
                placeholder="Enter last name"
              />
            </div>
          </div>
          <ValidatedInput
            label="Birthday"
            fieldName="birthday"
            type="date"
            formValidation={authorFormValidation}
          />
          <ValidatedTextarea
            label="Biography"
            fieldName="bio"
            formValidation={authorFormValidation}
            rows={4}
            placeholder="Enter author biography (optional)"
          />
        </form>
      </Modal>

      {/* Delete Author Modal */}
      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        title="Delete Author"
        type="confirm"
        onConfirm={confirmDeleteAuthor}
        confirmText="Delete"
        confirmButtonClass="btn-danger"
      >
        <p>
          Are you sure you want to delete the author{" "}
          <strong>
            {selectedAuthor?.firstName} {selectedAuthor?.lastName}
          </strong>
          ?
        </p>
        <p className="text-muted">
          This action cannot be undone. Books by this author may lose their
          author reference.
        </p>
      </Modal>
    </div>
  );
}

export default AdminAuthors;
