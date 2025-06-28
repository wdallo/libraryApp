import { Link } from "react-router-dom";

function AuthorCard({ author }) {
  if (!author) {
    return (
      <div className="col-md-6 col-lg-4 mb-4">
        <div
          className="card h-100 border-0 shadow-lg author-card d-flex align-items-center justify-content-center"
          style={{ minHeight: 300 }}
        >
          <div className="text-center w-100">
            <p className="text-muted">Author data not available.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4 bg-white">
      <div
        className="card h-100 border-0 shadow-lg author-card"
        style={{
          background: "rgba(34, 36, 40, 0.85)",
          color: "#fff",
          borderRadius: "1.25rem",
          boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(255,255,255,0.08)",
          fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif",
          transition: "transform 0.2s, box-shadow 0.2s",
          marginTop: "50px",
        }}
      >
        <div className="card-body text-center d-flex flex-column">
          <div
            className="author-img-wrapper mx-auto mb-3"
            style={{ marginTop: "-60px" }}
          >
            <img
              src={
                import.meta.env.VITE_API_URL +
                (author.picture || "/uploads/notfound.png")
              }
              alt={`${author.firstName || "Unknown"} ${author.lastName || ""}`}
              className="rounded-circle border border-3 border-white shadow author-img"
              style={{
                width: "110px",
                height: "110px",
                objectFit: "cover",
                boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
                background: "#222",
                transition:
                  "transform 0.3s cubic-bezier(.4,2,.6,1), box-shadow 0.3s",
              }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  import.meta.env.VITE_API_URL + "/uploads/notfound.png";
              }}
            />
          </div>
          <h5
            className="card-title mt-2"
            style={{
              fontWeight: 700,
              fontSize: "1.3rem",
              letterSpacing: "0.01em",
            }}
          >
            {(author.firstName || "Unknown") + " " + (author.lastName || "")}
          </h5>
          <p
            className="card-text mb-1"
            style={{ fontSize: "1rem", opacity: 0.85, fontWeight: 500 }}
          >
            Born:{" "}
            {author.birthday
              ? new Date(author.birthday).toLocaleDateString()
              : "Unknown"}
          </p>
          <p
            className="card-text mb-3"
            style={{ fontSize: "0.97rem", minHeight: 60, opacity: 0.92 }}
          >
            {(author.bio || "No biography available.").slice(0, 120)}
            {author.bio && author.bio.length > 120 ? "..." : ""}
          </p>
          <div className="d-flex gap-2 justify-content-center mt-auto">
            <Link
              to={`/authors/${author._id || author.id || ""}/books`}
              className="btn btn-primary btn-sm px-3 rounded-pill shadow-sm text-decoration-none"
            >
              View Books Author
            </Link>
          </div>
        </div>
      </div>
      <style>
        {`
                    .author-card:hover {
                        transform: translateY(-8px) scale(1.035);
                        box-shadow: 0 16px 48px rgba(0,0,0,0.32);
                    }
                    .author-card:hover .author-img {
                        transform: scale(1.08) rotate(-2deg);
                        box-shadow: 0 8px 32px rgba(0,0,0,0.35);
                    }
                `}
      </style>
    </div>
  );
}

export default AuthorCard;
