import { useState, useEffect } from "react";
import axios from "axios";
import Loading from "../components/Loading";
import AuthorCard from "../components/AuthorCard";

function Authors() {
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    setLoading(true);
    axios
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
        <h2 className="text-black">Authors</h2>
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
        <div className="mb-5"></div>

        {authors.map((author) => (
          <AuthorCard
            key={author.id || `${author.firstname}-${author.lastname}`}
            author={author}
          />
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
