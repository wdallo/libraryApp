import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import apiClient from "../../utils/apiClient";
import Loading from "../../components/Loading";
import Modal from "../../components/Modal";
import { faBackward } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function AdminReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("pending"); // "all", "pending", "active", "returned"
  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: "",
    message: "",
    type: "alert",
    onConfirm: null,
  });
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchReservations();
  }, [filter]);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(
        localStorage.getItem("user") || sessionStorage.getItem("user")
      );

      let endpoint = "/api/reservations/admin";
      if (filter === "pending") {
        endpoint = "/api/reservations/pending";
      } else if (filter !== "all") {
        endpoint = `/api/reservations/admin?status=${filter}`;
      }

      const response = await apiClient.get(endpoint, {
        headers: {
          authorization: `Bearer ${user.token}`,
        },
      });

      setReservations(response.data.reservations || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching reservations:", err);
      setError("Failed to load reservations. Please try again.");
    } finally {
      setLoading(false);
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

  const handleApproveReservation = (reservation) => {
    showConfirm(
      "Approve Reservation",
      `Are you sure you want to approve the reservation for "${reservation.book?.title}" by ${reservation.user?.firstName}  ${reservation.user?.lastName}?`,
      async () => {
        await processReservation(reservation._id, "approve");
      }
    );
  };

  const handleRejectReservation = (reservation) => {
    showConfirm(
      "Reject Reservation",
      `Are you sure you want to reject the reservation for "${reservation.book?.title}" by ${reservation.user?.firstName}  ${reservation.user?.lastName}?`,
      async () => {
        await processReservation(reservation._id, "reject");
      }
    );
  };

  const handleApproveReturn = (reservation) => {
    showConfirm(
      "Approve Return",
      `Are you sure you want to approve the return of "${reservation.book?.title}" by ${reservation.user?.firstName} ${reservation.user?.lastName}?`,
      async () => {
        await processReturn(reservation._id);
      }
    );
  };

  const processReservation = async (reservationId, action) => {
    try {
      setProcessingId(reservationId);
      const user = JSON.parse(
        localStorage.getItem("user") || sessionStorage.getItem("user")
      );

      const endpoint =
        action === "approve"
          ? `/api/reservations/${reservationId}/approve`
          : `/api/reservations/${reservationId}/reject`;

      const response = await apiClient.put(
        endpoint,
        {},
        {
          headers: {
            authorization: `Bearer ${user.token}`,
          },
        }
      );

      showAlert("Success", response.data.message);
      fetchReservations(); // Refresh the list
    } catch (error) {
      console.error(`Error ${action}ing reservation:`, error);
      const errorMessage =
        error.response?.data?.message || `Failed to ${action} reservation.`;
      showAlert("Error", errorMessage);
    } finally {
      setProcessingId(null);
    }
  };

  const processReturn = async (reservationId) => {
    try {
      setProcessingId(reservationId);
      const user = JSON.parse(
        localStorage.getItem("user") || sessionStorage.getItem("user")
      );

      const response = await apiClient.put(
        `/api/reservations/${reservationId}/approve-return`,
        {},
        {
          headers: {
            authorization: `Bearer ${user.token}`,
          },
        }
      );

      showAlert("Success", response.data.message);
      fetchReservations(); // Refresh the list
    } catch (error) {
      console.error("Error approving return:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to approve return.";
      showAlert("Error", errorMessage);
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: "bg-warning text-dark",
      active: "bg-success",
      returned: "bg-secondary",
      cancelled: "bg-danger",
      pending_return: "bg-info",
    };

    return (
      <span className={`badge ${statusClasses[status] || "bg-secondary"}`}>
        {status.replace("_", " ").toUpperCase()}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Manage Reservations</h1>
        <Link to={-1} className="btn btn-outline-secondary">
          <FontAwesomeIcon icon={faBackward} /> Go Back
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="card mb-4">
        <div className="card-header">
          <ul className="nav nav-tabs card-header-tabs">
            <li className="nav-item">
              <button
                className={`nav-link ${filter === "pending" ? "active" : ""}`}
                onClick={() => setFilter("pending")}
              >
                Pending Approval
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${filter === "active" ? "active" : ""}`}
                onClick={() => setFilter("active")}
              >
                Active
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${
                  filter === "pending_return" ? "active" : ""
                }`}
                onClick={() => setFilter("pending_return")}
              >
                Pending Return
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${filter === "returned" ? "active" : ""}`}
                onClick={() => setFilter("returned")}
              >
                Returned
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${filter === "all" ? "active" : ""}`}
                onClick={() => setFilter("all")}
              >
                All
              </button>
            </li>
          </ul>
        </div>
        <div className="card-body">
          {error ? (
            <div className="alert alert-danger" role="alert">
              <h4 className="alert-heading">Error</h4>
              <p>{error}</p>
              <button
                className="btn btn-outline-primary"
                onClick={fetchReservations}
              >
                Try Again
              </button>
            </div>
          ) : reservations.length === 0 ? (
            <div className="text-center py-4">
              <i
                className="bi bi-inbox"
                style={{ fontSize: "3rem", color: "#6c757d" }}
              ></i>
              <h5 className="mt-3 text-muted">No reservations found</h5>
              <p className="text-muted">
                {filter === "pending"
                  ? "There are no pending reservation requests at the moment."
                  : `No ${filter} reservations found.`}
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Book</th>
                    <th>User</th>
                    <th>Requested</th>
                    <th>Due Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reservations.map((reservation) => (
                    <tr key={reservation._id}>
                      <td>
                        <div className="d-flex align-items-center">
                          {reservation.book?.picture && (
                            <img
                              src={`${import.meta.env.VITE_API_URL}${
                                reservation.book.picture
                              }`}
                              alt={reservation.book.title}
                              className="me-3 rounded"
                              style={{
                                width: "40px",
                                height: "40px",
                                objectFit: "cover",
                              }}
                            />
                          )}
                          <div>
                            <div className="fw-bold">
                              {reservation.book?.title || "Unknown Book"}
                            </div>
                            <small className="text-muted">
                              {reservation.book?.author?.firstName}{" "}
                              {reservation.book?.author?.lastName}
                            </small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div>
                          <div className="fw-bold">
                            {reservation.user?.firstName +
                              " " +
                              reservation.user?.lastName || "Unknown User"}
                          </div>
                          <small className="text-muted">
                            {reservation.user?.email}
                          </small>
                        </div>
                      </td>
                      <td>{formatDate(reservation.createdAt)}</td>
                      <td>{formatDate(reservation.dueDate)}</td>
                      <td>{getStatusBadge(reservation.status)}</td>
                      <td>
                        {reservation.status === "pending" && (
                          <div className="btn-group btn-group-sm" role="group">
                            <button
                              className="btn btn-success"
                              onClick={() =>
                                handleApproveReservation(reservation)
                              }
                              disabled={processingId === reservation._id}
                            >
                              {processingId === reservation._id ? (
                                <span className="spinner-border spinner-border-sm me-1"></span>
                              ) : (
                                <i className="bi bi-check-lg me-1"></i>
                              )}
                              Approve
                            </button>
                            <button
                              className="btn btn-danger"
                              onClick={() =>
                                handleRejectReservation(reservation)
                              }
                              disabled={processingId === reservation._id}
                            >
                              <i className="bi bi-x-lg me-1"></i>
                              Reject
                            </button>
                          </div>
                        )}
                        {reservation.status === "pending_return" && (
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => handleApproveReturn(reservation)}
                            disabled={processingId === reservation._id}
                          >
                            <i className="bi bi-check-lg me-1"></i>
                            Approve Return
                          </button>
                        )}
                        {(reservation.status === "active" ||
                          reservation.status === "returned") && (
                          <span className="text-muted">
                            No actions available
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
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

export default AdminReservations;
