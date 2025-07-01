import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../utils/apiClient";
import Loading from "../components/Loading";
import Card from "../components/Card";
import Pagination from "../components/Pagination";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

function Authors() {
  const { pageNumber } = useParams();
  const navigate = useNavigate();
  const [authors, setAuthors] = useState([]);
  const [filteredAuthors, setFilteredAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(() => {
    const page = parseInt(pageNumber, 10);
    return page && page > 0 ? page : 1;
  });
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [pageReady, setPageReady] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [nextPageDirection, setNextPageDirection] = useState("");
  const authorsPerPage = 8; // You can adjust this number

  useEffect(() => {
    setLoading(true);
    apiClient
      .get(import.meta.env.VITE_API_URL + "/api/authors")
      .then((res) => {
        console.log("Authors API response:", res.data);
        // Support both array and { authors: [...] }
        if (Array.isArray(res.data)) {
          setAuthors(res.data);
          setFilteredAuthors(res.data);
          setTotalPages(Math.ceil(res.data.length / authorsPerPage));
        } else if (res.data && Array.isArray(res.data.authors)) {
          setAuthors(res.data.authors);
          setFilteredAuthors(res.data.authors);
          setTotalPages(Math.ceil(res.data.authors.length / authorsPerPage));
        } else {
          setAuthors([]);
          setFilteredAuthors([]);
          setTotalPages(1);
        }
        setLoading(false);
      })
      .catch(() => {
        setAuthors([]);
        setFilteredAuthors([]);
        setLoading(false);
      });
  }, []);

  // Filter authors based on search term
  useEffect(() => {
    let filtered = authors;

    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter((author) => {
        const fullName = `${author.firstName || ""} ${
          author.lastName || ""
        }`.trim();
        return fullName.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    setFilteredAuthors(filtered);
    setTotalPages(Math.ceil(filtered.length / authorsPerPage));

    // Mark page as ready to render only after initial filtering is complete
    if (!pageReady) {
      setPageReady(true);
    }
  }, [authors, searchTerm, authorsPerPage, pageReady]);

  // Calculate authors to display for current page
  const getCurrentPageAuthors = () => {
    const startIndex = (currentPage - 1) * authorsPerPage;
    const endIndex = startIndex + authorsPerPage;
    return filteredAuthors.slice(startIndex, endIndex);
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
        navigate("/authors");
      } else {
        navigate(`/authors/page/${page}`);
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
        navigate("/authors");
      } else {
        navigate(`/authors/page/${totalPages}`);
      }
    }
  }, [currentPage, totalPages, navigate, isInitialLoad]);

  // Handler for search changes
  const handleSearchChange = (e) => {
    console.log(
      `handleSearchChange: isInitialLoad=${isInitialLoad}, searchTerm changing from "${searchTerm}" to "${e.target.value}"`
    );
    setSearchTerm(e.target.value);
    // Only reset page and navigate if not during initial load
    if (!isInitialLoad) {
      console.log("handleSearchChange: Resetting to page 1");
      setCurrentPage(1);
      navigate("/authors");
    }
  };

  // Mark initial load as complete once authors are loaded and page is ready
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
          <span role="img" aria-label="author">
            🧑‍💼
          </span>{" "}
          Authors
        </h2>
      </div>
      {/* Search */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="input-group">
            <input
              name="search"
              type="text"
              className="form-control border-dark"
              placeholder="Search authors by name..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <button className="btn btn-outline-dark" type="button">
              <FontAwesomeIcon icon={faMagnifyingGlass} />
            </button>
          </div>
        </div>
      </div>
      {/* Authors List */}
      {filteredAuthors.length === 0 ? (
        <div className="text-center text-muted my-5 no-results-container">
          {authors.length === 0 ? (
            <>
              <img
                style={{ marginBottom: "50px" }}
                src={import.meta.env.VITE_API_URL + "/uploads/no_data.png"}
                alt="No data"
              />
              <h4>No Authors found.</h4>
              <p>
                Check back later or contact the library for more information.
              </p>
            </>
          ) : (
            <>
              <h4>No authors match your search criteria.</h4>
              <p>Try adjusting your search terms.</p>
              <button
                className="btn btn-outline-dark"
                onClick={() => {
                  setSearchTerm("");
                  setCurrentPage(1);
                  navigate("/authors");
                }}
              >
                Clear Search
              </button>
            </>
          )}
        </div>
      ) : (
        <>
          {/* Results summary */}
          <div className="mb-3">
            <small className="text-muted">
              Showing {getCurrentPageAuthors().length} of {authors.length}{" "}
              authors
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
              getCurrentPageAuthors().map((author) => (
                <Card
                  key={
                    author.id ||
                    author._id ||
                    `${author.firstName}-${author.lastName}`
                  }
                  author={author}
                  type="author"
                />
              ))}
          </div>
        </>
      )}

      {/* Pagination Component */}
      {authors.length > authorsPerPage && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          className="mt-4"
        />
      )}

      <div className="text-center mt-4">
        <p className="text-muted">
          Showing {getCurrentPageAuthors().length} of {authors.length} authors
        </p>
      </div>
    </div>
  );
}

export default Authors;
