import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Loading from "../components/Loading";

function Books() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    setLoading(true);
    const apiUrl = import.meta.env.VITE_API_URL + "/api/books";
    console.log("Books.jsx - Environment variables:", {
      VITE_API_URL: import.meta.env.VITE_API_URL,
      VITE_ENV: import.meta.env.VITE_ENV,
    });
    console.log("Books.jsx - Full API URL:", apiUrl);

    axios
      .get(apiUrl)
      .then((res) => {
        console.log("Books.jsx - Success! Status:", res.status);
        console.log("Books.jsx - Response headers:", res.headers);
        console.log("Books.jsx - API response data:", res.data);
        console.log("Books.jsx - Response data type:", typeof res.data);
        console.log(
          "Books.jsx - Is response data an array?",
          Array.isArray(res.data)
        );

        // Support both array and { books: [...] } structure
        if (Array.isArray(res.data)) {
          console.log(
            "Books.jsx - Setting books from direct array, length:",
            res.data.length
          );
          // Log first book structure if available
          if (res.data.length > 0) {
            console.log("Books.jsx - First book structure:", res.data[0]);
          }
          setBooks(res.data);
        } else if (res.data && Array.isArray(res.data.books)) {
          console.log(
            "Books.jsx - Setting books from .books property, length:",
            res.data.books.length
          );
          // Log first book structure if available
          if (res.data.books.length > 0) {
            console.log("Books.jsx - First book structure:", res.data.books[0]);
          }
          setBooks(res.data.books);
        } else {
          console.log(
            "Books.jsx - No valid books array found, setting empty array"
          );
          setBooks([]);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Books.jsx - Error fetching books:", error);
        console.error("Books.jsx - Error status:", error.response?.status);
        console.error("Books.jsx - Error response data:", error.response?.data);
        console.error("Books.jsx - Error message:", error.message);

        // If 404, it means no books found, which is fine
        if (error.response?.status === 404) {
          console.log("Books.jsx - 404 response, setting empty books array");
          setBooks([]);
        } else {
          console.log("Books.jsx - Other error, setting empty books array");
          setBooks([]);
        }
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const storedUser =
      localStorage.getItem("user") || sessionStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      setUser(null);
    }
  }, []);

  if (loading) {
    return <Loading />;
  }

  console.log("Books.jsx - Rendering with books:", books);
  console.log("Books.jsx - Books length:", books.length);
  console.log("Books.jsx - Loading state:", loading);

  return (
    <div className="container mt-4 bg-white">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-black">Books Collection</h2>
        {user && user.role === "admin" && (
          <Link to="/add-book" className="btn btn-dark d-none">
            <i className="fas fa-plus me-2"></i>Add New Book
          </Link>
        )}
      </div>

      {/* Search and Filter */}
      <div className="row mb-4">
        <div className="col-md-8">
          <div className="input-group">
            <input
              type="text"
              className="form-control border-dark"
              placeholder="Search books by title or author..."
            />
            <button className="btn btn-outline-dark" type="button">
              <i className="fas fa-search"></i>
            </button>
          </div>
        </div>
        <div className="col-md-4">
          <select className="form-select border-dark">
            <option value="">All Categories</option>
            <option value="fiction">Fiction</option>
            <option value="non-fiction">Non-Fiction</option>
            <option value="mystery">Mystery</option>
            <option value="romance">Romance</option>
          </select>
        </div>
      </div>

      {/* Books Grid */}
      {books.length === 0 ? (
        <div className="text-center text-muted my-5">
          <h4>No books found.</h4>
        </div>
      ) : (
        <div className="row">
          {books.map((book) => (
            <div key={book._id || book.id} className="col-md-4 mb-4">
              <div className="card h-100 bg-dark text-white border-white border-2 shadow">
                <img
                  src={
                    book.picture
                      ? book.picture.startsWith("http")
                        ? book.picture
                        : import.meta.env.VITE_API_URL + book.picture
                      : import.meta.env.VITE_API_URL + "/uploads/notfound.png"
                  }
                  className="card-img-top"
                  alt={book.title || "Book cover"}
                  style={{ height: "300px", objectFit: "cover" }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      import.meta.env.VITE_API_URL + "/uploads/notfound.png";
                  }}
                />
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{book.title || "Untitled"}</h5>
                  <p className="card-text text-muted">
                    by{" "}
                    {book.author &&
                    typeof book.author === "object" &&
                    book.author.firstname
                      ? `${book.author.firstname} ${book.author.lastname || ""}`
                      : typeof book.author === "string"
                      ? book.author
                      : "Unknown Author"}
                  </p>
                  <p className="card-text">
                    <small className="text-muted">
                      {book.category &&
                      Array.isArray(book.category) &&
                      book.category.length > 0
                        ? book.category[0]?.name || "Uncategorized"
                        : book.category?.name || "Uncategorized"}{" "}
                      •{" "}
                      {book.publishedYear ||
                        book.publishedDate ||
                        "Unknown Year"}
                    </small>
                  </p>
                  <p className="card-text flex-grow-1">
                    {(book.description || "No description available.").slice(
                      0,
                      100
                    )}
                    {book.description && book.description.length > 100
                      ? "..."
                      : ""}
                  </p>
                  <div className="d-flex gap-2 mt-auto">
                    <button className="btn btn-outline-light btn-sm flex-fill">
                      View Details
                    </button>
                    <button className="btn btn-outline-light btn-sm">
                      <i className="fas fa-edit"></i>
                    </button>
                    <button className="btn btn-outline-light btn-sm">
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Pagination */}
      <nav aria-label="Books pagination">
        <ul className="pagination justify-content-center">
          <li className="page-item disabled">
            <a
              className="page-link bg-dark text-white border-dark"
              href="#"
              tabIndex="-1"
            >
              Previous
            </a>
          </li>
          <li className="page-item active">
            <a className="page-link bg-dark text-white border-dark" href="#">
              1
            </a>
          </li>
          <li className="page-item">
            <a className="page-link bg-dark text-white border-dark" href="#">
              2
            </a>
          </li>
          <li className="page-item">
            <a className="page-link bg-dark text-white border-dark" href="#">
              3
            </a>
          </li>
          <li className="page-item">
            <a className="page-link bg-dark text-white border-dark" href="#">
              Next
            </a>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default Books;
