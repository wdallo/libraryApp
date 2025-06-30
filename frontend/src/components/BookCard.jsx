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
    <div className="book-outer mb-4">
      <div
        className="card bg-dark text-white border-white border-2 shadow"
        style={{
          maxWidth: 320,
          minWidth: 320,
          minHeight: 670,
          maxHeight: 670,
          borderRadius: 16,
        }}
      >
        <div
          className="book-image-wrap card-img-top"
          style={{
            height: 320,
            background: "#222",
            borderBottom: "1px solid #444",
            borderRadius: "16px 16px 0 0",
            overflow: "hidden",
          }}
        >
          <img
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: "0 0 12px 12px",
              boxShadow: "0 2px 12px 0 rgba(0,0,0,0.18)",
            }}
            src={import.meta.env.VITE_API_URL + book.picture}
            className="book-img"
            alt={book.title || "Book cover"}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src =
                import.meta.env.VITE_API_URL + "/uploads/notfound.png";
            }}
          />
        </div>
        <div className="card-body d-flex flex-column p-3">
          <h5 className="card-title mb-1">{book.title || "Untitled"}</h5>
          <p className="card-subtitle mb-1 text-light">
            {book.author &&
            typeof book.author === "object" &&
            book.author.firstName
              ? `${book.author.firstName} ${book.author.lastName || ""}`
              : typeof book.author === "string"
              ? book.author
              : "Unknown Author"}
          </p>
          <p className="mb-2 text-light">
            <br /> <b>Category</b>
            <br />
            {book.category &&
            Array.isArray(book.category) &&
            book.category.length > 0
              ? book.category[0]?.name || "Uncategorized"
              : book.category?.name || "Uncategorized"}
            <br /> <br /> <b>Published</b>
            <br />
            {book.publishedYear
              ? book.publishedYear
              : book.publishedDate
              ? new Date(book.publishedDate).getFullYear()
              : "Unknown Year"}{" "}
            year
          </p>
          <p
            className="card-text text-light flex-grow-1 mb-2"
            style={{ minHeight: 48 }}
          >
            {(book.description || "No description available.").slice(0, 100)}
            {book.description && book.description.length > 100 ? "..." : ""}
          </p>
          <div className="d-flex gap-2 mt-auto">
            <Link
              to={`/books/${book._id || book.id}`}
              className="btn btn-outline-light btn-sm flex-fill fw-bold book-view-btn"
            >
              <FontAwesomeIcon icon={faEye} className="me-1" /> View Details
            </Link>
            {isCheckingStatus ? (
              <button
                disabled
                className="btn btn-outline-secondary btn-sm flex-fill fw-bold"
              >
                <FontAwesomeIcon icon={faSpinner} spin className="me-1" />{" "}
                Checking...
              </button>
            ) : reservationStatus === null ? (
              <button
                onClick={handleReserveBook}
                disabled={isReserving}
                className="btn btn-success btn-sm flex-fill fw-bold"
              >
                <FontAwesomeIcon
                  icon={isReserving ? faSpinner : faBookmark}
                  spin={isReserving}
                  className="me-1"
                />
                {isReserving ? "Reserving..." : "Reserve"}
              </button>
            ) : reservationStatus === "pending" ? (
              <button
                disabled
                className="btn btn-warning btn-sm flex-fill fw-bold text-dark"
              >
                <FontAwesomeIcon icon={faClock} className="me-1" /> Pending
                Approval
              </button>
            ) : (
              <button
                disabled
                className="btn btn-secondary btn-sm flex-fill fw-bold"
              >
                <FontAwesomeIcon icon={faCheck} className="me-1" /> Reserved
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

      <style>{`
        .book-outer {
          display: flex;
          justify-content: center;
        }
        .book-view-btn:hover {
          background: #fff !important;
          color: #111 !important;
          border-color: #111 !important;
        }
      `}</style>
    </div>
  );
}

export default BookCard;
