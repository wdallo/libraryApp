import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function MyReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
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
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/reservations`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setReservations(response.data.reservations || []);
    } catch (error) {
      console.error("Error fetching reservations:", error);
    } finally {
      setLoading(false);
    }
  };

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
      const response = await axios.put(
        `${
          import.meta.env.VITE_API_URL
        }/api/reservations/${reservationId}/extend`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
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
      const response = await axios.put(
        `${
          import.meta.env.VITE_API_URL
        }/api/reservations/${reservationId}/return`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
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

    if (status === "returned") {
      return <span className="badge bg-success">Returned</span>;
    }

    if (status === "pending_return") {
      return <span className="badge bg-info">Pending Return</span>;
    }

    if (status === "overdue" || daysUntilDue < 0) {
      return <span className="badge bg-danger">Overdue</span>;
    }

    if (daysUntilDue <= 3) {
      return <span className="badge bg-warning text-dark">Due Soon</span>;
    }

    return <span className="badge bg-primary">Active</span>;
  };

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center">Loading your reservations...</div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <h2 className="mb-4 text-black">My Book Reservations</h2>

      {reservations.length === 0 ? (
        <div className="text-center">
          <p>You don't have any book reservations yet.</p>
          <Link to="/books" className="btn btn-primary">
            Browse Books
          </Link>
        </div>
      ) : (
        <div className="row">
          {reservations.map((reservation) => (
            <div key={reservation._id} className="col-md-6 col-lg-4 mb-4">
              <div className="card h-100 border-dark">
                <div className="card-body d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <h5 className="card-title text-truncate me-2">
                      {reservation.book?.title || "Unknown Book"}
                    </h5>
                    {getStatusBadge(reservation.status, reservation.dueDate)}
                  </div>

                  <div className="mb-3">
                    <p className="card-text mb-1">
                      <i className="fas fa-calendar me-2"></i>
                      <strong>Reserved:</strong>{" "}
                      {formatDate(reservation.reservedAt)}
                    </p>
                    <p className="card-text mb-1">
                      <i className="fas fa-clock me-2"></i>
                      <strong>Due:</strong> {formatDate(reservation.dueDate)}
                    </p>
                    <p className="card-text mb-1">
                      <i className="fas fa-redo me-2"></i>
                      <strong>Extensions used:</strong>{" "}
                      {reservation.extensionsUsed}/2
                    </p>
                    {reservation.status === "active" && (
                      <p className="card-text mb-0">
                        <i className="fas fa-hourglass-half me-2"></i>
                        <strong>Days remaining:</strong>{" "}
                        {getDaysUntilDue(reservation.dueDate)}
                      </p>
                    )}
                  </div>

                  <div className="mt-auto">
                    <div className="d-flex gap-2 flex-wrap">
                      <Link
                        to={`/books/${reservation.book?._id}`}
                        className="btn btn-outline-primary btn-sm"
                      >
                        <i className="fas fa-eye me-1"></i> View Book
                      </Link>

                      {reservation.status === "active" && (
                        <>
                          {reservation.extensionsUsed < 2 && (
                            <button
                              onClick={() =>
                                handleExtendReservation(reservation._id)
                              }
                              className="btn btn-warning btn-sm"
                            >
                              <i className="fas fa-plus-circle me-1"></i> Extend
                            </button>
                          )}
                          <button
                            onClick={() => handleReturnBook(reservation._id)}
                            className="btn btn-success btn-sm"
                          >
                            <i className="fas fa-check me-1"></i> Request Return
                          </button>
                        </>
                      )}

                      {reservation.status === "pending_return" && (
                        <span className="text-muted">
                          <i className="fas fa-clock me-1"></i> Waiting for
                          admin approval
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyReservations;
