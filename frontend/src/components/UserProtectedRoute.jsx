import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function UserProtectedRoute({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const storedUser =
      localStorage.getItem("user") || sessionStorage.getItem("user");
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsAuthorized(true);
      } catch {
        setUser(null);
        setIsAuthorized(false);
      }
    } else {
      setUser(null);
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

  // Show error page if not logged in
  if (!isAuthorized) {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card border-warning">
              <div className="card-header bg-warning text-dark">
                <h4 className="mb-0">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  Login Required
                </h4>
              </div>
              <div className="card-body text-center">
                <div className="mb-4">
                  <i className="fas fa-user-lock fa-4x text-warning mb-3"></i>
                  <h5>User Authentication Required</h5>
                  <p className="text-muted">
                    You need to be logged in to access this page. Please log in
                    or create an account to continue.
                  </p>
                </div>
                <div className="d-grid gap-2 d-md-block">
                  <Link to="/login" className="btn btn-primary me-2">
                    <i className="fas fa-sign-in-alt me-2"></i>
                    Login
                  </Link>
                  <Link to="/register" className="btn btn-outline-primary">
                    <i className="fas fa-user-plus me-2"></i>
                    Create Account
                  </Link>
                </div>
                <hr className="my-4" />
                <Link to="/" className="btn btn-secondary">
                  <i className="fas fa-home me-2"></i>
                  Return to Home
                </Link>
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

export default UserProtectedRoute;
