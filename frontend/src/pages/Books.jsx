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
  const [userReservations, setUserReservations] = useState([]);
  const [reservationsLoaded, setReservationsLoaded] = useState(false);
  const [currentPage, setCurrentPage] = useState(() => {
    // Initialize currentPage from URL parameter
    const page = parseInt(pageNumber, 10);
    return page && page > 0 ? page : 1;
  });
  const [totalPages, setTotalPages] = useState(1);
  const [totalBooks, setTotalBooks] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [pageReady, setPageReady] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [nextPageDirection, setNextPageDirection] = useState("");
  const booksPerPage = 8; // You can adjust this number

  useEffect(() => {
    if (!isInitialLoad) {
      fetchBooks();
    }
  }, [currentPage, selectedCategory]);

  // Debounce search to avoid too many API calls
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchTerm !== undefined && !isInitialLoad) {
        // Reset to page 1 when searching
        if (currentPage !== 1) {
          navigate("/books");
        } else {
          fetchBooks();
        }
      }
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm]);

  const fetchBooks = async () => {
    setLoading(true);

    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: booksPerPage.toString(),
      });

      if (searchTerm.trim()) {
        params.append("search", searchTerm);
      }
      if (selectedCategory.trim()) {
        params.append("category", selectedCategory);
      }

      const apiUrl = `${
        import.meta.env.VITE_API_URL
      }/api/books?${params.toString()}`;

      const res = await apiClient.get(apiUrl);

      const data = res.data;
      const booksData = data.books || [];

      setBooks(booksData);
      setFilteredBooks(booksData);
      setTotalPages(data.totalPages || 1);
      setTotalBooks(data.totalBooks || 0);
      setPageReady(true);
    } catch (error) {
      console.error("Books.jsx - Error fetching books:", error);
      setBooks([]);
      setFilteredBooks([]);
      setTotalPages(1);
      setTotalBooks(0);
      setPageReady(true);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user reservations when user state is available
  useEffect(() => {
    if (user) {
      fetchUserReservations();
    } else {
      // If no user, mark reservations as "loaded" with empty array
      setReservationsLoaded(true);
    }
  }, [user]);

  const fetchUserReservations = async () => {
    const storedUser =
      localStorage.getItem("user") || sessionStorage.getItem("user");
    if (!storedUser) {
      setReservationsLoaded(true);
      return;
    }

    try {
      const userData = JSON.parse(storedUser);
      const token =
        userData.token || userData.accessToken || userData.jwt || "";
      if (!token) {
        setReservationsLoaded(true);
        return;
      }

      const response = await apiClient.get(`/api/reservations`, {
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      setUserReservations(response.data.reservations || []);
      setReservationsLoaded(true);
    } catch (error) {
      console.error("Error fetching user reservations:", error);
      setUserReservations([]);
      setReservationsLoaded(true);
    }
  };

  // Helper function to get reservation status for a book
  const getBookReservationStatus = (bookId) => {
    const reservation = userReservations.find(
      (res) =>
        res.book?._id === bookId &&
        (res.status === "active" || res.status === "pending")
    );
    return reservation ? reservation.status : null;
  };

  // Calculate books to display for current page (already filtered by server)
  const getCurrentPageBooks = () => {
    return filteredBooks;
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
    setSearchTerm(e.target.value);
    // Only reset page and navigate if not during initial load
    if (!isInitialLoad) {
      setCurrentPage(1);
      navigate("/books");
    }
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    // Only reset page and navigate if not during initial load
    if (!isInitialLoad) {
      setCurrentPage(1);
      navigate("/books");
    }
  };

  // Mark initial load as complete once books are loaded and page is ready
  useEffect(() => {
    if (isInitialLoad) {
      fetchBooks().then(() => {
        setIsInitialLoad(false);
      });
    }
  }, []);

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
              name="search"
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
            name="category"
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
          {totalBooks === 0 ? (
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
              Showing {getCurrentPageBooks().length} of {totalBooks} books
              {(searchTerm || selectedCategory) && (
                <span> (filtered results)</span>
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
                <Card
                  key={book._id || book.id}
                  book={book}
                  reservationStatus={
                    reservationsLoaded
                      ? getBookReservationStatus(book._id || book.id)
                      : undefined
                  }
                  onReservationUpdate={fetchUserReservations}
                />
              ))}
          </div>
        </>
      )}

      {/* Pagination Component */}
      {totalPages > 1 && (
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
