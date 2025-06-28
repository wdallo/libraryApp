import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function AdminProtectedRoute({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is admin
    const storedUser =
      localStorage.getItem("user") || sessionStorage.getItem("user");
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        if (userData.role === "admin") {
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
        }
      } catch {
        setIsAuthorized(false);
      }
    } else {
      setIsAuthorized(false);
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  // Show error page if not authorized
  if (!isAuthorized) {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card border-danger">
              <div className="card-header bg-danger text-white">
                <h4 className="mb-0">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  Access Denied
                </h4>
              </div>
              <div className="card-body text-center">
                <div className="mb-4">
                  <i className="fas fa-shield-alt fa-4x text-danger mb-3"></i>
                  <h5>Administrator Access Required</h5>
                  <p className="text-muted">
                    You do not have permission to access this page. Only
                    administrators can access this section.
                  </p>
                </div>
                {!user ? (
                  <div>
                    <p className="mb-3">
                      Please log in with an administrator account.
                    </p>
                    <Link to="/login" className="btn btn-primary">
                      <i className="fas fa-sign-in-alt me-2"></i>
                      Go to Login
                    </Link>
                  </div>
                ) : (
                  <div>
                    <p className="mb-3">
                      You are logged in as:{" "}
                      <strong>
                        {user.firstName + " " + user.lastName || user.email}
                      </strong>
                    </p>
                    <p className="mb-3">
                      Contact your system administrator to request admin access.
                    </p>
                    <Link to="/" className="btn btn-secondary">
                      <i className="fas fa-home me-2"></i>
                      Return to Home
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If authorized, render the protected content
  return children;
}

export default AdminProtectedRoute;
