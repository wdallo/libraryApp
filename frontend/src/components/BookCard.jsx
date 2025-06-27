import { Link } from "react-router-dom";

function BookCard({ book }) {
  return (
    <div className="book-outer mb-4">
      <div className="book-card book-card-hover bg-dark border-white border-2 shadow">
        <div className="book-image-wrap">
          <img
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: "0 0 12px 12px",
              boxShadow: "0 2px 12px 0 rgba(0,0,0,0.18)",
            }}
            src={import.meta.env.VITE_API_URL + book.picture}
            className="book-img"
            alt={book.title || "Book cover"}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src =
                import.meta.env.VITE_API_URL + "/uploads/notfound.png";
            }}
          />
        </div>
        <div className="book-info d-flex flex-column p-3">
          <h5 className="book-title text-white mb-1">
            {book.title || "Untitled"}
          </h5>
          <p className="book-author mb-1">
            <i className="fas fa-user me-1"></i>
            {book.author &&
            typeof book.author === "object" &&
            book.author.firstname
              ? `${book.author.firstname} ${book.author.lastname || ""}`
              : typeof book.author === "string"
              ? book.author
              : "Unknown Author"}
          </p>
          <p className="book-meta  mb-2">
            <i className="fas fa-tag me-1"></i>
            {book.category &&
            Array.isArray(book.category) &&
            book.category.length > 0
              ? book.category[0]?.name || "Uncategorized"
              : book.category?.name || "Uncategorized"}
            <span className="mx-2">•</span>
            <i className="fas fa-calendar me-1"></i>
            {book.publishedYear || book.publishedDate || "Unknown Year"}
          </p>
          <p
            className="book-desc text-light flex-grow-1 mb-2"
            style={{ minHeight: 48 }}
          >
            {(book.description || "No description available.").slice(0, 100)}
            {book.description && book.description.length > 100 ? "..." : ""}
          </p>
          <div className="d-flex gap-2 mt-auto">
            <Link
              to={`/books/${book._id || book.id}`}
              className="btn btn-outline-light btn-sm flex-fill fw-bold book-view-btn"
            >
              <i className="fas fa-eye me-1"></i> View Details
            </Link>
          </div>
        </div>
      </div>
      <style>{`
        .book-outer {
          display: flex;
          justify-content: center;
        }
        .book-card {
        color:#fff;
          width: 100%;
          max-width: 320px;
          min-height: 480px;
          border-radius: 16px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-shadow: 0 4px 24px 0 rgba(0,0,0,0.18);
          background: linear-gradient(135deg, #232526 0%, #414345 100%);
        }
        .book-card-hover:hover {
          box-shadow: 0 0 0 4px #fff, 0 8px 32px 0 rgba(0,0,0,0.22);
          transform: translateY(-4px) scale(1.03);
          transition: box-shadow 0.2s, transform 0.2s;
        }
        .book-image-wrap {
          width: 100%;
          height: 320px;
          background: #222;
          display: flex;
          align-items: center;
          justify-content: center;
          border-bottom: 1px solid #444;
        }
        .book-img {
          width: auto;
          height: 100%;
          max-width: 100%;
          object-fit: cover;
          border-radius: 0 0 12px 12px;
          box-shadow: 0 2px 12px 0 rgba(0,0,0,0.18);
        }
        .book-title {
          font-size: 1.2rem;
          font-weight: 700;
        }
        .book-author, .book-meta {
          font-size: 0.95rem;
        }
        .book-desc {
          font-size: 0.97rem;
        }
        .book-view-btn:hover {
          background: #fff !important;
          color: #111 !important;
          border-color: #111 !important;
        }
      `}</style>
    </div>
  );
}

export default BookCard;
