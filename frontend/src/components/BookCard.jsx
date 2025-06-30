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
} from "@fortawesome/free-solid-svg-icons";

function BookCard({ book }) {
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

  useEffect(() => {
    const user = localStorage.getItem("user") || sessionStorage.getItem("user");
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
    // eslint-disable-next-line
  }, [book._id]);

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
          reservation.book?._id === book._id &&
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
            { bookId: book._id },
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

  return (
    <div className="book-card-container">
      <div className="modern-book-card">
        {/* Book Cover */}
        <div className="book-cover">
          <img
            loading="lazy"
            src={import.meta.env.VITE_API_URL + book.picture}
            alt={book.title || "Book cover"}
            className="cover-image"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src =
                import.meta.env.VITE_API_URL + "/uploads/notfound.png";
            }}
          />
          {/* Availability Badge */}
          <div className="availability-badge">
            {book.availableQuantity > 0 ? (
              <span className="available">Available</span>
            ) : (
              <span className="unavailable">Out of Stock</span>
            )}
          </div>
        </div>

        {/* Book Content */}
        <div className="book-content">
          <div className="book-info">
            <h3 className="book-title">{book.title || "Untitled"}</h3>
            <p className="book-author">
              {book.author &&
              typeof book.author === "object" &&
              book.author.firstName
                ? `${book.author.firstName} ${book.author.lastName || ""}`
                : typeof book.author === "string"
                ? book.author
                : "Unknown Author"}
            </p>

            <div className="book-meta">
              <span className="category">
                {book.category &&
                Array.isArray(book.category) &&
                book.category.length > 0
                  ? book.category[0]?.name || "Uncategorized"
                  : book.category?.name || "Uncategorized"}
              </span>
              <span className="year">
                {book.publishedYear
                  ? book.publishedYear
                  : book.publishedDate
                  ? new Date(book.publishedDate).getFullYear()
                  : "Unknown"}
              </span>
            </div>

            <p className="book-description">
              {(book.description || "No description available.").slice(0, 90)}
              {book.description && book.description.length > 90 ? "..." : ""}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="book-actions">
            <Link to={`/books/${book._id || book.id}`} className="btn-view">
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
                disabled={isReserving || book.availableQuantity <= 0}
                className={`btn-reserve ${
                  book.availableQuantity <= 0 ? "disabled" : ""
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

export default BookCard;
