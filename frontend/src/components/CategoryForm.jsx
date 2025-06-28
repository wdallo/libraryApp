import { useState } from "react";
import apiClient from "../utils/apiClient";
import { Link } from "react-router-dom";
import { faBackward } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function CategoryForm() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      // Get token from user object in localStorage/sessionStorage
      let user = localStorage.getItem("user") || sessionStorage.getItem("user");
      let token = "";
      if (user) {
        try {
          user = JSON.parse(user);
          token = user.token || "";
        } catch {}
      }

      console.log("CategoryForm - Submitting data:", formData);
      console.log("CategoryForm - Token:", token ? "Present" : "Missing");
      console.log(
        "CategoryForm - API URL:",
        import.meta.env.VITE_API_URL + "/api/categories"
      );

      const response = await apiClient.post("/api/categories", formData, {
        headers: {
          "Content-Type": "application/json",
          authorization: token ? `Bearer ${token}` : "",
        },
      });

      console.log("CategoryForm - Success response:", response.data);
      setSuccess("Category added successfully!");
      setFormData({ name: "", description: "" });
    } catch (err) {
      console.error("CategoryForm - Error:", err);
      console.error("CategoryForm - Error response:", err.response?.data);
      console.error("CategoryForm - Error status:", err.response?.status);
      setError(err.response?.data?.message || "Failed to add category.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0">Add New Category</h5>
              <Link to={-1} className="btn btn-dark">
                <FontAwesomeIcon icon={faBackward} /> Go Back
              </Link>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter category name"
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="description" className="form-label">
                    Description
                  </label>
                  <textarea
                    className="form-control"
                    id="description"
                    name="description"
                    rows="3"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Enter category description"
                  ></textarea>
                </div>
                {error && <div className="alert alert-danger">{error}</div>}
                {success && (
                  <div className="alert alert-success">{success}</div>
                )}
                <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? "Adding..." : "Add Category"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CategoryForm;
