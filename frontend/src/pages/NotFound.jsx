import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faBook } from "@fortawesome/free-solid-svg-icons";

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
              <FontAwesomeIcon icon={faHome} className="me-2" />
              Go Home
            </Link>
            <Link to="/books" className="btn btn-outline-btn btn-outline-dark">
              <FontAwesomeIcon icon={faBook} className="me-2" />
              Browse Books
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
