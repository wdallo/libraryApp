import { useState } from "react";
import apiClient from "../utils/apiClient";

function AuthorForm() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    birthday: "",
    bio: "",
  });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    if (e.target.type === "file") {
      setImage(e.target.files[0]);
    } else {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value);
      });
      if (image) {
        data.append("picture", image);
      }
      // Get token from user object in localStorage/sessionStorage
      let user = localStorage.getItem("user") || sessionStorage.getItem("user");
      let token = "";
      if (user) {
        try {
          user = JSON.parse(user);
          token = user.token || user.accessToken || user.jwt || "";
        } catch {}
      }
      await apiClient.post("/api/authors", data, {
        headers: {
          "Content-Type": "multipart/form-data",
          authorization: token ? `Bearer ${token}` : "",
        },
      });
      setSuccess("Author added successfully!");
      setFormData({ firstName: "", lastName: "", birthday: "", bio: "" });
      setImage(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add author.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">Add New Author</h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="firstName" className="form-label">
                      First Name *
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      placeholder="Enter first name"
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="lastName" className="form-label">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      placeholder="Enter last name"
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <label htmlFor="birthday" className="form-label">
                    Birthday
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    id="birthday"
                    name="birthday"
                    value={formData.birthday}
                    onChange={handleChange}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="bio" className="form-label">
                    Bio
                  </label>
                  <textarea
                    className="form-control"
                    id="bio"
                    name="bio"
                    rows="3"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Enter author bio"
                  ></textarea>
                </div>
                <div className="mb-3">
                  <label htmlFor="picture" className="form-label">
                    Author Image
                  </label>
                  <input
                    type="file"
                    className="form-control"
                    id="picture"
                    name="picture"
                    accept="image/*"
                    onChange={handleChange}
                  />
                  <div className="form-text">
                    Upload an image for the author (optional)
                  </div>
                  {image && (
                    <div className="mt-2">
                      <img
                        src={URL.createObjectURL(image)}
                        alt="Preview"
                        style={{
                          maxWidth: 120,
                          maxHeight: 160,
                          borderRadius: 8,
                          border: "1px solid #ccc",
                        }}
                      />
                    </div>
                  )}
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
                    {loading ? "Adding..." : "Add Author"}
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

export default AuthorForm;
