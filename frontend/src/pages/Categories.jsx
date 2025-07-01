import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../utils/apiClient";
import Loading from "../components/Loading";
import Card from "../components/Card";
import Pagination from "../components/Pagination";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

function Categories() {
  const { pageNumber } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
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
  const categoriesPerPage = 8; // You can adjust this number

  useEffect(() => {
    setLoading(true);
    apiClient
      .get(import.meta.env.VITE_API_URL + "/api/categories")
      .then((res) => {
        console.log("Categories API response:", res.data);
        // Support both array and { categories: [...] } structure
        if (Array.isArray(res.data)) {
          setCategories(res.data);
          setFilteredCategories(res.data);
          setTotalPages(Math.ceil(res.data.length / categoriesPerPage));
        } else if (res.data && Array.isArray(res.data.categories)) {
          setCategories(res.data.categories);
          setFilteredCategories(res.data.categories);
          setTotalPages(
            Math.ceil(res.data.categories.length / categoriesPerPage)
          );
        } else {
          setCategories([]);
          setFilteredCategories([]);
          setTotalPages(1);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching categories:", error);
        setCategories([]);
        setFilteredCategories([]);
        setLoading(false);
      });
  }, []);

  // Filter categories based on search term
  useEffect(() => {
    let filtered = categories;

    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter((category) => {
        const name = category.name || "";
        const description = category.description || "";
        return (
          name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          description.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    setFilteredCategories(filtered);
    setTotalPages(Math.ceil(filtered.length / categoriesPerPage));

    // Mark page as ready to render only after initial filtering is complete
    if (!pageReady) {
      setPageReady(true);
    }
  }, [categories, searchTerm, categoriesPerPage, pageReady]);

  // Calculate categories to display for current page
  const getCurrentPageCategories = () => {
    const startIndex = (currentPage - 1) * categoriesPerPage;
    const endIndex = startIndex + categoriesPerPage;
    return filteredCategories.slice(startIndex, endIndex);
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
        navigate("/categories");
      } else {
        navigate(`/categories/page/${page}`);
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
        navigate("/categories");
      } else {
        navigate(`/categories/page/${totalPages}`);
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
      navigate("/categories");
    }
  };

  // Mark initial load as complete once categories are loaded and page is ready
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

  // Helper to count books in a category
  const getBookCount = (category) =>
    isNaN(Number(category.bookCount)) ? 0 : Number(category.bookCount);

  return (
    <div className="container mt-4 bg-white">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-black">
          <span
            role="img"
            aria-label="Categories"
            style={{ marginRight: "0.5rem" }}
          >
            🗂️
          </span>
          Book Categories
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
              placeholder="Search categories by name or description..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <button className="btn btn-outline-dark" type="button">
              <FontAwesomeIcon icon={faMagnifyingGlass} />
            </button>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      {filteredCategories.length === 0 ? (
        <div className="text-center text-muted my-5 no-results-container">
          {categories.length === 0 ? (
            <>
              <img
                style={{ marginBottom: "50px" }}
                src={import.meta.env.VITE_API_URL + "/uploads/no_data.png"}
                alt="No data"
              />
              <h4>No Categories found.</h4>
              <p>
                Check back later or contact the library for more information.
              </p>
            </>
          ) : (
            <>
              <h4>No categories match your search criteria.</h4>
              <p>Try adjusting your search terms.</p>
              <button
                className="btn btn-outline-dark"
                onClick={() => {
                  setSearchTerm("");
                  setCurrentPage(1);
                  navigate("/categories");
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
              Showing {getCurrentPageCategories().length} of{" "}
              {filteredCategories.length} categories
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
              getCurrentPageCategories().map((category) => (
                <Card
                  key={category._id || category.id || category.name}
                  category={category}
                  bookCount={getBookCount(category)}
                  type="category"
                />
              ))}
          </div>
        </>
      )}

      {/* Pagination Component */}
      {filteredCategories.length > categoriesPerPage && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          className="mt-4"
        />
      )}

      {/* Category Stats */}
      <div className="row mt-5">
        <div className="col-12">
          <div className="card bg-dark text-white border-white border-2">
            <div className="card-body">
              <h5 className="card-title">Category Statistics</h5>
              <div className="row text-center">
                <div className="col-md-3">
                  <h3 className="text-white">{categories.length}</h3>
                  <p>Total Categories</p>
                </div>
                <div className="col-md-3">
                  <h3 className="text-white">
                    {categories.reduce(
                      (sum, cat) => sum + getBookCount(cat),
                      0
                    )}
                  </h3>
                  <p>Total Books</p>
                </div>
                <div className="col-md-3">
                  <h3 className="text-white">
                    {categories.length > 0
                      ? Math.max(...categories.map(getBookCount)).toString()
                      : "0"}
                  </h3>
                  <p>Largest Category</p>
                </div>
                <div className="col-md-3">
                  <h3 className="text-white">
                    {categories.length > 0
                      ? Math.round(
                          categories.reduce(
                            (sum, cat) => sum + getBookCount(cat),
                            0
                          ) / categories.length
                        ).toString()
                      : "0"}
                  </h3>
                  <p>Average Books</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Categories;
