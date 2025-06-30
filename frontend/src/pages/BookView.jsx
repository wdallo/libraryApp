import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import apiClient from "../utils/apiClient";
import Loading from "../components/Loading";
import Modal from "../components/Modal";

function BookView() {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isReserving, setIsReserving] = useState(false);
  const [reservationStatus, setReservationStatus] = useState(null); // null, "pending", "active", "returned", etc.
  const [reservationData, setReservationData] = useState(null);
  const [user, setUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: "",
    message: "",
    type: "alert",
    onConfirm: null,
  });

  useEffect(() => {
    // Get user info
    const userData =
      localStorage.getItem("user") || sessionStorage.getItem("user");
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch {
        // Invalid user data
      }
    }

    // Validate bookId format (basic MongoDB ObjectId validation)
    if (!bookId || bookId.length !== 24 || !/^[0-9a-fA-F]{24}$/.test(bookId)) {
      // Invalid book ID format, redirect to 404
      navigate("/404", { replace: true });
      return;
    }

    // Fetch book details
    fetchBookDetails();
  }, [bookId, navigate]);

  useEffect(() => {
    // Check reservation status when user or book changes
    if (user && book) {
      checkReservationStatus();
    }
  }, [user, book]);

  const fetchBookDetails = async () => {
    try {
      setLoading(true);

      const response = await apiClient.get(`/api/books/${bookId}`);

      setBook(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching book details:", err);

      // If book not found (404), redirect to 404 page
      if (err.response?.status === 404) {
        console.log("Book not found, redirecting to 404 page");
        navigate("/404", { replace: true });
        return;
      }

      // For other errors (network, server errors, etc.), show error message
      setError("Failed to load book details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const checkReservationStatus = async () => {
    if (!user?.token || !book?._id) return;

    try {
      const response = await apiClient.get(`/api/reservations`, {
        headers: {
          authorization: `Bearer ${user.token}`,
        },
      });

      const userReservations = response.data.reservations || [];
      const bookReservation = userReservations.find(
        (reservation) =>
          reservation.book?._id === book._id &&
          ["pending", "active", "pending_return"].includes(reservation.status)
      );

      if (bookReservation) {
        setReservationStatus(bookReservation.status);
        setReservationData(bookReservation);
      } else {
        setReservationStatus(null);
        setReservationData(null);
      }
    } catch (error) {
      console.error("Error checking reservation status:", error);
    }
  };

  const showAlert = (title, message) => {
    setModalConfig({
      title,
      message,
      type: "alert",
      onConfirm: null,
    });
    setShowModal(true);
  };

  const showConfirm = (title, message, onConfirm) => {
    setModalConfig({
      title,
      message,
      type: "confirm",
      onConfirm,
    });
    setShowModal(true);
  };
  const handleReserveBook = async () => {
    if (!user) {
      showAlert("Login Required", "Please log in to reserve books.");
      return;
    }

    if (reservationStatus) {
      if (reservationStatus === "pending") {
        showAlert(
          "Pending Approval",
          "Your reservation request is pending admin approval."
        );
      } else if (reservationStatus === "active") {
        showAlert("Already Reserved", "You have already reserved this book.");
      }
      return;
    }

    showConfirm(
      "Confirm Reservation",
      `Are you sure you want to reserve "${book.title}"? Your request will be sent to admin for approval.`,
      async () => {
        setIsReserving(true);
        try {
          const response = await apiClient.post(
            `/api/reservations`,
            { bookId: book._id },
            {
              headers: {
                authorization: `Bearer ${user.token}`,
              },
            }
          );

          setReservationStatus("pending");
          setReservationData(response.data.reservation);
          showAlert(
            "Success",
            "Book reservation request submitted successfully! Please wait for admin approval."
          );

          // Refresh reservation status
          setTimeout(() => {
            checkReservationStatus();
          }, 1000);
        } catch (error) {
          console.error("Error reserving book:", error);
          const errorMessage =
            error.response?.data?.message ||
            "Failed to reserve book. Please try again.";
          showAlert("Reservation Failed", errorMessage);
        } finally {
          setIsReserving(false);
        }
      }
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const getAvailabilityStatus = () => {
    if (!book) return { text: "Unknown", className: "text-muted" };

    if (book.availableQuantity > 0) {
      return {
        text: `${book.availableQuantity} available`,
        className: "text-success",
      };
    } else {
      return {
        text: "Not available",
        className: "text-danger",
      };
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Error</h4>
          <p>{error}</p>
          <hr />
          <div className="d-flex gap-2">
            <button
              className="btn btn-outline-primary"
              onClick={fetchBookDetails}
            >
              Try Again
            </button>
            <Link to="/books" className="btn btn-secondary">
              Back to Books
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!book) {
    // If we get here, it means the book data is null but no 404 error occurred
    // This could happen if the API returns empty data
    return (
      <div className="container mt-4">
        <div className="alert alert-warning" role="alert">
          <h4 className="alert-heading">Book Data Unavailable</h4>
          <p>The book data could not be loaded at this time.</p>
          <hr />
          <div className="d-flex gap-2">
            <button
              className="btn btn-outline-primary"
              onClick={fetchBookDetails}
            >
              Try Again
            </button>
            <Link to="/books" className="btn btn-secondary">
              Back to Books
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const availabilityStatus = getAvailabilityStatus();

  return (
    <div className="container mt-4">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/">Home</Link>
          </li>
          <li className="breadcrumb-item">
            <Link to="/books">Books</Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            {book.title}
          </li>
        </ol>
      </nav>

      <div className="row">
        {/* Book Image */}
        <div className="col-md-4 mb-4">
          <div className="card sticky-top" style={{ top: "90px", zIndex: 1 }}>
            <div className="card-body text-center">
              {book.picture || book.image ? (
                <img
                  src={
                    import.meta.env.VITE_API_URL + (book.picture || book.image)
                  }
                  alt={book.title}
                  className="img-fluid rounded"
                  style={{ width: "100%", objectFit: "cover" }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      import.meta.env.VITE_API_URL + "/uploads/notfound.png";
                  }}
                />
              ) : (
                <div
                  className="d-flex align-items-center justify-content-center bg-light rounded"
                  style={{ height: "300px" }}
                >
                  <i
                    className="bi bi-book"
                    style={{ fontSize: "4rem", color: "#6c757d" }}
                  ></i>
                  <div className="mt-2 text-muted">
                    <small>No image available</small>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Book Details */}
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h1 className="card-title mb-0">{book.title}</h1>
            </div>
            <div className="card-body">
              <div className="row mb-3">
                <div className="col-sm-3">
                  <strong>Author:</strong>
                </div>
                <div className="col-sm-9">
                  {book.author?.firstName ? (
                    <Link
                      to={`/authors/${book.author._id}/books`}
                      className="text-decoration-none"
                    >
                      {book.author.firstName} {""} {book.author.lastName}
                    </Link>
                  ) : (
                    "Unknown Author"
                  )}
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-sm-3">
                  <strong>Category:</strong>
                </div>
                <div className="col-sm-9">
                  {book.category &&
                  Array.isArray(book.category) &&
                  book.category.length > 0 ? (
                    book.category.map((cat, index) => (
                      <Link
                        key={cat._id || index}
                        to={`/categories/${cat._id}/books`}
                        className="text-decoration-none me-2"
                      >
                        <span className="badge bg-primary">{cat.name}</span>
                      </Link>
                    ))
                  ) : (
                    <span className="badge bg-secondary">Uncategorized</span>
                  )}
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-sm-3">
                  <strong>Published:</strong>
                </div>
                <div className="col-sm-9">
                  {formatDate(book.publishedDate || book.releaseYear)}
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-sm-3">
                  <strong>Pages:</strong>
                </div>
                <div className="col-sm-9">{book.pages || "N/A"}</div>
              </div>

              <div className="row mb-3">
                <div className="col-sm-3">
                  <strong>Language:</strong>
                </div>
                <div className="col-sm-9">{book.language || "N/A"}</div>
              </div>

              <div className="row mb-3">
                <div className="col-sm-3">
                  <strong>Total Quantity:</strong>
                </div>
                <div className="col-sm-9">{book.totalQuantity || 0}</div>
              </div>

              <div className="row mb-3">
                <div className="col-sm-3">
                  <strong>Availability:</strong>
                </div>
                <div className="col-sm-9">
                  <span className={`fw-bold ${availabilityStatus.className}`}>
                    {availabilityStatus.text}
                  </span>
                </div>
              </div>

              {/* Reservation Status for current user */}
              {user && reservationStatus && (
                <div className="row mb-3">
                  <div className="col-sm-3">
                    <strong>Your Reservation:</strong>
                  </div>
                  <div className="col-sm-9">
                    {reservationStatus === "pending" && (
                      <span className="badge bg-warning text-dark">
                        <i className="bi bi-clock me-1"></i>
                        Pending Admin Approval
                      </span>
                    )}
                    {reservationStatus === "active" && (
                      <span className="badge bg-success">
                        <i className="bi bi-check-circle me-1"></i>
                        Approved & Active
                      </span>
                    )}
                    {reservationStatus === "pending_return" && (
                      <span className="badge bg-info">
                        <i className="bi bi-arrow-return-left me-1"></i>
                        Return Pending Approval
                      </span>
                    )}
                    {reservationData?.dueDate &&
                      reservationStatus === "active" && (
                        <small className="text-muted ms-2">
                          Due: {formatDate(reservationData.dueDate)}
                        </small>
                      )}
                  </div>
                </div>
              )}

              {book.description && (
                <div className="row mb-3">
                  <div className="col-sm-3">
                    <strong>Description:</strong>
                  </div>
                  <div className="col-sm-9">
                    <p className="mb-0">{book.description}</p>
                  </div>
                </div>
              )}

              <div className="row mb-3">
                <div className="col-sm-3">
                  <strong>Added:</strong>
                </div>
                <div className="col-sm-9">{formatDate(book.createdAt)}</div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 d-flex gap-2 flex-wrap">
                {user ? (
                  <button
                    className={`btn ${
                      reservationStatus === "active"
                        ? "btn-success"
                        : reservationStatus === "pending"
                        ? "btn-warning"
                        : "btn-primary"
                    }`}
                    onClick={handleReserveBook}
                    disabled={
                      isReserving ||
                      reservationStatus ||
                      book.availableQuantity === 0
                    }
                  >
                    {isReserving ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Submitting Request...
                      </>
                    ) : reservationStatus === "active" ? (
                      <>
                        <i className="bi bi-check-circle me-2"></i>
                        Reserved & Approved
                      </>
                    ) : reservationStatus === "pending" ? (
                      <>
                        <i className="bi bi-clock me-2"></i>
                        Pending Approval
                      </>
                    ) : book.availableQuantity === 0 ? (
                      <>
                        <i className="bi bi-x-circle me-2"></i>
                        Not Available
                      </>
                    ) : (
                      <>
                        <i className="bi bi-bookmark me-2"></i>
                        Request Reservation
                      </>
                    )}
                  </button>
                ) : (
                  <Link to="/login" className="btn btn-primary">
                    <i className="bi bi-person me-2"></i>
                    Login to Reserve
                  </Link>
                )}

                <Link to="/books" className="btn btn-outline-secondary">
                  <i className="bi bi-arrow-left me-2"></i>
                  Back to Books
                </Link>

                {book.author?._id && (
                  <Link
                    to={`/authors/${book.author._id}/books`}
                    className="btn btn-outline-info"
                  >
                    <i className="bi bi-person-lines-fill me-2"></i>
                    More by {book.author.firstName} {""} {book.author.lastName}
                  </Link>
                )}

                {book.category &&
                  Array.isArray(book.category) &&
                  book.category.length > 0 &&
                  book.category[0]?._id && (
                    <Link
                      to={`/categories/${book.category[0]._id}/books`}
                      className="btn btn-outline-warning"
                    >
                      <i className="bi bi-tag me-2"></i>
                      More in {book.category[0].name}
                    </Link>
                  )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for alerts and confirmations */}
      {showModal && (
        <Modal
          show={showModal}
          title={modalConfig.title}
          type={modalConfig.type}
          onHide={() => setShowModal(false)}
          onConfirm={modalConfig.onConfirm}
          confirmText="Confirm"
          cancelText="Cancel"
        >
          {modalConfig.message}
        </Modal>
      )}
    </div>
  );
}

export default BookView;
