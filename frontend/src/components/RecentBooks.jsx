import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import apiClient from "../utils/apiClient";

function ShimmerCard() {
  return (
    <div className="col-md-4">
      <div className="card h-100 shadow-sm border-0">
        <div
          className="card-img-top shimmer"
          style={{
            height: "180px",
            borderTopLeftRadius: "0.5rem",
            borderTopRightRadius: "0.5rem",
          }}
        />
        <div className="card-body d-flex flex-column">
          <div
            className="shimmer mb-2"
            style={{ height: "1.5rem", width: "70%" }}
          />
          <div
            className="shimmer mb-2"
            style={{ height: "1rem", width: "50%" }}
          />
          <div
            className="shimmer mb-3"
            style={{ height: "1rem", width: "60%" }}
          />
          <div
            className="shimmer mt-auto"
            style={{ height: "2.5rem", width: "100%" }}
          />
        </div>
      </div>
    </div>
  );
}

function RecentBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get("/api/books?sort=recent&limit=3")
      .then((res) =>
        setBooks(Array.isArray(res.data.books) ? res.data.books : [])
      )
      .catch((err) => {
        setBooks([]);
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container my-5">
      <div className="d-flex align-items-center mb-4">
        <h2
          className="fw-bold mb-0"
          style={{ letterSpacing: "0.01em", fontSize: "2.1rem" }}
        >
          <span role="img" aria-label="books" style={{ marginRight: 10 }}>
            📚
          </span>
          Recent Books
        </h2>
        <div className="ms-auto">
          <Link to="/books" className="btn btn-outline-dark btn-sm fw-semibold">
            View All
          </Link>
        </div>
      </div>
      <div className="row g-4 justify-content-center">
        {loading ? (
          [1, 2, 3].map((i) => <ShimmerCard key={i} />)
        ) : books.length === 0 ? (
          <div className="col-12 text-center py-5">
            <p className="text-muted fs-5 mb-0">No recent books found.</p>
          </div>
        ) : (
          books.map((book) => (
            <div className="col-md-4" key={book._id}>
              <div className="card h-100 shadow border-0 rounded-4">
                <div
                  className="card-img-top"
                  style={{
                    height: "200px",
                    background: book.picture
                      ? `url(${
                          import.meta.env.VITE_API_URL + book.picture
                        }) center/cover no-repeat`
                      : `url(${
                          import.meta.env.VITE_API_URL + "/uploads/notfound.png"
                        }) center/60% no-repeat #f8f9fa`,
                    borderTopLeftRadius: "1rem",
                    borderTopRightRadius: "1rem",
                    borderBottom: "1px solid #eee",
                  }}
                />
                <div className="card-body d-flex flex-column px-4 py-3">
                  <h5
                    className="card-title text-truncate fw-bold mb-1"
                    title={book.title}
                    style={{ color: "#222", fontSize: "1.2rem" }}
                  >
                    {book.title}
                  </h5>
                  <p
                    className="card-subtitle mb-2 text-truncate"
                    title={
                      book.author &&
                      typeof book.author === "object" &&
                      book.author.firstName
                        ? `by ${book.author.firstName} ${
                            book.author.lastName || ""
                          }`
                        : "Unknown Author"
                    }
                    style={{ fontWeight: 500, color: "#555" }}
                  >
                    {book.author &&
                    typeof book.author === "object" &&
                    book.author.firstName
                      ? `by ${book.author.firstName} ${
                          book.author.lastName || ""
                        }`
                      : "Unknown Author"}
                  </p>
                  <p
                    className="text-muted mb-3"
                    style={{ fontSize: "0.98rem" }}
                  >
                    <span style={{ fontWeight: 500 }}>Published:</span>{" "}
                    {book.publishedDate
                      ? new Date(book.publishedDate).getFullYear()
                      : "N/A"}{" "}
                    year
                  </p>
                  <div className="mt-auto">
                    <Link
                      to={`/books/${book._id}`}
                      className="btn btn-dark w-100 fw-bold rounded-pill"
                    >
                      View Book
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      {/* Shimmer CSS */}
      <style>
        {`
          .shimmer {
            position: relative;
            overflow: hidden;
            background: #e0e0e0;
            border-radius: 0.5rem;
          }
          .shimmer::after {
            content: '';
            position: absolute;
            top: 0; left: 0; height: 100%; width: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
            transform: translateX(-100%);
            animation: shimmer 1.2s infinite;
          }
          @keyframes shimmer {
            100% {
              transform: translateX(100%);
            }
          }
          .card {
            transition: box-shadow 0.18s;
          }
          .card:hover {
            box-shadow: 0 6px 32px 0 rgba(60,60,60,0.13);
          }
        `}
      </style>
    </div>
  );
}

export default RecentBooks;
