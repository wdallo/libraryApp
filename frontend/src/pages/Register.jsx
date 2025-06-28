import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import apiClient from "../utils/apiClient";

function Register() {
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showTerms, setShowTerms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem("user") || sessionStorage.getItem("user");
    if (user) {
      window.location.replace("/");
    }
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match!");
      return;
    }
    setLoading(true);
    try {
      const response = await apiClient.post("/api/users/register", formData);
      console.log("Registration success:", response.data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow">
            <div className="card-body p-5">
              <div className="text-center mb-4">
                <h3 className="card-title">Create Account</h3>
                <p className="text-muted">Join our library community</p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="userName" className="form-label">
                    Username
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="userName"
                    name="userName"
                    value={formData.userName}
                    onChange={handleChange}
                    required
                    placeholder="Choose a username"
                    autoComplete="username"
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="Enter your email"
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="Create a password"
                    autoComplete="new-password"
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="confirmPassword" className="form-label">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    placeholder="Confirm your password"
                    autoComplete="new-password"
                  />
                </div>

                <div className="mb-3 form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="agreeTerms"
                    required
                  />
                  <label className="form-check-label" htmlFor="agreeTerms">
                    I agree to the{" "}
                    <a
                      href="#"
                      className="text-decoration-none"
                      onClick={(e) => {
                        e.preventDefault();
                        setShowTerms(true);
                      }}
                    >
                      Terms of Service
                    </a>
                  </label>
                </div>

                {/* Terms of Service Modal */}
                {showTerms && (
                  <div
                    className="modal fade show d-block"
                    tabIndex="-1"
                    role="dialog"
                    style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                  >
                    <div
                      className="modal-dialog modal-dialog-centered modal-lg"
                      role="document"
                    >
                      <div className="modal-content">
                        <div className="modal-header bg-dark text-white">
                          <h5 className="modal-title">Terms of Service</h5>
                          <button
                            type="button"
                            className="btn-close btn-close-white"
                            aria-label="Close"
                            onClick={() => setShowTerms(false)}
                          ></button>
                        </div>
                        <div
                          className="modal-body"
                          style={{
                            maxHeight: "60vh",
                            overflowY: "auto",
                          }}
                        >
                          <h6>Welcome to Library Management!</h6>
                          <p>
                            By creating an account, you agree to the following
                            terms:
                          </p>
                          <ul>
                            <li>
                              You will use this service for lawful purposes
                              only.
                            </li>
                            <li>
                              You will not share your account credentials with
                              others.
                            </li>
                            <li>
                              All content you upload must comply with copyright
                              and community standards.
                            </li>
                            <li>
                              Your data may be used to improve the service, but
                              will not be sold to third parties.
                            </li>
                            <li>
                              Violation of these terms may result in account
                              suspension or removal.
                            </li>
                          </ul>
                          <p className="text-muted">
                            This is a demo Terms of Service. Please consult your
                            legal advisor for a real application.
                          </p>
                        </div>
                        <div className="modal-footer bg-light">
                          <button
                            type="button"
                            className="btn btn-dark"
                            onClick={() => setShowTerms(false)}
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="alert alert-danger text-center">{error}</div>
                )}
                {loading && (
                  <div
                    className="d-flex justify-content-center align-items-center min-vh-100 bg-white position-fixed top-0 start-0 w-100 h-100"
                    style={{ zIndex: 2000 }}
                  >
                    <div
                      className="spinner-border text-dark"
                      role="status"
                      style={{ width: 64, height: 64 }}
                    >
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                )}

                <div className="d-grid">
                  <button type="submit" className="btn btn-dark">
                    Create Account
                  </button>
                </div>
              </form>

              <hr className="my-4" />

              <div className="text-center">
                <p className="text-muted">
                  Already have an account?{" "}
                  <Link to="/login" className="text-decoration-none">
                    Sign in here
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
