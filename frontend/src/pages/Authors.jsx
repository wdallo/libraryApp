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
  const [totalAuthors, setTotalAuthors] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [pageReady, setPageReady] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [nextPageDirection, setNextPageDirection] = useState("");
  const authorsPerPage = 8; // You can adjust this number

  useEffect(() => {
    if (!isInitialLoad) {
      fetchAuthors();
    }
  }, [currentPage]);

  // Debounce search to avoid too many API calls
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchTerm !== undefined && !isInitialLoad) {
        // Reset to page 1 when searching
        if (currentPage !== 1) {
          navigate("/authors");
        } else {
          fetchAuthors();
        }
      }
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm]);

  const fetchAuthors = async () => {
    setLoading(true);

    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: authorsPerPage.toString(),
      });

      if (searchTerm.trim()) {
        params.append("search", searchTerm);
      }

      const apiUrl = `${
        import.meta.env.VITE_API_URL
      }/api/authors?${params.toString()}`;

      const res = await apiClient.get(apiUrl);

      const data = res.data;
      const authorsData = data.authors || [];

      setAuthors(authorsData);
      setFilteredAuthors(authorsData);
      setTotalPages(data.totalPages || 1);
      setTotalAuthors(data.totalAuthors || 0);
      setPageReady(true);
    } catch (error) {
      console.error("Authors.jsx - Error fetching authors:", error);
      setAuthors([]);
      setFilteredAuthors([]);
      setTotalPages(1);
      setTotalAuthors(0);
      setPageReady(true);
    } finally {
      setLoading(false);
    }
  };

  // Calculate authors to display for current page (already filtered by server)
  const getCurrentPageAuthors = () => {
    return filteredAuthors;
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
    setSearchTerm(e.target.value);
    // Only reset page and navigate if not during initial load
    if (!isInitialLoad) {
      setCurrentPage(1);
      navigate("/authors");
    }
  };

  // Mark initial load as complete once authors are loaded and page is ready
  useEffect(() => {
    if (isInitialLoad) {
      fetchAuthors().then(() => {
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
          {totalAuthors === 0 ? (
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
              Showing {getCurrentPageAuthors().length} of {totalAuthors} authors
              {searchTerm && <span> (filtered results)</span>}
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

export default Authors;
