import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLayerGroup } from "@fortawesome/free-solid-svg-icons";

function CategoryCard({ category, bookCount }) {
  // Safety check for category object
  if (!category || typeof category !== "object") {
    return (
      <div className="col-md-6 col-lg-4 mb-4">
        <div className="card h-100 bg-dark text-white border-white border-2 shadow-sm">
          <div className="card-body d-flex align-items-center justify-content-center">
            <p className="text-muted text-center">
              Category data not available
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="col-md-6 col-lg-4 mb-4">
      <div className="card h-100 bg-dark text-white border-white border-2 shadow-sm category-card-hover">
        <div className="card-body d-flex flex-column">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="d-flex align-items-center gap-2">
              <span
                className="bg-white text-dark rounded-circle d-flex align-items-center justify-content-center me-2"
                style={{ width: 38, height: 38 }}
              >
                <FontAwesomeIcon icon={faLayerGroup} size="lg" />
              </span>
              <h5 className="card-title text-white mb-0">
                {String(category?.name || "Unnamed Category")}
              </h5>
            </div>
            <span className="badge bg-gradient bg-light text-dark border border-dark px-3 py-2 fs-6 shadow-sm">
              <i className="fas fa-book me-1 text-primary"></i>
              {typeof (bookCount ?? category?.bookCount) === "number"
                ? bookCount ?? category?.bookCount ?? 0
                : 0}{" "}
              book
              {(typeof (bookCount ?? category?.bookCount) === "number"
                ? bookCount ?? category?.bookCount ?? 0
                : 0) === 1
                ? ""
                : "s"}
            </span>
          </div>
          <p className="card-text text-light mb-4" style={{ minHeight: 48 }}>
            {category?.description
              ? String(category.description).length > 120
                ? String(category.description).slice(0, 120) + "…"
                : String(category.description)
              : "No description available."}
          </p>
          <div className="d-flex gap-2 mt-auto">
            <Link
              to={`/categories/${
                category?._id || category?.id || "unknown"
              }/books`}
              className="btn btn-outline-light btn-sm text-decoration-none flex-fill fw-bold category-view-btn"
            >
              <i className="fas fa-eye me-1"></i> View Books
            </Link>
          </div>
        </div>
      </div>
      <style>{`
        .category-card-hover:hover {
          box-shadow: 0 0 0 4px #fff, 0 4px 24px 0 rgba(0,0,0,0.18);
          transform: translateY(-2px) scale(1.02);
          transition: box-shadow 0.2s, transform 0.2s;
        }
        .category-view-btn:hover {
          background: #fff !important;
          color: #111 !important;
          border-color: #111 !important;
        }
      `}</style>
    </div>
  );
}

export default CategoryCard;
