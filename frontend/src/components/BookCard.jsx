import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import apiClient from "../utils/apiClient";
import Modal from "./Modal";

function BookCard({ book }) {
  const [isReserving, setIsReserving] = useState(false);
  const [isReserved, setIsReserved] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: "",
    message: "",
    type: "alert",
    onConfirm: null,
  });

  useEffect(() => {
    // Only check status if user is logged in and has a valid token
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
      } catch {
        // Invalid user data, don't check status
      }
    }
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
      setIsCheckingStatus(false);
      return;
    }

    try {
      const response = await apiClient.get(`/api/reservations`, {
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      // Check if this book is already reserved by the current user
      const userReservations = response.data.reservations || [];
      const bookReservation = userReservations.find(
        (reservation) =>
          reservation.book?._id === book._id && reservation.status === "active"
      );

      setIsReserved(!!bookReservation);
    } catch (error) {
      console.error("Error checking reservation status:", error);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleReserveBook = async () => {
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
      showAlert("Login Required", "You need to log in to reserve books.");
      return;
    }

    // Ask for confirmation before reserving
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
          setIsReserved(true);
          showAlert("Success", "Book reserved successfully!");
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
      <div className="book-card book-card-hover bg-dark border-white border-2 shadow">
        <div className="book-image-wrap">
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
        <div className="book-info d-flex flex-column p-3">
          <h5 className="book-title text-white mb-1">
            {book.title || "Untitled"}
          </h5>
          <p className="book-author mb-1">
            <i className="fas fa-user me-1"></i>
            {book.author &&
            typeof book.author === "object" &&
            book.author.firstname
              ? `${book.author.firstName} ${book.author.lastName || ""}`
              : typeof book.author === "string"
              ? book.author
              : "Unknown Author"}
          </p>
          <p className="book-meta  mb-2">
            <i className="fas fa-tag me-1"></i>
            {book.category &&
            Array.isArray(book.category) &&
            book.category.length > 0
              ? book.category[0]?.name || "Uncategorized"
              : book.category?.name || "Uncategorized"}
            <span className="mx-2">•</span>
            <i className="fas fa-calendar me-1"></i>
            {book.publishedYear || book.publishedDate || "Unknown Year"}
          </p>
          <p
            className="book-desc text-light flex-grow-1 mb-2"
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
              <i className="fas fa-eye me-1"></i> View Details
            </Link>
            {isCheckingStatus ? (
              <button
                disabled
                className="btn btn-outline-secondary btn-sm flex-fill fw-bold"
              >
                <i className="fas fa-spinner fa-spin me-1"></i> Checking...
              </button>
            ) : !isReserved ? (
              <button
                onClick={handleReserveBook}
                disabled={isReserving}
                className="btn btn-success btn-sm flex-fill fw-bold"
              >
                <i
                  className={`fas ${
                    isReserving ? "fa-spinner fa-spin" : "fa-bookmark"
                  } me-1`}
                ></i>
                {isReserving ? "Reserving..." : "Reserve"}
              </button>
            ) : (
              <button
                disabled
                className="btn btn-secondary btn-sm flex-fill fw-bold"
              >
                <i className="fas fa-check me-1"></i> Reserved
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
        .book-card {
        color:#fff;
          width: 100%;
          max-width: 320px;
          min-height: 480px;
          border-radius: 16px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-shadow: 0 4px 24px 0 rgba(0,0,0,0.18);
          background: linear-gradient(135deg, #232526 0%, #414345 100%);
        }
        .book-card-hover:hover {
          box-shadow: 0 0 0 4px #fff, 0 8px 32px 0 rgba(0,0,0,0.22);
          transform: translateY(-4px) scale(1.03);
          transition: box-shadow 0.2s, transform 0.2s;
        }
        .book-image-wrap {
          width: 100%;
          height: 320px;
          background: #222;
          display: flex;
          align-items: center;
          justify-content: center;
          border-bottom: 1px solid #444;
        }
        .book-img {
          width: auto;
          height: 100%;
          max-width: 100%;
          object-fit: cover;
          border-radius: 0 0 12px 12px;
          box-shadow: 0 2px 12px 0 rgba(0,0,0,0.18);
        }
        .book-title {
          font-size: 1.2rem;
          font-weight: 700;
        }
        .book-author, .book-meta {
          font-size: 0.95rem;
        }
        .book-desc {
          font-size: 0.97rem;
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
