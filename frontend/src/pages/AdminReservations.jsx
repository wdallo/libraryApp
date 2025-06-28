import { useEffect, useState } from "react";
import apiClient from "../utils/apiClient";
import { Link } from "react-router-dom";
import Loading from "../components/Loading";

function AdminReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchReservations();
  }, [statusFilter]);

  const fetchReservations = async () => {
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
      const params = statusFilter !== "all" ? `?status=${statusFilter}` : "";
      const response = await apiClient.get(`/api/reservations/admin${params}`, {
        headers: {
          authorization: `Bearer ${token}`,
        },
      });
      setReservations(response.data.reservations || []);
    } catch (error) {
      console.error("Error fetching reservations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveReturn = async (reservationId) => {
    let user = localStorage.getItem("user") || sessionStorage.getItem("user");
    let token = "";

    if (user) {
      try {
        user = JSON.parse(user);
        token = user.token || user.accessToken || user.jwt || "";
      } catch {}
    }

    if (!token) return;

    if (!confirm("Are you sure you want to approve this book return?")) return;

    try {
      const response = await apiClient.put(
        `/api/reservations/${reservationId}/approve-return`,
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
      console.error("Error approving return:", error);
      alert(error.response?.data?.message || "Failed to approve return");
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
      return <span className="badge bg-warning">Pending Return</span>;
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
    return <Loading />;
  }

  const pendingReturns = reservations.filter(
    (r) => r.status === "pending_return"
  );

  return (
    <div className="container mt-5">
      <h2 className="mb-4 text-black">Manage Book Reservations</h2>

      {/* Pending Returns Alert */}
      {pendingReturns.length > 0 && (
        <div className="alert alert-warning mb-4">
          <i className="fas fa-exclamation-triangle me-2"></i>
          <strong>{pendingReturns.length}</strong> book return
          {pendingReturns.length !== 1 ? "s" : ""} pending approval
        </div>
      )}

      {/* Filter Controls */}
      <div className="mb-4">
        <div className="btn-group" role="group">
          <button
            type="button"
            className={`btn ${
              statusFilter === "all" ? "btn-primary" : "btn-outline-primary"
            }`}
            onClick={() => setStatusFilter("all")}
          >
            All Reservations
          </button>
          <button
            type="button"
            className={`btn ${
              statusFilter === "active" ? "btn-primary" : "btn-outline-primary"
            }`}
            onClick={() => setStatusFilter("active")}
          >
            Active
          </button>
          <button
            type="button"
            className={`btn ${
              statusFilter === "pending_return"
                ? "btn-warning"
                : "btn-outline-warning"
            }`}
            onClick={() => setStatusFilter("pending_return")}
          >
            Pending Returns ({pendingReturns.length})
          </button>
          <button
            type="button"
            className={`btn ${
              statusFilter === "returned"
                ? "btn-success"
                : "btn-outline-success"
            }`}
            onClick={() => setStatusFilter("returned")}
          >
            Returned
          </button>
          <button
            type="button"
            className={`btn ${
              statusFilter === "overdue" ? "btn-danger" : "btn-outline-danger"
            }`}
            onClick={() => setStatusFilter("overdue")}
          >
            Overdue
          </button>
        </div>
      </div>

      {reservations.length === 0 ? (
        <div className="text-center">
          <p>No reservations found for the selected filter.</p>
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
                      <i className="fas fa-user me-2"></i>
                      <strong>User:</strong>{" "}
                      {reservation.user?.username ||
                        reservation.user?.email ||
                        "Unknown User"}
                    </p>
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

                      {reservation.status === "pending_return" && (
                        <button
                          onClick={() => handleApproveReturn(reservation._id)}
                          className="btn btn-success btn-sm"
                        >
                          <i className="fas fa-check me-1"></i> Approve Return
                        </button>
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

export default AdminReservations;
