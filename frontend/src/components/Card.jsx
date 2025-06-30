import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import apiClient from "../utils/apiClient";
import Modal from "./Modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faSpinner,
  faClock,
  faCheck,
  faBookmark,
  faBook,
  faCalendar,
  faLayerGroup,
  faRedo,
  faHourglassHalf,
  faPlusCircle,
} from "@fortawesome/free-solid-svg-icons";

function Card({
  book,
  author,
  category,
  reservation,
  bookCount,
  type = "book",
  onExtend,
  onReturn,
}) {
  const [isReserving, setIsReserving] = useState(false);
  const [reservationStatus, setReservationStatus] = useState(null); // null, "pending", "active"
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: "",
    message: "",
    type: "alert",
    onConfirm: null,
  });

  // Use either book, author, category, or reservation data
  const item =
    type === "author"
      ? author
      : type === "category"
      ? category
      : type === "reservation"
      ? reservation?.book
      : book;

  useEffect(() => {
    if (type === "book" && item?._id) {
      const user =
        localStorage.getItem("user") || sessionStorage.getItem("user");
      if (user) {
        try {
          const userData = JSON.parse(user);
          const token =
            userData.token || userData.accessToken || userData.jwt || "";
          if (token) {
            setIsCheckingStatus(true);
            checkReservationStatus();
          }
        } catch {}
      }
    }
    // eslint-disable-next-line
  }, [item?._id, type]);

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

  const handleModalClose = () => {
    setShowModal(false);
  };

  const checkReservationStatus = async () => {
    let user = localStorage.getItem("user") || sessionStorage.getItem("user");
    let token = "";

    if (user) {
      try {
        user = JSON.parse(user);
        token = user.token || user.accessToken || user.jwt || "";
      } catch {}
    }

    if (!token) {
      setIsCheckingStatus(false);
      return;
    }

    try {
      const response = await apiClient.get(`/api/reservations`, {
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      const userReservations = response.data.reservations || [];
      const bookReservation = userReservations.find(
        (reservation) =>
          reservation.book?._id === item._id &&
          (reservation.status === "active" || reservation.status === "pending")
      );

      if (bookReservation) {
        setReservationStatus(bookReservation.status);
      } else {
        setReservationStatus(null);
      }
    } catch (error) {
      console.error("Error checking reservation status:", error);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleReserveBook = async () => {
    let user = localStorage.getItem("user") || sessionStorage.getItem("user");
    let token = "";
    if (user) {
      try {
        user = JSON.parse(user);
        token = user.token || user.accessToken || user.jwt || "";
      } catch {}
    }
    if (!token) {
      showAlert("Login Required", "You need to log in to reserve books.");
      return;
    }

    showConfirm(
      "Confirm Reservation",
      "Do you really want to reserve this book?",
      async () => {
        setIsReserving(true);
        try {
          await apiClient.post(
            `/api/reservations`,
            { bookId: item._id },
            {
              headers: {
                authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
          setReservationStatus("pending");
          showAlert(
            "Success",
            "Book reservation submitted! Waiting for admin approval."
          );
        } catch (error) {
          console.error("Error reserving book:", error);
          showAlert(
            "Error",
            error.response?.data?.message || "Failed to reserve book"
          );
        } finally {
          setIsReserving(false);
        }
      }
    );
  };

  // Utility functions for reservations
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getDaysUntilDue = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusBadge = (status, dueDate) => {
    const daysUntilDue = getDaysUntilDue(dueDate);

    switch (true) {
      case status === "returned":
        return <span className="badge bg-success">Returned</span>;
      case status === "pending":
        return <span className="badge bg-warning text-dark">Pending</span>;
      case status === "pending_return":
        return <span className="badge bg-info">Pending Return</span>;
      case status === "overdue" || daysUntilDue < 0:
        return <span className="badge bg-danger">Overdue</span>;
      case daysUntilDue <= 3:
        return <span className="badge bg-warning text-dark">Due Soon</span>;
      default:
        return <span className="badge bg-primary">Active</span>;
    }
  };

  return (
    <div className="book-card-container">
      <div
        className={`modern-book-card ${
          type === "reservation" ? "reservation-card" : ""
        }`}
      >
        {/* Cover/Image - only for books and authors */}
        {type !== "category" && type !== "reservation" && (
          <div className="book-cover">
            <img
              loading="lazy"
              src={
                import.meta.env.VITE_API_URL +
                (type === "author"
                  ? item.picture || "/uploads/notfound.png"
                  : item.picture)
              }
              alt={
                type === "author"
                  ? `${item.firstName || "Unknown"} ${item.lastName || ""}`
                  : item.title || "Book cover"
              }
              className="cover-image"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  import.meta.env.VITE_API_URL + "/uploads/notfound.png";
              }}
            />
            {/* Availability Badge - only for books */}
            {type === "book" && (
              <div className="availability-badge">
                {item.availableQuantity > 0 ? (
                  <span className="available">Available</span>
                ) : (
                  <span className="unavailable">Out of Stock</span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <div className="book-content">
          <div className="book-info">
            {type === "author" ? (
              <>
                <h3 className="book-title">
                  {(item.firstName || "Unknown") + " " + (item.lastName || "")}
                </h3>
                <p className="book-author">
                  <FontAwesomeIcon icon={faCalendar} className="me-1" />
                  Born:{" "}
                  {item.birthday
                    ? new Date(item.birthday).toLocaleDateString()
                    : "Unknown"}
                </p>
                <div className="book-meta">
                  <span className="category">Author</span>
                </div>
                <p className="book-description">
                  {(item.bio || "No biography available.").slice(0, 90)}
                  {item.bio && item.bio.length > 90 ? "..." : ""}
                </p>
              </>
            ) : type === "category" ? (
              <>
                <h3 className="book-title">
                  <FontAwesomeIcon icon={faLayerGroup} className="me-2" />
                  {item.name || "Unnamed Category"}
                </h3>
                <p className="book-author">
                  <FontAwesomeIcon icon={faBook} className="me-1" />
                  {typeof bookCount === "number"
                    ? bookCount
                    : item.bookCount || 0}{" "}
                  book
                  {(typeof bookCount === "number"
                    ? bookCount
                    : item.bookCount || 0) === 1
                    ? ""
                    : "s"}
                </p>
                <div className="book-meta">
                  <span className="category">Category</span>
                </div>
                <p className="book-description">
                  {(item.description || "No description available.").slice(
                    0,
                    90
                  )}
                  {item.description && item.description.length > 90
                    ? "..."
                    : ""}
                </p>
              </>
            ) : type === "reservation" ? (
              <>
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <h3 className="book-title text-truncate me-2">
                    {item?.title || "Unknown Book"}
                  </h3>
                  {getStatusBadge(reservation.status, reservation.dueDate)}
                </div>

                <div className="reservation-details mb-3">
                  <p className="card-text mb-1">
                    <FontAwesomeIcon icon={faCalendar} className="me-2" />
                    <strong>Reserved:</strong>{" "}
                    {formatDate(reservation.reservedAt)}
                  </p>
                  <p className="card-text mb-1">
                    <FontAwesomeIcon icon={faClock} className="me-2" />
                    <strong>Due:</strong> {formatDate(reservation.dueDate)}
                  </p>
                  <p className="card-text mb-1">
                    <FontAwesomeIcon icon={faRedo} className="me-2" />
                    <strong>Extensions used:</strong>{" "}
                    {reservation.extensionsUsed}/2
                  </p>
                  {reservation.status === "active" && (
                    <p className="card-text mb-0">
                      <FontAwesomeIcon
                        icon={faHourglassHalf}
                        className="me-2"
                      />
                      <strong>Days remaining:</strong>{" "}
                      {getDaysUntilDue(reservation.dueDate)}
                    </p>
                  )}
                </div>
              </>
            ) : (
              <>
                <h3 className="book-title">{item.title || "Untitled"}</h3>
                <p className="book-author">
                  {item.author &&
                  typeof item.author === "object" &&
                  item.author.firstName
                    ? `${item.author.firstName} ${item.author.lastName || ""}`
                    : typeof item.author === "string"
                    ? item.author
                    : "Unknown Author"}
                </p>
                <div className="book-meta">
                  <span className="category">
                    {item.category &&
                    Array.isArray(item.category) &&
                    item.category.length > 0
                      ? item.category[0]?.name || "Uncategorized"
                      : item.category?.name || "Uncategorized"}
                  </span>
                  <span className="year">
                    {item.publishedYear
                      ? item.publishedYear
                      : item.publishedDate
                      ? new Date(item.publishedDate).getFullYear()
                      : "Unknown"}
                  </span>
                </div>
                <p className="book-description">
                  {(item.description || "No description available.").slice(
                    0,
                    90
                  )}
                  {item.description && item.description.length > 90
                    ? "..."
                    : ""}
                </p>
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div
            className="book-actions d-flex justify-content-center"
            style={{ marginTop: "-2px" }}
          >
            {type === "author" ? (
              <Link
                to={`/authors/${item._id || item.id}/books`}
                className="btn-view"
              >
                <FontAwesomeIcon icon={faBook} />
                View Books
              </Link>
            ) : type === "category" ? (
              <Link
                to={`/categories/${item._id || item.id}/books`}
                className="btn-view"
              >
                <FontAwesomeIcon icon={faEye} />
                View Books
              </Link>
            ) : type === "reservation" ? (
              <div className="d-flex gap-2 flex-wrap justify-content-center">
                <Link
                  to={`/books/${item?._id}`}
                  className="btn btn-outline-primary btn-sm"
                >
                  <FontAwesomeIcon icon={faEye} className="me-1" /> View Book
                </Link>

                {reservation.status === "active" && (
                  <>
                    {reservation.extensionsUsed < 2 && (
                      <button
                        onClick={() => onExtend && onExtend(reservation._id)}
                        className="btn btn-warning btn-sm"
                      >
                        <FontAwesomeIcon icon={faPlusCircle} className="me-1" />{" "}
                        Extend
                      </button>
                    )}
                    <button
                      onClick={() => onReturn && onReturn(reservation._id)}
                      className="btn btn-success btn-sm "
                    >
                      <FontAwesomeIcon icon={faCheck} className="me-1" />{" "}
                      Request Return
                    </button>
                  </>
                )}

                {reservation.status === "pending_return" && (
                  <span className="text-muted">
                    <FontAwesomeIcon icon={faClock} className="me-1" /> Waiting
                    for admin approval
                  </span>
                )}
              </div>
            ) : (
              <>
                <Link to={`/books/${item._id || item.id}`} className="btn-view">
                  <FontAwesomeIcon icon={faEye} />
                  View
                </Link>

                {isCheckingStatus ? (
                  <button disabled className="btn-reserve checking">
                    <FontAwesomeIcon icon={faSpinner} spin />
                    Checking...
                  </button>
                ) : reservationStatus === null ? (
                  <button
                    onClick={handleReserveBook}
                    disabled={isReserving || item.availableQuantity <= 0}
                    className={`btn-reserve ${
                      item.availableQuantity <= 0 ? "disabled" : ""
                    }`}
                  >
                    <FontAwesomeIcon
                      icon={isReserving ? faSpinner : faBookmark}
                      spin={isReserving}
                    />
                    {isReserving ? "Reserving..." : "Reserve"}
                  </button>
                ) : reservationStatus === "pending" ? (
                  <button disabled className="btn-reserve pending">
                    <FontAwesomeIcon icon={faClock} />
                    Pending
                  </button>
                ) : (
                  <button disabled className="btn-reserve reserved">
                    <FontAwesomeIcon icon={faCheck} />
                    Reserved
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modal Component */}
      <Modal
        show={showModal}
        onHide={handleModalClose}
        title={modalConfig.title}
        type={modalConfig.type}
        onConfirm={modalConfig.onConfirm}
        confirmText="Yes, Reserve"
        confirmButtonClass="btn-success"
      >
        {modalConfig.message}
      </Modal>
    </div>
  );
}

export default Card;
