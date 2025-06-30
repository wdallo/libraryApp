import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import apiClient from "../../utils/apiClient";
import Loading from "../../components/Loading";
import {
  faTachometerAlt,
  faUsers,
  faBook,
  faTags,
  faBookmark,
  faUserEdit,
  faClock,
  faCheckCircle,
  faTimesCircle,
  faUndo,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBooks: 0,
    totalCategories: 0,
    totalReservations: 0,
    activeReservations: 0,
    pendingReservations: 0,
    overdueReservations: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
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
      const response = await apiClient.get("/api/admin/dashboard", {
        headers: {
          authorization: `Bearer ${token}`,
        },
      });
      setStats(response.data.stats || {});
      setRecentActivity(response.data.recentActivity || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-black">
          <FontAwesomeIcon icon={faTachometerAlt} className="me-2" />
          Admin Dashboard
        </h2>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h4 className="card-title">{stats.totalUsers}</h4>
                  <p className="card-text">Total Users</p>
                </div>
                <div className="align-self-center">
                  <FontAwesomeIcon icon={faUsers} size="2x" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-3">
          <div className="card bg-success text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h4 className="card-title">{stats.totalBooks}</h4>
                  <p className="card-text">Total Books</p>
                </div>
                <div className="align-self-center">
                  <FontAwesomeIcon icon={faBook} size="2x" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-3">
          <div className="card bg-info text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h4 className="card-title">{stats.totalCategories}</h4>
                  <p className="card-text">Categories</p>
                </div>
                <div className="align-self-center">
                  <FontAwesomeIcon icon={faTags} size="2x" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-3">
          <div className="card bg-warning text-dark">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h4 className="card-title">{stats.totalReservations}</h4>
                  <p className="card-text">Total Reservations</p>
                </div>
                <div className="align-self-center">
                  <FontAwesomeIcon icon={faBookmark} size="2x" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reservation Stats */}
      <div className="row mb-4">
        <div className="col-md-4 mb-3">
          <div className="card border-success">
            <div className="card-body text-center">
              <h5 className="card-title text-success">
                {stats.activeReservations}
              </h5>
              <p className="card-text">Active Reservations</p>
            </div>
          </div>
        </div>

        <div className="col-md-4 mb-3">
          <div className="card border-warning">
            <div className="card-body text-center">
              <h5 className="card-title text-warning">
                {stats.pendingReservations}
              </h5>
              <p className="card-text">Pending Reservations</p>
            </div>
          </div>
        </div>

        <div className="col-md-4 mb-3">
          <div className="card border-danger">
            <div className="card-body text-center">
              <h5 className="card-title text-danger">
                {stats.overdueReservations}
              </h5>
              <p className="card-text">Overdue Reservations</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Quick Actions</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6 mb-3">
                  <Link
                    to="/admin/users"
                    className="btn btn-outline-primary w-100"
                  >
                    <FontAwesomeIcon icon={faUsers} className="me-2" />
                    Manage Users
                  </Link>
                </div>
                <div className="col-md-6 mb-3">
                  <Link
                    to="/admin/books"
                    className="btn btn-outline-success w-100"
                  >
                    <FontAwesomeIcon icon={faBook} className="me-2" />
                    Manage Books
                  </Link>
                </div>
                <div className="col-md-6 mb-3">
                  <Link
                    to="/admin/categories"
                    className="btn btn-outline-info w-100"
                  >
                    <FontAwesomeIcon icon={faTags} className="me-2" />
                    Manage Categories
                  </Link>
                </div>
                <div className="col-md-6 mb-3">
                  <Link
                    to="/admin/authors"
                    className="btn btn-outline-secondary w-100"
                  >
                    <FontAwesomeIcon icon={faUserEdit} className="me-2" />
                    Manage Authors
                  </Link>
                </div>
                <div className="col-md-12 mb-3">
                  <Link
                    to="/admin/reservations"
                    className="btn btn-outline-warning w-100"
                  >
                    <FontAwesomeIcon icon={faBookmark} className="me-2" />
                    Manage Reservations
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Recent Activity</h5>
            </div>
            <div className="card-body">
              {recentActivity.length === 0 ? (
                <p className="text-muted">No recent activity</p>
              ) : (
                <div className="list-group list-group-flush">
                  {recentActivity.map((activity, index) => {
                    // Map icon strings to FontAwesome icons
                    const getIcon = (iconName) => {
                      switch (iconName) {
                        case "fa-clock":
                          return faClock;
                        case "fa-check-circle":
                          return faCheckCircle;
                        case "fa-times-circle":
                          return faTimesCircle;
                        case "fa-undo":
                          return faUndo;
                        case "fa-check":
                          return faCheck;
                        case "fa-bookmark":
                        default:
                          return faBookmark;
                      }
                    };

                    return (
                      <div key={index} className="list-group-item">
                        <div className="d-flex justify-content-between">
                          <div>
                            <FontAwesomeIcon
                              icon={getIcon(activity.icon)}
                              className={`me-2 text-${activity.color}`}
                            />
                            {activity.message}
                          </div>
                          <small className="text-muted">{activity.time}</small>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
