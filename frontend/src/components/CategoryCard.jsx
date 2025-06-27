import { Link } from "react-router-dom";

function CategoryCard({ category }) {
  return (
    <div className="col-md-6 col-lg-4 mb-4">
      <div className="card h-100 bg-dark text-white border-white border-2 shadow">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-start mb-3">
            <h5 className="card-title text-white">
              {category?.name || "Unnamed Category"}
            </h5>
            <span className="badge bg-white text-dark border border-dark">
              {category?.bookCount ?? 0} books
            </span>
          </div>
          <p className="card-text">
            {category?.description || "No description available."}
          </p>
          <div className="d-flex gap-2 mt-auto">
            <Link
              to={`/categories/${category._id || category.id}/books`}
              className="btn btn-outline-light btn-sm text-decoration-none"
            >
              View Books
            </Link>
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
  );
}

export default CategoryCard;
