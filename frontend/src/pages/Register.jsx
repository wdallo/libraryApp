import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import apiClient from "../utils/apiClient";
import Modal from "../components/Modal";
import useFormValidation from "../hooks/useFormValidation.jsx";
import { ValidatedInput } from "../components/ValidationComponents.jsx";
import { getValidationErrorsArray } from "../utils/validation";

function Register() {
  const [showTerms, setShowTerms] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Form validation setup
  const formValidation = useFormValidation(
    {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    "userRegistration"
  );

  useEffect(() => {
    const user = localStorage.getItem("user") || sessionStorage.getItem("user");
    if (user) {
      window.location.replace("/");
    }
  }, []);

  const handleSubmit = formValidation.handleSubmit(async (values) => {
    setError("");

    // Debug logging
    console.log("Frontend - Form values:", values);
    console.log("Frontend - Form validation state:", {
      isValid: formValidation.isValid,
      errors: formValidation.errors,
      touched: formValidation.touched,
    });

    // Check password confirmation
    if (values.password !== values.confirmPassword) {
      setError("Passwords don't match!");
      return;
    }

    setLoading(true);
    try {
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...registrationData } = values;
      console.log("Frontend - Sending data to API:", registrationData);

      const response = await apiClient.post(
        "/api/users/register",
        registrationData
      );
      setError("");
      setShowSuccess(true);
      console.log("Registration success:", response.data);
    } catch (err) {
      console.error("Registration error:", err);
      console.error("Error response:", err.response?.data);

      // Handle validation errors from backend
      if (err.response?.data?.errors) {
        const backendErrors = getValidationErrorsArray(
          err.response.data.errors
        );
        setError(backendErrors.join(", "));
      } else {
        setError(
          err.response?.data?.message ||
            "Registration failed. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  });

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className={`card shadow ${showSuccess ? "d-none" : ""}`}>
            <div className="card-body p-5">
              <div className="text-center mb-4">
                <h3 className="card-title">Create Account</h3>
                <p className="text-muted">Join our library community</p>
              </div>
              {error && (
                <div className="alert alert-danger text-center">{error}</div>
              )}
              <form onSubmit={handleSubmit}>
                <ValidatedInput
                  label="First Name"
                  fieldName="firstName"
                  type="text"
                  placeholder="Enter your first name"
                  required={true}
                  formValidation={formValidation}
                  autoComplete="given-name"
                />

                <ValidatedInput
                  label="Last Name"
                  fieldName="lastName"
                  type="text"
                  placeholder="Enter your last name"
                  required={true}
                  formValidation={formValidation}
                  autoComplete="family-name"
                />

                <ValidatedInput
                  label="Email Address"
                  fieldName="email"
                  type="email"
                  placeholder="Enter your email"
                  required={true}
                  formValidation={formValidation}
                  autoComplete="email"
                />

                <ValidatedInput
                  label="Password"
                  fieldName="password"
                  type="password"
                  placeholder="Create a password"
                  required={true}
                  formValidation={formValidation}
                  autoComplete="new-password"
                />

                <div className="mb-3">
                  <label htmlFor="confirmPassword" className="form-label">
                    Confirm Password <span className="text-danger">*</span>
                  </label>
                  <input
                    type="password"
                    className={`form-control ${
                      formValidation.values.confirmPassword &&
                      formValidation.values.password !==
                        formValidation.values.confirmPassword
                        ? "is-invalid"
                        : ""
                    }`}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formValidation.values.confirmPassword}
                    onChange={formValidation.handleChange}
                    onBlur={formValidation.handleBlur}
                    required
                    placeholder="Confirm your password"
                    autoComplete="new-password"
                  />
                  {formValidation.values.confirmPassword &&
                    formValidation.values.password !==
                      formValidation.values.confirmPassword && (
                      <div className="invalid-feedback">
                        Passwords don't match
                      </div>
                    )}
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

      {/* Success Modal */}
      <Modal
        show={showSuccess}
        onHide={() => {
          setShowSuccess(false);
          window.location.replace("/login");
        }}
        title="Registration Successful!"
        type="alert"
      >
        <div className="text-center">
          <div className="mb-3">
            <i
              className="fas fa-check-circle text-success"
              style={{ fontSize: "3rem" }}
            ></i>
          </div>
          <p className="mb-0">
            Your account has been created successfully! You can now log in with
            your credentials.
          </p>
        </div>
      </Modal>
    </div>
  );
}

export default Register;
