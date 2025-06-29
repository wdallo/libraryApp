import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import apiClient from "../utils/apiClient";
import Loading from "../components/Loading";

function AuthorBooks() {
  const { authorId } = useParams();
  const [author, setAuthor] = useState(null);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchAuthorAndBooks = async () => {
      setLoading(true);
      try {
        console.log("Fetching author with ID:", authorId);
        console.log("API URL:", import.meta.env.VITE_API_URL);

        // Fetch author details
        const authorResponse = await apiClient.get(`/api/authors/${authorId}`);
        console.log("Author response status:", authorResponse.status);
        console.log("Author response data:", authorResponse.data);

        // Handle different response structures
        const authorData = authorResponse.data.author || authorResponse.data;
        setAuthor(authorData);

        // Fetch books by this author (handle 404 as empty result, not error)
        try {
          console.log("Fetching books for author:", authorId);
          const booksResponse = await apiClient.get(
            `/api/books?author=${authorId}`
          );
          console.log("Books response status:", booksResponse.status);
          console.log("Books response data:", booksResponse.data);
          setBooks(
            Array.isArray(booksResponse.data)
              ? booksResponse.data
              : booksResponse.data.books || []
          );
        } catch (booksError) {
          console.log(
            "No books found for author (this is normal):",
            booksError.response?.status
          );
          // If 404, it means no books found, which is fine
          if (booksError.response?.status === 404) {
            setBooks([]);
          } else {
            console.error("Error fetching books:", booksError);
            setBooks([]);
          }
        }
      } catch (error) {
        console.error("Error fetching author:", error);
        console.error("Error status:", error.response?.status);
        console.error("Error details:", error.response?.data);
        console.error("Full error object:", error);
        setAuthor(null);
        setBooks([]);
      } finally {
        setLoading(false);
      }
    };

    if (authorId) {
      fetchAuthorAndBooks();
    }
  }, [authorId]);

  if (loading) {
    return <Loading />;
  }

  if (!author) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">
          <h4>Author Not Found</h4>
          <p>The author you're looking for doesn't exist.</p>
          <Link to="/authors" className="btn btn-primary">
            Back to Authors
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4 bg-white">
      {/* Author Header */}
      <div className="row mb-4">
        <div className="col-12">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <Link to="/authors" className="text-decoration-none">
                  Authors
                </Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                {author.firstName} {author.lastName}
              </li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-3 text-center">
          <img
            src={import.meta.env.VITE_API_URL + author.picture}
            alt={`${author.firstName} ${author.lastName}`}
            className="rounded-circle border border-3 border-dark mb-3"
            style={{
              width: "150px",
              height: "150px",
              objectFit: "cover",
            }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src =
                import.meta.env.VITE_API_URL + "/uploads/notfound.png";
            }}
          />
        </div>
        <div className="col-md-9">
          <h1 className="text-black mb-2">
            {author.firstName} {author.lastName}
          </h1>
          <p className="text-muted mb-2">
            <strong>Born:</strong>{" "}
            {author.birthday
              ? new Date(author.birthday).toLocaleDateString()
              : "Unknown"}
          </p>
          <p className="text-dark">{author.bio || "No biography available."}</p>
          <p className="text-muted">
            <strong>{books.length}</strong> book{books.length !== 1 ? "s" : ""}{" "}
            found
          </p>
        </div>
      </div>

      {/* Books List */}
      {books.length === 0 ? (
        <div className="text-center py-5">
          <i className="fas fa-book fa-3x text-muted mb-3"></i>
          <h4 className="text-muted">No Books Found</h4>
          <p className="text-muted">
            This author doesn't have any books in the library yet.
          </p>
        </div>
      ) : (
        <div className="row">
          {books.map((book) => {
            // Determine category info and link
            let categoryName = "Uncategorized";
            let categoryId = null;
            if (book.category) {
              if (Array.isArray(book.category) && book.category.length > 0) {
                categoryName = book.category[0]?.name || "Uncategorized";
                categoryId = book.category[0]?._id || book.category[0]?.id;
              } else if (typeof book.category === "object") {
                categoryName = book.category.name || "Uncategorized";
                categoryId = book.category._id || book.category.id;
              }
            }
            return (
              <div key={book._id || book.id} className="col-md-6 col-lg-4 mb-4">
                <div className="card h-100 bg-dark text-white border-white border-2 shadow">
                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title">{book.title}</h5>
                    <p className="card-text">
                      <small>
                        Published:{" "}
                        {book.publishedYear
                          ? book.publishedYear
                          : book.publishedDate
                          ? new Date(book.publishedDate).getFullYear()
                          : "Unknown Year"}{" "}
                        year
                      </small>
                    </p>

                    <p className="card-text">
                      {(book.description || "No description available.").slice(
                        0,
                        100
                      )}
                      {book.description && book.description.length > 100
                        ? "..."
                        : ""}
                    </p>
                    <div className="d-flex gap-2 justify-content-between align-items-center mt-auto">
                      <small>
                        <i className="fas fa-book me-1"></i>
                        {book.pages || 0} pages
                      </small>

                      {/* Genre/Category styled as a badge and clickable */}
                      {categoryId ? (
                        <Link
                          to={`/categories/${categoryId}/books`}
                          className="badge rounded-pill"
                          style={{
                            backgroundColor: "#ffc107",
                            color: "#212529",
                            fontWeight: "bold",
                            fontSize: "0.85rem",
                            padding: "0.5em 0.9em",
                            letterSpacing: "0.03em",
                            textDecoration: "none",
                          }}
                          title={`View category: ${categoryName}`}
                        >
                          {categoryName}
                        </Link>
                      ) : (
                        <span
                          className="badge rounded-pill"
                          style={{
                            backgroundColor: "#ffc107",
                            color: "#212529",
                            fontWeight: "bold",
                            fontSize: "0.85rem",
                            padding: "0.5em 0.9em",
                            letterSpacing: "0.03em",
                          }}
                        >
                          {categoryName}
                        </span>
                      )}

                      <div className="btn-group btn-group-sm">
                        <Link
                          to={`/books/${book._id || book.id}`}
                          className="btn btn-outline-light btn-sm"
                          title="View Book"
                        >
                          View Book
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default AuthorBooks;
