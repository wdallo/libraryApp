import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import apiClient from "../../utils/apiClient";
import Loading from "../../components/Loading";
import Modal from "../../components/Modal";
import useFormValidation from "../../hooks/useFormValidation";
import {
  ValidatedInput,
  ValidatedSelect,
  ValidatedTextarea,
} from "../../components/ValidationComponents";
import {
  faBackward,
  faMagnifyingGlass,
  faPen,
  faTrash,
  faBook,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function AdminBooks() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedBook, setSelectedBook] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Form validation for book editing
  const editFormValidation = useFormValidation(
    {
      title: "",
      author: "",
      category: "",
      totalQuantity: 0,
      availableQuantity: 0,
      description: "",
      pages: 0,
      language: "",
      publishedDate: "",
    },
    "book"
  );

  useEffect(() => {
    fetchBooks();
    fetchCategories();
    fetchAuthors();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await apiClient.get("/api/books");
      // The API returns { books: [...], totalBooks, totalPages, currentPage, message }
      const booksData = response.data?.books || response.data || [];
      // Ensure we always have an array
      setBooks(Array.isArray(booksData) ? booksData : []);
    } catch (error) {
      console.error("Error fetching books:", error);
      setBooks([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await apiClient.get("/api/categories");
      const categoriesData = response.data || [];
      // Ensure we always have an array
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([]); // Set empty array on error
    }
  };

  const fetchAuthors = async () => {
    try {
      console.log("🔍 Fetching authors...");
      const response = await apiClient.get("/api/authors");
      console.log("📥 Full Authors API response:", response);
      console.log("📥 Authors response.data:", response.data);
      console.log("📥 Authors response.data type:", typeof response.data);
      console.log(
        "📥 Authors response.data is array:",
        Array.isArray(response.data)
      );

      // Check if data is nested
      if (response.data && response.data.authors) {
        console.log("📥 Nested authors found:", response.data.authors);
      }

      const authorsData = response.data?.authors || response.data || [];
      console.log("👥 Processed authors data:", authorsData);
      console.log("👥 First author sample:", authorsData[0]);

      // Ensure we always have an array
      const authorsArray = Array.isArray(authorsData) ? authorsData : [];
      console.log("📋 Final authors array length:", authorsArray.length);
      console.log("📋 Final authors array:", authorsArray);

      setAuthors(authorsArray);
    } catch (error) {
      console.error("❌ Error fetching authors:", error);
      console.error("❌ Error response:", error.response);
      setAuthors([]); // Set empty array on error
    }
  };

  const handleEditBook = (book) => {
    setSelectedBook(book);

    console.log("📖 handleEditBook - Full book object:", book);
    console.log("📖 handleEditBook - book.author:", book.author);
    console.log("📖 handleEditBook - book.category:", book.category);

    // Handle author object properly - we need the ObjectId for the form
    let authorValue = "";
    if (book.author && typeof book.author === "object") {
      authorValue = book.author._id || "";
    } else if (typeof book.author === "string") {
      // If it's already a string (ObjectId), use it directly
      authorValue = book.author;
    }
    console.log("📖 handleEditBook - Final authorValue:", authorValue);

    // Handle category object properly - ensure we always get a string ID
    let categoryValue = "";
    if (
      book.category &&
      Array.isArray(book.category) &&
      book.category.length > 0
    ) {
      // If category is an array, get the first one's ID
      categoryValue = book.category[0]._id || book.category[0] || "";
    } else if (book.category && typeof book.category === "object") {
      // If category is a single object
      categoryValue = book.category._id || "";
    } else if (typeof book.category === "string") {
      // If category is already a string (ObjectId)
      categoryValue = book.category;
    }
    console.log("📖 handleEditBook - Final categoryValue:", categoryValue);

    const formValues = {
      title: book.title,
      author: authorValue,
      category: categoryValue,
      totalQuantity: book.totalQuantity,
      availableQuantity: book.availableQuantity,
      description: book.description || "",
      pages: book.pages || 0,
      language: book.language || "",
      publishedDate: book.publishedDate ? book.publishedDate.split("T")[0] : "",
    };

    console.log("📖 handleEditBook - Setting form values:", formValues);
    editFormValidation.setMultipleValues(formValues);
    setShowEditModal(true);
  };
  const handleUpdateBook = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    // Validate the form
    const isValid = await editFormValidation.validate();
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
        `/api/books/${selectedBook._id}`,
        editFormValidation.values,
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        }
      );
      setShowEditModal(false);
      editFormValidation.reset();
      fetchBooks();
    } catch (error) {
      console.error("Error updating book:", error);

      // Handle validation errors from backend
      if (error.response?.data?.errors) {
        const backendErrors = {};
        error.response.data.errors.forEach((err) => {
          if (err.path) {
            backendErrors[err.path] = [err.msg];
          }
        });
        editFormValidation.setServerErrors(backendErrors);
      } else {
        alert(error.response?.data?.message || "Failed to update book");
      }
    }
  };

  const handleDeleteBook = (book) => {
    setSelectedBook(book);
    setShowDeleteModal(true);
  };

  const confirmDeleteBook = async () => {
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
      await apiClient.delete(`/api/books/${selectedBook._id}`, {
        headers: {
          authorization: `Bearer ${token}`,
        },
      });
      setShowDeleteModal(false);
      fetchBooks();
    } catch (error) {
      console.error("Error deleting book:", error);
      alert(error.response?.data?.message || "Failed to delete book");
    }
  };

  const filteredBooks = Array.isArray(books)
    ? books.filter((book) => {
        // Handle author search for both object and string types
        let authorName = "";
        if (book.author && typeof book.author === "object") {
          authorName = `${book.author.firstName || ""} ${
            book.author.lastName || ""
          }`.trim();
        } else if (typeof book.author === "string") {
          authorName = book.author;
        }

        const matchesSearch =
          book.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          authorName.toLowerCase().includes(searchTerm.toLowerCase());

        // Fix category filtering logic
        let matchesCategory = true;
        if (selectedCategory) {
          // If a category is selected, check if book matches
          if (
            book.category &&
            Array.isArray(book.category) &&
            book.category.length > 0
          ) {
            // Book has array of categories - check if selected category is in the array
            matchesCategory = book.category.some(
              (cat) =>
                (typeof cat === "object" ? cat._id : cat) === selectedCategory
            );
          } else if (book.category && typeof book.category === "object") {
            // Book has single category object
            matchesCategory = book.category._id === selectedCategory;
          } else if (typeof book.category === "string") {
            // Book has category as string ID
            matchesCategory = book.category === selectedCategory;
          } else {
            // Book has no category
            matchesCategory = false;
          }
        }

        return matchesSearch && matchesCategory;
      })
    : [];

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-black">
          <FontAwesomeIcon icon={faBook} className="me-2" />
          Books Management
        </h2>
        <Link to={-1} className="btn btn-outline-secondary">
          <FontAwesomeIcon icon={faBackward} /> Go Back
        </Link>
      </div>
      {/* Search and Filter */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Search books by title or author..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="input-group-text">
              <FontAwesomeIcon icon={faMagnifyingGlass} />
            </span>
          </div>
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div
          className="col-md-3 d-flex justify-content-end"
          style={{ gap: "10px" }}
        >
          <Link to="/books/new" className="btn btn-dark">
            <FontAwesomeIcon icon={faPlus} className="me-2" />
            Add New Book
          </Link>
        </div>
      </div>
      {/* Books Table */}
      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Category</th>
                  <th>Total Qty</th>
                  <th>Available</th>
                  <th>Reserved</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBooks.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center text-muted">
                      No books found.
                    </td>
                  </tr>
                )}
                {filteredBooks.map((book) => (
                  <tr key={book._id}>
                    <td>
                      <Link
                        to={`/books/${book._id}`}
                        className="text-decoration-none"
                      >
                        {book.title}
                      </Link>
                    </td>
                    <td>
                      {book.author && typeof book.author === "object"
                        ? `${book.author.firstName || ""} ${
                            book.author.lastName || ""
                          }`.trim() || "Unknown Author"
                        : String(book.author || "Unknown Author")}
                    </td>
                    <td>
                      <span className="badge bg-secondary">
                        {String(
                          book.category &&
                            Array.isArray(book.category) &&
                            book.category.length > 0
                            ? book.category[0]?.name || "Uncategorized"
                            : book.category?.name || "Uncategorized"
                        )}
                      </span>
                    </td>
                    <td>
                      <span className="badge bg-primary">
                        {book.totalQuantity || 0}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          (book.availableQuantity || 0) > 0
                            ? "bg-success"
                            : "bg-danger"
                        }`}
                      >
                        {book.availableQuantity || 0}
                      </span>
                    </td>
                    <td>
                      <span className="badge bg-warning">
                        {(book.totalQuantity || 0) -
                          (book.availableQuantity || 0)}
                      </span>
                    </td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        <button
                          className="btn btn-outline-primary"
                          onClick={() => handleEditBook(book)}
                          title="Edit Book"
                        >
                          <FontAwesomeIcon icon={faPen} />
                        </button>
                        <button
                          className="btn btn-outline-danger"
                          onClick={() => handleDeleteBook(book)}
                          title="Delete Book"
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
      {/* Edit Book Modal */}
      <Modal
        show={showEditModal}
        onHide={() => {
          setShowEditModal(false);
          editFormValidation.reset();
        }}
        title="Edit Book"
        type="confirm"
        onConfirm={handleUpdateBook}
        confirmText="Update"
        confirmButtonClass="btn-primary"
        size="modal-lg"
        confirmDisabled={
          !editFormValidation.isValid || editFormValidation.isSubmitting
        }
      >
        <form onSubmit={handleUpdateBook}>
          <div className="row">
            <div className="col-md-6">
              <ValidatedInput
                label="Title"
                fieldName="title"
                required={true}
                formValidation={editFormValidation}
                placeholder="Enter book title"
              />
            </div>
            <div className="col-md-6">
              <ValidatedSelect
                label={`Author (${authors.length} available)`}
                fieldName="author"
                required={true}
                formValidation={editFormValidation}
                placeholder={
                  authors.length === 0
                    ? "No authors available - create authors first"
                    : "Select Author"
                }
                options={(() => {
                  console.log("🎭 Creating dropdown options...");
                  console.log("🎭 Authors state:", authors);
                  console.log("🎭 Authors length:", authors.length);
                  console.log(
                    "🎭 Current author value:",
                    editFormValidation.values.author
                  );

                  if (authors.length === 0) {
                    console.log("🎭 No authors, returning empty array");
                    return [];
                  }

                  const options = authors.map((author, index) => {
                    console.log(`🎭 Processing author ${index}:`, author);
                    console.log(`🎭 Author._id:`, author._id);
                    console.log(`🎭 Author.firstName:`, author.firstName);
                    console.log(`🎭 Author.lastName:`, author.lastName);

                    return {
                      value: author._id,
                      label: `${author.firstName} ${author.lastName}`,
                    };
                  });

                  console.log("🎭 Final options:", options);

                  // Check if current value matches any option
                  const currentValue = editFormValidation.values.author;
                  const matchingOption = options.find(
                    (opt) => opt.value === currentValue
                  );
                  console.log(
                    "🎭 Matching option for current value:",
                    matchingOption
                  );

                  return options;
                })()}
              />
              {authors.length === 0 && (
                <small className="text-muted">
                  📝{" "}
                  <Link to="/admin/authors" className="text-decoration-none">
                    Go to Authors Management
                  </Link>{" "}
                  to create authors first
                </small>
              )}
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <ValidatedSelect
                label="Category"
                fieldName="category"
                required={true}
                formValidation={editFormValidation}
                placeholder="Select Category"
                options={(() => {
                  console.log("🏷️ Creating category options...");
                  console.log("🏷️ Categories state:", categories);
                  console.log(
                    "🏷️ Current category value:",
                    editFormValidation.values.category
                  );
                  console.log(
                    "🏷️ Form validation values:",
                    editFormValidation.values
                  );

                  const options = categories.map((category) => ({
                    value: category._id,
                    label: category.name,
                  }));

                  console.log("🏷️ Category options:", options);

                  // Check if current value matches any option
                  const currentValue = editFormValidation.values.category;
                  const matchingOption = options.find(
                    (opt) => opt.value === currentValue
                  );
                  console.log(
                    "🏷️ Matching option for current value:",
                    matchingOption
                  );

                  return options;
                })()}
              />
            </div>
            <div className="col-md-3">
              <ValidatedInput
                label="Total Quantity"
                fieldName="totalQuantity"
                type="number"
                required={true}
                formValidation={editFormValidation}
                min="1"
              />
            </div>
            <div className="col-md-3">
              <ValidatedInput
                label="Available Quantity"
                fieldName="availableQuantity"
                type="number"
                required={true}
                formValidation={editFormValidation}
                min="0"
                max={editFormValidation.values.totalQuantity}
              />
            </div>
          </div>

          <div className="row">
            <div className="col-md-4">
              <ValidatedInput
                label="Pages"
                fieldName="pages"
                type="number"
                formValidation={editFormValidation}
                min="1"
              />
            </div>
            <div className="col-md-4">
              <ValidatedSelect
                label="Language"
                fieldName="language"
                formValidation={editFormValidation}
                options={[
                  { value: "English", label: "English" },
                  { value: "Spanish", label: "Spanish" },
                  { value: "French", label: "French" },
                  { value: "Lithuania", label: "Lithuania" },
                  { value: "German", label: "German" },
                  { value: "Italian", label: "Italian" },
                  { value: "Portuguese", label: "Portuguese" },
                  { value: "Russian", label: "Russian" },
                  { value: "Chinese", label: "Chinese" },
                  { value: "Japanese", label: "Japanese" },
                  { value: "Other", label: "Other" },
                ]}
              />
            </div>
            <div className="col-md-4">
              <ValidatedInput
                label="Published Date"
                fieldName="publishedDate"
                type="date"
                formValidation={editFormValidation}
              />
            </div>
          </div>

          <ValidatedTextarea
            label="Description"
            fieldName="description"
            formValidation={editFormValidation}
            rows={3}
            placeholder="Enter book description (optional)"
          />
        </form>
      </Modal>
      {/* Delete Book Modal */}
      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        title="Delete Book"
        type="confirm"
        onConfirm={confirmDeleteBook}
        confirmText="Delete"
        confirmButtonClass="btn-danger"
      >
        <p>
          Are you sure you want to delete <strong>{selectedBook?.title}</strong>
          ?
        </p>
        <p className="text-muted">
          This action cannot be undone. All reservations for this book will also
          be affected.
        </p>
      </Modal>
    </div>
  );
}

export default AdminBooks;
