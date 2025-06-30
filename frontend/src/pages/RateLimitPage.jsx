import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExclamationTriangle,
  faClock,
  faInfoCircle,
  faMousePointer,
  faRefresh,
  faHome,
  faShieldAlt,
} from "@fortawesome/free-solid-svg-icons";

function RateLimitPage() {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card border-warning">
            <div className="card-header bg-warning text-dark">
              <h4 className="mb-0">
                <FontAwesomeIcon
                  icon={faExclamationTriangle}
                  className="me-2"
                />
                Rate Limit Exceeded
              </h4>
            </div>
            <div className="card-body text-center">
              <div className="mb-4">
                <FontAwesomeIcon
                  icon={faClock}
                  size="4x"
                  className="text-warning mb-3"
                />
                <h5>Too Many Requests</h5>
                <p className="text-muted">
                  You have made too many requests in a short period of time.
                  Please wait a moment before trying again.
                </p>
              </div>

              <div className="alert alert-info">
                <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                <strong>Rate Limit:</strong> 10000 requests per 15 minutes
              </div>

              <div className="mb-4">
                <p className="mb-3">
                  <strong>What can you do?</strong>
                </p>
                <ul className="list-unstyled text-start">
                  <li className="mb-2">
                    <FontAwesomeIcon
                      icon={faClock}
                      className="text-primary me-2"
                    />
                    Wait for 15 minutes before making more requests
                  </li>
                  <li className="mb-2">
                    <FontAwesomeIcon
                      icon={faMousePointer}
                      className="text-primary me-2"
                    />
                    Reduce the frequency of your clicks and actions
                  </li>
                  <li className="mb-2">
                    <FontAwesomeIcon
                      icon={faRefresh}
                      className="text-primary me-2"
                    />
                    Try refreshing the page in a few minutes
                  </li>
                </ul>
              </div>

              <div className="d-grid gap-2 d-md-block">
                <button
                  onClick={handleRefresh}
                  className="btn btn-primary me-2"
                >
                  <FontAwesomeIcon icon={faRefresh} className="me-2" />
                  Try Again
                </button>
                <Link to="/" className="btn btn-outline-secondary">
                  <FontAwesomeIcon icon={faHome} className="me-2" />
                  Return to Home
                </Link>
              </div>

              <hr className="my-4" />

              <div className="text-muted">
                <small>
                  <FontAwesomeIcon icon={faShieldAlt} className="me-1" />
                  This limit helps protect our servers and ensures fair usage
                  for all users.
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RateLimitPage;
