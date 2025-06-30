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
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(() => {
    const page = parseInt(pageNumber, 10);
    return page && page > 0 ? page : 1;
  });
  const [totalPages, setTotalPages] = useState(1);
  const authorsPerPage = 6; // You can adjust this number

  useEffect(() => {
    setLoading(true);
    apiClient
      .get(import.meta.env.VITE_API_URL + "/api/authors")
      .then((res) => {
        console.log("Authors API response:", res.data);
        // Support both array and { authors: [...] }
        if (Array.isArray(res.data)) {
          setAuthors(res.data);
          setTotalPages(Math.ceil(res.data.length / authorsPerPage));
        } else if (res.data && Array.isArray(res.data.authors)) {
          setAuthors(res.data.authors);
          setTotalPages(Math.ceil(res.data.authors.length / authorsPerPage));
        } else {
          setAuthors([]);
          setTotalPages(1);
        }
        setLoading(false);
      })
      .catch(() => {
        setAuthors([]);
        setLoading(false);
      });
  }, []);

  // Calculate authors to display for current page
  const getCurrentPageAuthors = () => {
    const startIndex = (currentPage - 1) * authorsPerPage;
    const endIndex = startIndex + authorsPerPage;
    return authors.slice(startIndex, endIndex);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Navigate to the new URL with page parameter
    if (page === 1) {
      navigate("/authors");
    } else {
      navigate(`/authors/page/${page}`);
    }
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

  // Handle URL parameter changes for pagination
  useEffect(() => {
    const page = parseInt(pageNumber, 10);
    const newPage = page && page > 0 ? page : 1;
    setCurrentPage(newPage);
  }, [pageNumber]);

  // Validate current page and redirect if necessary
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      // Redirect to the last valid page
      if (totalPages === 1) {
        navigate("/authors");
      } else {
        navigate(`/authors/page/${totalPages}`);
      }
    }
  }, [currentPage, totalPages, navigate]);

  if (loading) {
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
              type="text"
              className="form-control border-dark"
              placeholder="Search authors by name..."
            />
            <button className="btn btn-outline-dark" type="button">
              <FontAwesomeIcon icon={faMagnifyingGlass} />
            </button>
          </div>
        </div>
      </div>
      {/* Authors List */}
      {authors.length === 0 ? (
        <div className="text-center text-muted my-5 no-results-container">
          <img
            style={{ marginBottom: "50px" }}
            src={import.meta.env.VITE_API_URL + "/uploads/no_data.png"}
            alt="No data"
          />
          <h4>No Authors found.</h4>
          <p>Check back later or contact the library for more information.</p>
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

          <div className="books-grid">
            {getCurrentPageAuthors().map((author) => (
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
