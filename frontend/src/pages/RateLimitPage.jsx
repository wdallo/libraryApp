import { Link } from "react-router-dom";

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
                <i className="fas fa-exclamation-triangle me-2"></i>
                Rate Limit Exceeded
              </h4>
            </div>
            <div className="card-body text-center">
              <div className="mb-4">
                <i className="fas fa-clock fa-4x text-warning mb-3"></i>
                <h5>Too Many Requests</h5>
                <p className="text-muted">
                  You have made too many requests in a short period of time.
                  Please wait a moment before trying again.
                </p>
              </div>

              <div className="alert alert-info">
                <i className="fas fa-info-circle me-2"></i>
                <strong>Rate Limit:</strong> 10000 requests per 15 minutes
              </div>

              <div className="mb-4">
                <p className="mb-3">
                  <strong>What can you do?</strong>
                </p>
                <ul className="list-unstyled text-start">
                  <li className="mb-2">
                    <i className="fas fa-clock text-primary me-2"></i>
                    Wait for 15 minutes before making more requests
                  </li>
                  <li className="mb-2">
                    <i className="fas fa-mouse-pointer text-primary me-2"></i>
                    Reduce the frequency of your clicks and actions
                  </li>
                  <li className="mb-2">
                    <i className="fas fa-refresh text-primary me-2"></i>
                    Try refreshing the page in a few minutes
                  </li>
                </ul>
              </div>

              <div className="d-grid gap-2 d-md-block">
                <button
                  onClick={handleRefresh}
                  className="btn btn-primary me-2"
                >
                  <i className="fas fa-refresh me-2"></i>
                  Try Again
                </button>
                <Link to="/" className="btn btn-outline-secondary">
                  <i className="fas fa-home me-2"></i>
                  Return to Home
                </Link>
              </div>

              <hr className="my-4" />

              <div className="text-muted">
                <small>
                  <i className="fas fa-shield-alt me-1"></i>
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
