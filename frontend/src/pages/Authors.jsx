import { useState, useEffect } from "react";
import apiClient from "../utils/apiClient";
import Loading from "../components/Loading";
import AuthorCard from "../components/AuthorCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

function Authors() {
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    setLoading(true);
    apiClient
      .get(import.meta.env.VITE_API_URL + "/api/authors")
      .then((res) => {
        console.log("Authors API response:", res.data);
        // Support both array and { authors: [...] }
        if (Array.isArray(res.data)) {
          setAuthors(res.data);
        } else if (res.data && Array.isArray(res.data.authors)) {
          setAuthors(res.data.authors);
        } else {
          setAuthors([]);
        }
        setLoading(false);
      })
      .catch(() => {
        setAuthors([]);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const storedUser =
      localStorage.getItem("user") || sessionStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      setUser(null);
    }
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="container mt-4 bg-white">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-black">
          <span role="img" aria-label="author">
            🧑‍💼
          </span>{" "}
          Authors
        </h2>
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
              <FontAwesomeIcon icon={faMagnifyingGlass} />
            </button>
          </div>
        </div>
      </div>
      {/* Authors List */}
      <div className="row">
        {authors.length === 0 ? (
          <div className="col-12 text-center py-5">
            <p className="text-muted fs-5 mb-0">No Authors found.</p>
          </div>
        ) : (
          authors.map((author) => (
            <div
              className="col-md-4 mb-4"
              key={author.id || `${author.firstName}-${author.lastName}`}
            >
              <AuthorCard author={author} />
            </div>
          ))
        )}
      </div>

      <div className="text-center mt-4">
        <p className="text-muted">Showing {authors.length} authors</p>
      </div>
    </div>
  );
}

export default Authors;
