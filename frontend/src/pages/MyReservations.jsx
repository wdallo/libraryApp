import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../utils/apiClient";
import { Link } from "react-router-dom";
import Loading from "../components/Loading";
import Card from "../components/Card";
import Pagination from "../components/Pagination";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

function MyReservations() {
  const { pageNumber } = useParams();
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(() => {
    const page = parseInt(pageNumber, 10);
    return page && page > 0 ? page : 1;
  });
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [pageReady, setPageReady] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [nextPageDirection, setNextPageDirection] = useState("");
  const reservationsPerPage = 8; // You can adjust this number

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    setLoading(true);
    // Get token from user object in localStorage/sessionStorage
    let user = localStorage.getItem("user") || sessionStorage.getItem("user");
    let token = "";

    if (user) {
      try {
        user = JSON.parse(user);
        token = user.token || user.accessToken || user.jwt || "";
      } catch {}
    }
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await apiClient.get(`/api/reservations`, {
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      const data = response.data;
      const reservationsData = data.reservations || [];
      setReservations(reservationsData);
      setFilteredReservations(reservationsData);
      setTotalPages(Math.ceil(reservationsData.length / reservationsPerPage));
    } catch (error) {
      console.error("Error fetching reservations:", error);
      setReservations([]);
      setFilteredReservations([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter reservations based on search term and status
  useEffect(() => {
    let filtered = reservations;

    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter((reservation) => {
        const bookTitle = reservation.book?.title?.toLowerCase() || "";
        const bookAuthor = reservation.book?.author?.toLowerCase() || "";
        const authorName =
          typeof reservation.book?.author === "object"
            ? `${reservation.book.author.firstName || ""} ${
                reservation.book.author.lastName || ""
              }`.toLowerCase()
            : bookAuthor;

        return (
          bookTitle.includes(searchTerm.toLowerCase()) ||
          authorName.includes(searchTerm.toLowerCase())
        );
      });
    }

    // Apply status filter
    if (statusFilter.trim()) {
      filtered = filtered.filter((reservation) => {
        return reservation.status === statusFilter;
      });
    }

    setFilteredReservations(filtered);
    setTotalPages(Math.ceil(filtered.length / reservationsPerPage));

    // Mark page as ready to render only after initial filtering is complete
    if (!pageReady) {
      setPageReady(true);
    }
  }, [reservations, searchTerm, statusFilter, reservationsPerPage, pageReady]);

  // Calculate reservations to display for current page
  const getCurrentPageReservations = () => {
    const startIndex = (currentPage - 1) * reservationsPerPage;
    const endIndex = startIndex + reservationsPerPage;
    return filteredReservations.slice(startIndex, endIndex);
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
        navigate("/my-reservations");
      } else {
        navigate(`/my-reservations/page/${page}`);
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
        navigate("/my-reservations");
      } else {
        navigate(`/my-reservations/page/${totalPages}`);
      }
    }
  }, [currentPage, totalPages, navigate, isInitialLoad]);

  const handleExtendReservation = async (reservationId) => {
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
      const response = await apiClient.put(
        `/api/reservations/${reservationId}/extend`,
        {},
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        }
      );
      alert(response.data.message);
      fetchReservations(); // Refresh the list
    } catch (error) {
      console.error("Error extending reservation:", error);
      alert(error.response?.data?.message || "Failed to extend reservation");
    }
  };

  const handleReturnBook = async (reservationId) => {
    let user = localStorage.getItem("user") || sessionStorage.getItem("user");
    let token = "";

    if (user) {
      try {
        user = JSON.parse(user);
        token = user.token || user.accessToken || user.jwt || "";
      } catch {}
    }
    if (!token) return;

    if (
      !confirm(
        "Are you sure you want to request to return this book? It will need admin approval."
      )
    )
      return;

    try {
      const response = await apiClient.put(
        `/api/reservations/${reservationId}/return`,
        {},
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        }
      );
      alert(response.data.message);
      fetchReservations(); // Refresh the list
    } catch (error) {
      console.error("Error requesting book return:", error);
      alert(error.response?.data?.message || "Failed to request book return");
    }
  };

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
      navigate("/my-reservations");
    }
  };

  const handleStatusChange = (e) => {
    console.log(
      `handleStatusChange: isInitialLoad=${isInitialLoad}, status changing from "${statusFilter}" to "${e.target.value}"`
    );
    setStatusFilter(e.target.value);
    // Only reset page and navigate if not during initial load
    if (!isInitialLoad) {
      console.log("handleStatusChange: Resetting to page 1");
      setCurrentPage(1);
      navigate("/my-reservations");
    }
  };

  // Mark initial load as complete once reservations are loaded and page is ready
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
          <span
            role="img"
            aria-label="Reservations"
            style={{ marginRight: "0.5rem" }}
          >
            🎟️
          </span>
          My Book Reservations
        </h2>
      </div>

      {/* Description */}
      <div className="mb-4">
        <p className="text-muted">
          View and manage your book reservations. You can search by book title
          or author, filter by status, and perform actions like extending or
          returning books.
        </p>
      </div>

      {/* Search and Filter */}
      <div className="row mb-4 search-filter-container">
        <div className="col-md-6">
          <div className="input-group">
            <input
              name="search"
              type="text"
              className="form-control border-dark"
              placeholder="Search by book title or author..."
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
            value={statusFilter}
            onChange={handleStatusChange}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="returned">Returned</option>
            <option value="extended">Extended</option>
          </select>
        </div>
      </div>

      {/* Reservations Grid */}
      {filteredReservations.length === 0 ? (
        <div className="text-center text-muted my-5 no-results-container">
          {reservations.length === 0 ? (
            <>
              <img
                style={{ marginBottom: "50px" }}
                src={import.meta.env.VITE_API_URL + "/uploads/no_data.png"}
                alt="No data"
              />
              <h4>No Reservations Made</h4>
              <p>You don't have any book reservations yet.</p>
              <Link to="/books" className="btn btn-dark">
                Browse Books Collection
              </Link>
            </>
          ) : (
            <>
              <h4>No reservations match your search criteria.</h4>
              <p>Try adjusting your search terms or status filter.</p>
              <button
                className="btn btn-outline-dark"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("");
                  setCurrentPage(1);
                  navigate("/my-reservations");
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
              Showing {getCurrentPageReservations().length} of{" "}
              {filteredReservations.length} reservations
              {(searchTerm || statusFilter) && (
                <span> (filtered from {reservations.length} total)</span>
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
              getCurrentPageReservations().map((reservation) => (
                <Card
                  key={reservation._id}
                  type="reservation"
                  reservation={reservation}
                  onExtend={handleExtendReservation}
                  onReturn={handleReturnBook}
                />
              ))}
          </div>
        </>
      )}

      {/* Pagination Component */}
      {filteredReservations.length > reservationsPerPage && (
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

export default MyReservations;
