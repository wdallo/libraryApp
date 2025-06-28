import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import apiClient from "../../utils/apiClient";
import Loading from "../../components/Loading";
import Modal from "../../components/Modal";
import {
  faBackward,
  faMagnifyingGlass,
  faPen,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function AdminBooks() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedBook, setSelectedBook] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: "",
    author: "",
    category: "",
    totalQuantity: 0,
    availableQuantity: 0,
    description: "",
    pages: 0,
    language: "",
    publishedDate: "",
  });

  useEffect(() => {
    fetchBooks();
    fetchCategories();
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

  const handleEditBook = (book) => {
    setSelectedBook(book);

    // Handle author object properly
    let authorValue = "";
    if (book.author && typeof book.author === "object") {
      authorValue = `${book.author.firstName || ""} ${
        book.author.lastName || ""
      }`.trim();
    } else if (typeof book.author === "string") {
      authorValue = book.author;
    }

    // Handle category object properly - ensure we always get a string ID
    let categoryValue = "";
    if (book.category && typeof book.category === "object") {
      categoryValue = book.category._id || "";
    } else if (typeof book.category === "string") {
      categoryValue = book.category;
    }

    setEditFormData({
      title: book.title,
      author: authorValue,
      category: categoryValue,
      totalQuantity: book.totalQuantity,
      availableQuantity: book.availableQuantity,
      description: book.description || "",
      pages: book.pages || 0,
      language: book.language || "",
      publishedDate: book.publishedDate ? book.publishedDate.split("T")[0] : "",
    });
    setShowEditModal(true);
  };

  const handleUpdateBook = async () => {
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
      await apiClient.put(`/api/books/${selectedBook._id}`, editFormData, {
        headers: {
          authorization: `Bearer ${token}`,
        },
      });
      setShowEditModal(false);
      fetchBooks();
    } catch (error) {
      console.error("Error updating book:", error);
      alert(error.response?.data?.message || "Failed to update book");
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

        const matchesCategory =
          !selectedCategory ||
          book.category?._id === selectedCategory ||
          book.category === selectedCategory;

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
          <i className="fas fa-book me-2"></i>
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
            <i className="fas fa-plus me-2"></i>Add New Book
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
        onHide={() => setShowEditModal(false)}
        title="Edit Book"
        type="confirm"
        onConfirm={handleUpdateBook}
        confirmText="Update"
        confirmButtonClass="btn-primary"
        size="modal-lg"
      >
        <form>
          <div className="row">
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">Title</label>
                <input
                  type="text"
                  className="form-control"
                  value={editFormData.title}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, title: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">Author</label>
                <input
                  type="text"
                  className="form-control"
                  value={editFormData.author}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, author: e.target.value })
                  }
                  required
                />
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">Category</label>
                <select
                  className="form-select"
                  value={editFormData.category}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      category: e.target.value,
                    })
                  }
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="col-md-3">
              <div className="mb-3">
                <label className="form-label">Total Quantity</label>
                <input
                  type="number"
                  className="form-control"
                  value={editFormData.totalQuantity}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      totalQuantity: parseInt(e.target.value) || 0,
                    })
                  }
                  min="0"
                />
              </div>
            </div>
            <div className="col-md-3">
              <div className="mb-3">
                <label className="form-label">Available</label>
                <input
                  type="number"
                  className="form-control"
                  value={editFormData.availableQuantity}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      availableQuantity: parseInt(e.target.value) || 0,
                    })
                  }
                  min="0"
                  max={editFormData.totalQuantity}
                />
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-4">
              <div className="mb-3">
                <label className="form-label">Pages</label>
                <input
                  type="number"
                  className="form-control"
                  value={editFormData.pages}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      pages: parseInt(e.target.value) || 0,
                    })
                  }
                  min="0"
                />
              </div>
            </div>
            <div className="col-md-4">
              <div className="mb-3">
                <label className="form-label">Language</label>
                <select
                  className="form-select"
                  id="language"
                  name="language"
                  value={editFormData.language}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      language: e.target.value,
                    })
                  }
                >
                  <option value="English">English</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                  <option value="Lithuania">Lithuania</option>
                  <option value="German">German</option>
                  <option value="Italian">Italian</option>
                  <option value="Portuguese">Portuguese</option>
                  <option value="Russian">Russian</option>
                  <option value="Chinese">Chinese</option>
                  <option value="Japanese">Japanese</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div className="col-md-4">
              <div className="mb-3">
                <label className="form-label">Published Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={editFormData.publishedDate}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      publishedDate: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">Description</label>
            <textarea
              className="form-control"
              rows="3"
              value={editFormData.description}
              onChange={(e) =>
                setEditFormData({
                  ...editFormData,
                  description: e.target.value,
                })
              }
            />
          </div>
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
