import { useState, useEffect } from "react";
import apiClient from "../utils/apiClient";
import Loading from "../components/Loading";
import CategoryCard from "../components/CategoryCard";

function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    setLoading(true);
    apiClient
      .get(import.meta.env.VITE_API_URL + "/api/categories")
      .then((res) => {
        console.log("API categories response:", res.data); // <--- add this line
        setCategories(
          Array.isArray(res.data) ? res.data : res.data.categories || []
        );
        setLoading(false);
      })
      .catch((err) => {
        console.error("API categories error:", err);
        setCategories([]);
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

  // Helper to count books in a category
  const getBookCount = (category) =>
    isNaN(Number(category.bookCount)) ? 0 : Number(category.bookCount);

  return (
    <div className="container mt-4 bg-white">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-black">
          <span
            role="img"
            aria-label="Categories"
            style={{ marginRight: "0.5rem" }}
          >
            🗂️
          </span>
          Book Categories
        </h2>
      </div>

      {/* Categories Grid */}
      <div className="row">
        {categories.length === 0 ? (
          <div className="col-12 text-center py-5">
            <p className="text-muted fs-5 mb-0">No Categories found.</p>
          </div>
        ) : (
          categories.map((category) => (
            <CategoryCard
              key={category._id || category.id || category.name}
              category={category}
              bookCount={getBookCount(category)}
            />
          ))
        )}
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
                      (sum, cat) => sum + getBookCount(cat),
                      0
                    )}
                  </h3>
                  <p>Total Books</p>
                </div>
                <div className="col-md-3">
                  <h3 className="text-white">
                    {categories.length > 0
                      ? Math.max(...categories.map(getBookCount)).toString()
                      : "0"}
                  </h3>
                  <p>Largest Category</p>
                </div>
                <div className="col-md-3">
                  <h3 className="text-white">
                    {categories.length > 0
                      ? Math.round(
                          categories.reduce(
                            (sum, cat) => sum + getBookCount(cat),
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
