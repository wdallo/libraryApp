import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import apiClient from "../utils/apiClient";
import {
  useFormValidation,
  ValidatedInput,
} from "../hooks/useFormValidation.jsx";
import { getValidationErrorsArray } from "../utils/validation";

function Login() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  // Form validation setup
  const formValidation = useFormValidation(
    {
      email: "",
      password: "",
    },
    "userLogin"
  );

  useEffect(() => {
    const user = localStorage.getItem("user") || sessionStorage.getItem("user");
    if (user) {
      navigate("/");
    }
  }, [navigate]);

  const handleRememberMeChange = (e) => {
    setRememberMe(e.target.checked);
  };

  const handleSubmit = formValidation.handleSubmit(async (values) => {
    setError("");
    setLoading(true);

    // Debug logging
    console.log("Frontend Login - Form values:", values);
    console.log("Frontend Login - Form validation state:", {
      isValid: formValidation.isValid,
      errors: formValidation.errors,
      touched: formValidation.touched,
    });

    try {
      console.log("Frontend Login - Sending data to API:", values);
      const response = await apiClient.post("/api/users/login", values);
      const userData = response.data;
      console.log("Login success:", userData);

      if (rememberMe) {
        localStorage.setItem("user", JSON.stringify(userData));
      } else {
        sessionStorage.setItem("user", JSON.stringify(userData));
      }
      navigate("/");
    } catch (err) {
      console.error("Login error:", err);
      console.error("Login error response:", err.response?.data);

      setError(
        err.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  });

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-4">
          <div className="card shadow">
            <div className="card-body p-5">
              <div className="text-center mb-4">
                <h3 className="card-title">Login</h3>
                <p className="text-muted">Sign in to your account</p>
              </div>
              {error && (
                <div className="alert alert-danger text-center">{error}</div>
              )}
              <form onSubmit={handleSubmit}>
                <ValidatedInput
                  label="Email Address"
                  fieldName="email"
                  type="email"
                  placeholder="Enter your email"
                  required={true}
                  formValidation={formValidation}
                />

                <ValidatedInput
                  label="Password"
                  fieldName="password"
                  type="password"
                  placeholder="Enter your password"
                  required={true}
                  formValidation={formValidation}
                />

                <div className="mb-3 form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="rememberMe"
                    name="rememberMe"
                    checked={rememberMe}
                    onChange={handleRememberMeChange}
                  />
                  <label className="form-check-label" htmlFor="rememberMe">
                    Remember me
                  </label>
                </div>

                <div className="d-grid">
                  <button
                    type="submit"
                    className="btn btn-dark"
                    disabled={loading || formValidation.isSubmitting}
                  >
                    {loading || formValidation.isSubmitting
                      ? "Signing In..."
                      : "Sign In"}
                  </button>
                </div>
              </form>

              <div className="text-center mt-3">
                <a href="#" className="text-decoration-none">
                  Forgot your password?
                </a>
              </div>

              <hr className="my-4" />

              <div className="text-center">
                <p className="text-muted">
                  Don't have an account?{" "}
                  <Link to="/register" className="text-decoration-none">
                    Sign up here
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

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
    </div>
  );
}

export default Login;
