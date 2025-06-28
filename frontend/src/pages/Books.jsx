import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import apiClient from "../utils/apiClient";
import Loading from "../components/Loading";
import BookCard from "../components/BookCard";
import Pagination from "../components/Pagination";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

function Books() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const booksPerPage = 6; // You can adjust this number

  useEffect(() => {
    setLoading(true);
    const apiUrl = import.meta.env.VITE_API_URL + "/api/books";
    console.log("Books.jsx - Environment variables:", {
      VITE_API_URL: import.meta.env.VITE_API_URL,
      VITE_ENV: import.meta.env.VITE_ENV,
    });
    console.log("Books.jsx - Full API URL:", apiUrl);

    apiClient
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
          setTotalPages(Math.ceil(res.data.length / booksPerPage));
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
          setTotalPages(Math.ceil(res.data.books.length / booksPerPage));
        } else {
          console.log(
            "Books.jsx - No valid books array found, setting empty array"
          );
          setBooks([]);
          setTotalPages(1);
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

  // Calculate books to display for current page
  const getCurrentPageBooks = () => {
    const startIndex = (currentPage - 1) * booksPerPage;
    const endIndex = startIndex + booksPerPage;
    return books.slice(startIndex, endIndex);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll to top when page changes (optional)
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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

  return (
    <div className="container mt-4 bg-white">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-black">
          <span role="img" aria-label="Books" style={{ marginRight: "0.5rem" }}>
            📚
          </span>
          Book Reservations
        </h2>

        {user && user.role === "admin" && (
          <Link to="/add-book" className="btn btn-dark d-none">
            <i className="fas fa-plus me-2"></i>Add New Book
          </Link>
        )}
      </div>

      {/* Description */}
      <div className="mb-4">
        <p className="text-muted">
          Browse our book collection and request reservations. All reservation
          requests require admin approval before books become available for
          pickup.
        </p>
      </div>

      {/* Search and Filter */}
      <div className="row mb-4">
        <div className="col-md-8">
          <div className="input-group">
            <input
              type="text"
              className="form-control border-dark"
              placeholder="Search books available for reservation..."
            />
            <button className="btn btn-outline-dark" type="button">
              <FontAwesomeIcon icon={faMagnifyingGlass} />
            </button>
          </div>
        </div>
        <div className="col-md-4">
          <select className="form-select border-dark">
            <option value="">All Categories</option>
            {Array.from(
              new Set(
                books.flatMap((book) => {
                  if (book.category) {
                    // Handle both string and object categories
                    if (typeof book.category === "string") {
                      return [book.category];
                    } else if (Array.isArray(book.category)) {
                      return book.category.map((cat) => cat.name || cat);
                    } else if (book.category.name) {
                      return [book.category.name];
                    }
                  }
                  return [];
                })
              )
            ).map((categoryName) => (
              <option key={categoryName} value={categoryName}>
                {categoryName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Books Grid */}
      {books.length === 0 ? (
        <div className="text-center text-muted my-5">
          <img
            style={{ marginBottom: "50px" }}
            src={import.meta.env.VITE_API_URL + "/uploads/no_data.png"}
          ></img>

          <h4>No books available for reservation.</h4>
          <p>Check back later or contact the library for more information.</p>
        </div>
      ) : (
        <div className="row">
          {getCurrentPageBooks().map((book) => (
            <div key={book._id || book.id} className="col-md-4 mb-4">
              <BookCard book={book} />
            </div>
          ))}
        </div>
      )}

      {/* Pagination Component */}
      {books.length > booksPerPage && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          variant="dark"
          className="mt-4"
        />
      )}
    </div>
  );
}

export default Books;
