import { useState, useEffect } from "react";
import apiClient from "../utils/apiClient";
import { useNavigate } from "react-router-dom";

function BookForm() {
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    description: "",
    category: "",
    releaseYear: "",
  });
  const [authors, setAuthors] = useState([]);
  const [loadingAuthors, setLoadingAuthors] = useState(true);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [bookCover, setBookCover] = useState(null);

  useEffect(() => {
    setLoadingAuthors(true);
    axios
      .get(import.meta.env.VITE_API_URL + "/api/authors")
      .then((res) => {
        console.log("Authors API response in BookForm:", res.data);
        // Support both array and { authors: [...] } structure
        if (Array.isArray(res.data)) {
          setAuthors(res.data);
        } else if (res.data && Array.isArray(res.data.authors)) {
          setAuthors(res.data.authors);
        } else {
          setAuthors([]);
        }
        setLoadingAuthors(false);
      })
      .catch((error) => {
        console.error("Error fetching authors in BookForm:", error);
        setAuthors([]);
        setLoadingAuthors(false);
      });

    setLoadingCategories(true);
    axios
      .get(import.meta.env.VITE_API_URL + "/api/categories")
      .then((res) => {
        console.log("Categories API response in BookForm:", res.data);
        // Support both array and { categories: [...] } structure
        if (Array.isArray(res.data)) {
          setCategories(res.data);
        } else if (res.data && Array.isArray(res.data.categories)) {
          setCategories(res.data.categories);
        } else {
          setCategories([]);
        }
        setLoadingCategories(false);
      })
      .catch((error) => {
        console.error("Error fetching categories in BookForm:", error);
        setCategories([]);
        setLoadingCategories(false);
      });

    // Check both localStorage and sessionStorage for user info
    const storedUser =
      localStorage.getItem("user") || sessionStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      setUser(null);
    }
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle file input change
  const handleFileChange = (e) => {
    setBookCover(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      let user = localStorage.getItem("user") || sessionStorage.getItem("user");
      let token = "";
      if (user) {
        try {
          user = JSON.parse(user);
          token = user.token || "";
        } catch {}
      }

      // Use FormData for file upload
      const data = new FormData();
      data.append("title", formData.title);
      data.append("author", formData.author);
      data.append("category", formData.category);
      data.append("description", formData.description);
      data.append("releaseYear", formData.releaseYear);
      if (bookCover) data.append("picture", bookCover);

      console.log("BookForm - Submitting data:", formData);
      console.log("BookForm - Token:", token ? "Present" : "Missing");
      console.log("BookForm - BookCover:", bookCover);

      const response = await apiClient.post("/api/books", data, {
        headers: {
          "Content-Type": "multipart/form-data",
          authorization: token ? `Bearer ${token}` : "",
        },
      });

      console.log("BookForm - Success response:", response.data);
      setSuccess("Book added successfully!");
      setFormData({
        title: "",
        author: "",
        description: "",
        category: "",
        releaseYear: "",
      });
      setBookCover(null);

      // Optionally redirect to books page after success
      setTimeout(() => {
        navigate("/books");
      }, 2000);
    } catch (err) {
      console.error("BookForm - Error:", err);
      console.error("BookForm - Error response:", err.response?.data);
      setError(err.response?.data?.message || "Failed to add book.");
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== "admin") {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger text-center">
          Only admins can add books.
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">Add New Book</h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit} encType="multipart/form-data">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="title" className="form-label">
                      Book Title *
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      placeholder="Enter book title"
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="author" className="form-label">
                      Author *
                    </label>
                    <select
                      className="form-select"
                      id="author"
                      name="author"
                      value={formData.author}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select an author</option>
                      {Array.isArray(authors) &&
                        authors.map((author) => (
                          <option
                            key={author._id || author.id}
                            value={author._id || author.id}
                          >
                            {author.firstname
                              ? `${author.firstname} ${author.lastname}`
                              : author.name}
                          </option>
                        ))}
                    </select>
                    {loadingAuthors && (
                      <div className="form-text text-muted">
                        Loading authors...
                      </div>
                    )}
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="category" className="form-label">
                    Category *
                  </label>
                  <select
                    className="form-select"
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a category</option>
                    {Array.isArray(categories) &&
                      categories.map((cat) => (
                        <option
                          key={cat._id || cat.id}
                          value={cat._id || cat.id}
                        >
                          {cat.name}
                        </option>
                      ))}
                  </select>
                  {loadingCategories && (
                    <div className="form-text text-muted">
                      Loading categories...
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="description" className="form-label">
                    Description
                  </label>
                  <textarea
                    className="form-control"
                    id="description"
                    name="description"
                    rows="4"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Enter book description"
                  ></textarea>
                </div>

                <div className="mb-3">
                  <label htmlFor="releaseYear" className="form-label">
                    Release Year
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    id="releaseYear"
                    name="releaseYear"
                    value={formData.releaseYear}
                    onChange={handleChange}
                    min="0"
                    max={new Date().getFullYear()}
                    placeholder="e.g. 2024"
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="bookCover" className="form-label">
                    Book Cover
                  </label>
                  <input
                    type="file"
                    className="form-control"
                    id="bookCover"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  <div className="form-text">
                    Upload a cover image for the book (optional)
                  </div>
                  {bookCover && (
                    <div className="mt-2">
                      <img
                        src={URL.createObjectURL(bookCover)}
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

                {error && <div className="alert alert-danger">{error}</div>}
                {success && (
                  <div className="alert alert-success">{success}</div>
                )}

                <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                  <button type="button" className="btn btn-secondary me-md-2">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? "Adding..." : "Add Book"}
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

export default BookForm;
