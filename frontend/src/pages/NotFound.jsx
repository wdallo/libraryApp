import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 text-center">
          <div className="mb-4">
            <h1 className="display-1 text-muted">404</h1>
            <h2 className="mb-3">Page Not Found</h2>
            <p className="text-muted mb-4">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>

          <div className="d-flex gap-3 justify-content-center">
            <Link to="/" className="btn btn-dark">
              <i className="fas fa-home me-2"></i>
              Go Home
            </Link>
            <Link to="/books" className="btn btn-outline-btn btn-outline-dark">
              <i className="fas fa-book me-2"></i>
              Browse Books
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
