import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import apiClient from "../utils/apiClient";
import Loading from "../components/Loading";
import Card from "../components/Card";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLayerGroup, faBook } from "@fortawesome/free-solid-svg-icons";

function CategoryBooks() {
  const { categoryId } = useParams();
  const [category, setCategory] = useState(null);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryAndBooks = async () => {
      setLoading(true);
      try {
        console.log("Fetching category with ID:", categoryId);

        // Fetch category details (includes books)
        const categoryResponse = await apiClient.get(
          `/api/categories/${categoryId}`
        );
        console.log("Category response:", categoryResponse.data);

        const categoryData =
          categoryResponse.data.category || categoryResponse.data;
        setCategory(categoryData);

        // Use books from the category response
        setBooks(categoryData.books || []);
      } catch (error) {
        console.error("Error fetching category:", error);
        setCategory(null);
        setBooks([]);
      } finally {
        setLoading(false);
      }
    };

    if (categoryId) {
      fetchCategoryAndBooks();
    }
  }, [categoryId]);

  if (loading) {
    return <Loading />;
  }

  if (!category) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">
          <h4>Category Not Found</h4>
          <p>The category you're looking for doesn't exist.</p>
          <Link to="/categories" className="btn btn-primary">
            Back to Categories
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4 bg-white">
      {/* Category Header */}
      <div className="row mb-4">
        <div className="col-12">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <Link to="/categories" className="text-decoration-none">
                  Categories
                </Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                {String(category.name || "Unknown Category").toUpperCase()}
              </li>
            </ol>
          </nav>
        </div>
      </div>
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex align-items-center mb-3">
            <div className="me-3"></div>
            <div>
              <h1 className="text-black mb-2">
                {String(category.name || "Unknown Category").toUpperCase()}
              </h1>
              <p className="text-dark mb-1">
                {String(category.description || "No description available.")}
              </p>
              <br />
              <p>
                <strong>{books.length}</strong> book
                {books.length !== 1 ? "s" : ""} found
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Books List */}
      {books.length === 0 ? (
        <div className="text-center py-5">
          <FontAwesomeIcon icon={faBook} className="fa-3x text-muted mb-3" />
          <h4 className="text-muted">No Books Found</h4>
          <p className="text-muted">
            This category doesn't have any books yet.
          </p>
        </div>
      ) : (
        <div className="books-grid">
          {books
            .filter((book) => book && typeof book === "object")
            .map((book) => (
              <Card key={book._id || book.id || Math.random()} book={book} />
            ))}
        </div>
      )}
    </div>
  );
}

export default CategoryBooks;
