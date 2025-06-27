import { useState, useEffect } from "react";
import axios from "axios";

function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios
      .get(import.meta.env.VITE_API_URL + "/api/categories")
      .then((res) => {
        setCategories(res.data);
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
        <h2 className="text-black">Book Categories</h2>
        <button className="btn btn-dark">
          <i className="fas fa-plus me-2"></i>Add New Category
        </button>
      </div>

      {/* Categories Grid */}
      <div className="row">
        {categories.map((category) => (
          <div key={category.id} className="col-md-6 col-lg-4 mb-4">
            <div className="card h-100 bg-dark text-white border-white border-2 shadow">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <h5 className="card-title text-white">{category.name}</h5>
                  <span className="badge bg-white text-dark border border-dark">
                    {category.bookCount} books
                  </span>
                </div>
                <p className="card-text">{category.description}</p>
                <div className="d-flex gap-2 mt-auto">
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

      {/* Category Stats */}
      <div className="row mt-5">
        <div className="col-12">
          <div className="card bg-dark text-white border-white border-2">
            <div className="card-body">
              <h5 className="card-title">Category Statistics</h5>
              <div className="row text-center">
                <div className="col-md-3">
                  <h3 className="text-white">{categories.length}</h3>
                  <p>Total Categories</p>
                </div>
                <div className="col-md-3">
                  <h3 className="text-white">
                    {categories.reduce(
                      (sum, cat) => sum + (Number(cat.bookCount) || 0),
                      0
                    )}
                  </h3>
                  <p>Total Books</p>
                </div>
                <div className="col-md-3">
                  <h3 className="text-white">
                    {categories.length > 0
                      ? Math.max(
                          ...categories.map((cat) => Number(cat.bookCount) || 0)
                        ).toString()
                      : "0"}
                  </h3>
                  <p>Largest Category</p>
                </div>
                <div className="col-md-3">
                  <h3 className="text-white">
                    {categories.length > 0
                      ? Math.round(
                          categories.reduce(
                            (sum, cat) => sum + (Number(cat.bookCount) || 0),
                            0
                          ) / categories.length
                        ).toString()
                      : "0"}
                  </h3>
                  <p>Average Books</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Categories;
