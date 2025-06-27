import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

function Books() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios
      .get(import.meta.env.VITE_API_URL + "/api/books")
      .then((res) => {
        setBooks(res.data);
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
        <h2 className="text-black">Books Collection</h2>
        <Link to="/books/new" className="btn btn-dark">
          <i className="fas fa-plus me-2"></i>Add New Book
        </Link>
      </div>

      {/* Search and Filter */}
      <div className="row mb-4">
        <div className="col-md-8">
          <div className="input-group">
            <input
              type="text"
              className="form-control border-dark"
              placeholder="Search books by title or author..."
            />
            <button className="btn btn-outline-dark" type="button">
              <i className="fas fa-search"></i>
            </button>
          </div>
        </div>
        <div className="col-md-4">
          <select className="form-select border-dark">
            <option value="">All Categories</option>
            <option value="fiction">Fiction</option>
            <option value="non-fiction">Non-Fiction</option>
            <option value="mystery">Mystery</option>
            <option value="romance">Romance</option>
          </select>
        </div>
      </div>

      {/* Books Grid */}
      {books.length === 0 ? (
        <div className="text-center text-muted my-5">
          <h4>No books found.</h4>
        </div>
      ) : (
        <div className="row">
          {books.map((book) => (
            <div key={book.id} className="col-md-4 mb-4">
              <div className="card h-100 bg-dark text-white border-white border-2 shadow">
                <img
                  src={book.picture}
                  className="card-img-top"
                  alt={book.title}
                  style={{ height: "300px", objectFit: "cover" }}
                />
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{book.title}</h5>
                  <p className="card-text text-muted">by {book.author}</p>
                  <p className="card-text">
                    <small className="text-muted">
                      {book.category} • {book.publishedDate}
                    </small>
                  </p>
                  <p className="card-text flex-grow-1">{book.description}</p>
                  <div className="d-flex gap-2 mt-auto">
                    <button className="btn btn-outline-light btn-sm flex-fill">
                      View Details
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
      )}
      {/* Pagination */}
      <nav aria-label="Books pagination">
        <ul className="pagination justify-content-center">
          <li className="page-item disabled">
            <a
              className="page-link bg-dark text-white border-dark"
              href="#"
              tabIndex="-1"
            >
              Previous
            </a>
          </li>
          <li className="page-item active">
            <a className="page-link bg-dark text-white border-dark" href="#">
              1
            </a>
          </li>
          <li className="page-item">
            <a className="page-link bg-dark text-white border-dark" href="#">
              2
            </a>
          </li>
          <li className="page-item">
            <a className="page-link bg-dark text-white border-dark" href="#">
              3
            </a>
          </li>
          <li className="page-item">
            <a className="page-link bg-dark text-white border-dark" href="#">
              Next
            </a>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default Books;
