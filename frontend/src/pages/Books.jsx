import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import apiClient from "../utils/apiClient";
import Loading from "../components/Loading";
import Card from "../components/Card";
import Pagination from "../components/Pagination";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faPlus } from "@fortawesome/free-solid-svg-icons";

function Books() {
  const { pageNumber } = useParams();
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(() => {
    // Initialize currentPage from URL parameter
    const page = parseInt(pageNumber, 10);
    return page && page > 0 ? page : 1;
  });
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [pageReady, setPageReady] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [nextPageDirection, setNextPageDirection] = useState("");
  const booksPerPage = 8; // You can adjust this number

  useEffect(() => {
    setLoading(true);
    const apiUrl = import.meta.env.VITE_API_URL + "/api/books";

    apiClient
      .get(apiUrl)
      .then((res) => {
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
          setFilteredBooks(res.data);
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
          setFilteredBooks(res.data.books);
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

  // Filter books based on search term and category
  useEffect(() => {
    let filtered = books;

    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter((book) => {
        const titleMatch = book.title
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());

        // Handle author search for both object and string types
        let authorMatch = false;
        if (book.author && typeof book.author === "object") {
          const authorName = `${book.author.firstName || ""} ${
            book.author.lastName || ""
          }`.trim();
          authorMatch = authorName
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
        } else if (typeof book.author === "string") {
          authorMatch = book.author
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
        }

        return titleMatch || authorMatch;
      });
    }

    // Apply category filter
    if (selectedCategory.trim()) {
      filtered = filtered.filter((book) => {
        if (book.category) {
          if (typeof book.category === "string") {
            return book.category === selectedCategory;
          } else if (Array.isArray(book.category)) {
            return book.category.some(
              (cat) => (cat.name || cat) === selectedCategory
            );
          } else if (book.category.name) {
            return book.category.name === selectedCategory;
          }
        }
        return false;
      });
    }

    setFilteredBooks(filtered);
    setTotalPages(Math.ceil(filtered.length / booksPerPage));

    // Mark page as ready to render only after initial filtering is complete
    if (!pageReady) {
      setPageReady(true);
    }
  }, [books, searchTerm, selectedCategory, booksPerPage, pageReady]);

  // Calculate books to display for current page
  const getCurrentPageBooks = () => {
    const startIndex = (currentPage - 1) * booksPerPage;
    const endIndex = startIndex + booksPerPage;
    return filteredBooks.slice(startIndex, endIndex);
  };

  const handlePageChange = (page) => {
    if (page === currentPage) return;

    // Determine animation direction
    const direction = page > currentPage ? "right" : "left";
    setNextPageDirection(direction);

    // Start transition
    setIsTransitioning(true);

    // Short delay for exit animation
    setTimeout(() => {
      setCurrentPage(page);

      // Navigate to the new URL with page parameter
      if (page === 1) {
        navigate("/books");
      } else {
        navigate(`/books/page/${page}`);
      }

      // End transition after content updates
      setTimeout(() => {
        setIsTransitioning(false);
        setNextPageDirection("");
      }, 50);

      // Scroll to top when page changes
      window.scrollTo({
        top: 0,
        behavior: "smooth",
        block: "start",
      });
    }, 150);
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

  // Handle URL parameter changes for pagination
  useEffect(() => {
    const page = parseInt(pageNumber, 10);
    const newPage = page && page > 0 ? page : 1;
    setCurrentPage(newPage);
  }, [pageNumber]);

  // Validate current page and redirect if necessary
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages && !isInitialLoad) {
      console.log(
        `Page validation: currentPage ${currentPage} > totalPages ${totalPages}, redirecting`
      );
      // Redirect to the last valid page
      if (totalPages === 1) {
        navigate("/books");
      } else {
        navigate(`/books/page/${totalPages}`);
      }
    }
  }, [currentPage, totalPages, navigate, isInitialLoad]);

  // Handler functions for filter changes
  const handleSearchChange = (e) => {
    console.log(
      `handleSearchChange: isInitialLoad=${isInitialLoad}, searchTerm changing from "${searchTerm}" to "${e.target.value}"`
    );
    setSearchTerm(e.target.value);
    // Only reset page and navigate if not during initial load
    if (!isInitialLoad) {
      console.log("handleSearchChange: Resetting to page 1");
      setCurrentPage(1);
      navigate("/books");
    }
  };

  const handleCategoryChange = (e) => {
    console.log(
      `handleCategoryChange: isInitialLoad=${isInitialLoad}, category changing from "${selectedCategory}" to "${e.target.value}"`
    );
    setSelectedCategory(e.target.value);
    // Only reset page and navigate if not during initial load
    if (!isInitialLoad) {
      console.log("handleCategoryChange: Resetting to page 1");
      setCurrentPage(1);
      navigate("/books");
    }
  };

  // Mark initial load as complete once books are loaded and page is ready
  useEffect(() => {
    if (!loading && pageReady && isInitialLoad) {
      console.log("Marking initial load as complete");
      // Longer delay to ensure all initial effects have run and URL is processed
      const timer = setTimeout(() => {
        setIsInitialLoad(false);
        console.log("Initial load marked as complete");
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [loading, pageReady, isInitialLoad]);

  if (loading || !pageReady) {
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
            <FontAwesomeIcon icon={faPlus} className="me-2" />
            Add New Book
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
      <div className="row mb-4 search-filter-container">
        <div className="col-md-8">
          <div className="input-group">
            <input
              type="text"
              className="form-control border-dark"
              placeholder="Search books by title or author..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <button className="btn btn-outline-dark" type="button">
              <FontAwesomeIcon icon={faMagnifyingGlass} />
            </button>
          </div>
        </div>
        <div className="col-md-4">
          <select
            className="form-select border-dark"
            value={selectedCategory}
            onChange={handleCategoryChange}
          >
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
      {filteredBooks.length === 0 ? (
        <div className="text-center text-muted my-5 no-results-container">
          {books.length === 0 ? (
            <>
              <img
                style={{ marginBottom: "50px" }}
                src={import.meta.env.VITE_API_URL + "/uploads/no_data.png"}
                alt="No data"
              />
              <h4>No books available for reservation.</h4>
              <p>
                Check back later or contact the library for more information.
              </p>
            </>
          ) : (
            <>
              <h4>No books match your search criteria.</h4>
              <p>Try adjusting your search terms or category filter.</p>
              <button
                className="btn btn-outline-dark"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("");
                  setCurrentPage(1);
                  navigate("/books");
                }}
              >
                Clear Filters
              </button>
            </>
          )}
        </div>
      ) : (
        <>
          {/* Results summary */}
          <div className="mb-3">
            <small className="text-muted">
              Showing {getCurrentPageBooks().length} of {filteredBooks.length}{" "}
              books
              {(searchTerm || selectedCategory) && (
                <span> (filtered from {books.length} total)</span>
              )}
            </small>
          </div>

          <div
            className={`books-grid ${
              isTransitioning ? "page-transition-exit" : "page-transition-enter"
            } ${
              nextPageDirection === "right"
                ? "slide-in-right"
                : nextPageDirection === "left"
                ? "slide-in-left"
                : ""
            }`}
          >
            {!isTransitioning &&
              getCurrentPageBooks().map((book) => (
                <Card key={book._id || book.id} book={book} />
              ))}
          </div>
        </>
      )}

      {/* Pagination Component */}
      {filteredBooks.length > booksPerPage && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          className="mt-4"
        />
      )}
    </div>
  );
}

export default Books;
