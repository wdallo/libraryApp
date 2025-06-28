import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import apiClient from "../utils/apiClient";
import Loading from "../components/Loading";

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
            <div className="me-3">
              <i className="fas fa-layer-group fa-3x text-dark"></i>
            </div>
            <div>
              <h1 className="text-black mb-2">
                {String(category.name || "Unknown Category").toUpperCase()}
              </h1>
              <p className="text-dark mb-1">
                {String(category.description || "No description available.")}
              </p>
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
          <i className="fas fa-book fa-3x text-muted mb-3"></i>
          <h4 className="text-muted">No Books Found</h4>
          <p className="text-muted">
            This category doesn't have any books yet.
          </p>
        </div>
      ) : (
        <div className="row">
          {books
            .map((book) => {
              // Ensure book object is valid
              if (!book || typeof book !== "object") {
                return null;
              }

              return (
                <div
                  key={book._id || book.id || Math.random()}
                  className="col-md-6 col-lg-4 mb-4"
                >
                  <div className="card h-100 bg-dark text-white border-white border-2 shadow">
                    <div className="card-body">
                      <h5 className="card-title">
                        {String(book.title || "Untitled")}
                      </h5>
                      <p className="card-text">
                        <small>
                          <i className="fas fa-user me-2"></i>
                          {book.author && typeof book.author === "object"
                            ? (() => {
                                // Handle both firstName/lastName and firstname/lastname
                                const firstName =
                                  book.author.firstName ||
                                  book.author.firstname ||
                                  "";
                                const lastName =
                                  book.author.lastName ||
                                  book.author.lastname ||
                                  "";
                                const fullName = book.author.name || "";

                                if (firstName && lastName) {
                                  return `${String(firstName)} ${String(
                                    lastName
                                  )}`;
                                } else if (firstName) {
                                  return String(firstName);
                                } else if (lastName) {
                                  return String(lastName);
                                } else if (fullName) {
                                  return String(fullName);
                                } else {
                                  return "Unknown Author";
                                }
                              })()
                            : typeof book.author === "string"
                            ? String(book.author)
                            : "Unknown Author"}
                        </small>
                      </p>
                      <p className="card-text ">
                        <small>
                          <i className="fas fa-calendar me-2"></i>
                          {book.publishedDate
                            ? new Date(book.publishedDate).getFullYear()
                            : book.publishedYear
                            ? String(book.publishedYear)
                            : "Unknown Year"}
                        </small>
                      </p>
                      <p className="card-text">
                        {String(
                          book.description || "No description available."
                        ).slice(0, 100)}
                        {book.description &&
                        String(book.description).length > 100
                          ? "..."
                          : ""}
                      </p>
                      <div className="d-flex gap-2 justify-content-between mt-auto">
                        <small className="text-muted">
                          <i className="fas fa-book me-1"></i>
                          {String(book.pages || 0)} pages
                        </small>
                        <div className="btn-group btn-group-sm">
                          <Link
                            to={`/books/${book._id || book.id}`}
                            className="btn btn-outline-light btn-sm"
                          >
                            <i className="fas fa-eye"></i>
                          </Link>
                          <button className="btn btn-outline-light btn-sm">
                            <i className="fas fa-edit"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
            .filter(Boolean)}
        </div>
      )}
    </div>
  );
}

export default CategoryBooks;
