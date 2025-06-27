import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

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
    axios
      .get(import.meta.env.VITE_API_URL + "/api/books?sort=recent&limit=3")
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
    <div className="container my-4">
      <h2 className="mb-4 fw-bold" style={{ letterSpacing: "0.01em" }}>
        Recent Books
      </h2>
      <div className="row g-4 justify-content-center">
        {loading
          ? [1, 2, 3].map((i) => <ShimmerCard key={i} />)
          : books.map((book) => (
              <div className="col-md-4" key={book._id}>
                <div className="card h-100 shadow-sm border-0">
                  <div
                    className="card-img-top"
                    style={{
                      height: "180px",
                      background: book.picture
                        ? `url(${
                            import.meta.env.VITE_API_URL + book.picture
                          }) center/cover no-repeat`
                        : `url(${
                            import.meta.env.VITE_API_URL +
                            "/uploads/notfound.png"
                          }) center/cover no-repeat`,
                      borderTopLeftRadius: "0.5rem",
                      borderTopRightRadius: "0.5rem",
                    }}
                  />
                  <div className="card-body d-flex flex-column">
                    <h5
                      className="card-title text-truncate fw-bold"
                      title={book.title}
                      style={{ color: "#222" }}
                    >
                      {book.title}
                    </h5>
                    <p
                      className="card-subtitle mb-2 text-truncate"
                      title={
                        book.author &&
                        typeof book.author === "object" &&
                        book.author.firstname
                          ? `by ${book.author.firstname} ${
                              book.author.lastname || ""
                            }`
                          : "Unknown Author"
                      }
                      style={{ fontWeight: 600 }}
                    >
                      {book.author &&
                      typeof book.author === "object" &&
                      book.author.firstname
                        ? `by ${book.author.firstname} ${
                            book.author.lastname || ""
                          }`
                        : "Unknown Author"}
                    </p>
                    <p className="text-muted mb-3" style={{ fontSize: "1rem" }}>
                      Publication date:{" "}
                      {book.releaseYear &&
                        new Date(book.releaseYear).getFullYear()}
                    </p>
                    <div className="mt-auto">
                      <Link
                        to={`/books/${book._id}`}
                        className="btn btn-dark w-100 fw-bold"
                      >
                        View Book
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
      </div>
      {/* Shimmer CSS */}
      <style>
        {`
                    .shimmer {
                        position: relative;
                        overflow: hidden;
                        background: #e0e0e0;
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
                `}
      </style>
    </div>
  );
}

export default RecentBooks;
