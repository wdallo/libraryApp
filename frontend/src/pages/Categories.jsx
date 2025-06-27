import { useState, useEffect } from "react";
import axios from "axios";
import Loading from "../components/Loading";
import CategoryCard from "../components/CategoryCard";

function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

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
        <h2 className="text-black">Book Categories</h2>
        {user && user.role === "admin" && (
          <button className="btn btn-dark d-none">
            <i className="fas fa-plus me-2"></i>Add New Category
          </button>
        )}
      </div>

      {/* Categories Grid */}
      <div className="row">
        {categories.map((category) => (
          <CategoryCard
            key={category._id || category.id || category.name}
            category={category}
          />
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
