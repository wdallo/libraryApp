import { useState, useEffect } from "react";
import axios from "axios";

function Authors() {
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios
      .get(import.meta.env.VITE_API_URL + "/api/authors")
      .then((res) => {
        setAuthors(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 vw-100 bg-white">
        <div className="text-center">
          <div className="spinner-border text-dark" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4 bg-white">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-black">Authors</h2>
        <button className="btn btn-dark">
          <i className="fas fa-plus me-2"></i>Add New Author
        </button>
      </div>

      {/* Search */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="input-group">
            <input
              type="text"
              className="form-control border-dark"
              placeholder="Search authors by name..."
            />
            <button className="btn btn-outline-dark" type="button">
              <i className="fas fa-search"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Authors List */}
      <div className="row">
        {authors.map((author) => (
          <div key={author.id} className="col-md-6 col-lg-4 mb-4">
            <div className="card h-100 bg-dark text-white border-white border-2 shadow">
              <div className="card-body text-center">
                <img
                  src={author.picture}
                  alt={`${author.firstname} ${author.lastname}`}
                  className="rounded-circle mb-3 border border-white"
                  style={{
                    width: "100px",
                    height: "100px",
                    objectFit: "cover",
                  }}
                />
                <h5 className="card-title">
                  {author.firstname} {author.lastname}
                </h5>
                <p className="card-text text-muted">
                  Born: {new Date(author.birthday).toLocaleDateString()}
                </p>
                <p className="card-text text-muted">{author.bio}</p>
                <div className="d-flex gap-2 justify-content-center mt-auto">
                  <button className="btn btn-outline-light btn-sm">
                    View Books
                  </button>
                  <button className="btn btn-outline-light btn-sm">
                    <i className="fas fa-edit"></i>
                  </button>
                  <button className="btn btn-outline-light btn-sm">
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add more authors message */}
      <div className="text-center mt-4">
        <p className="text-muted">Showing {authors.length} authors</p>
      </div>
    </div>
  );
}

export default Authors;
