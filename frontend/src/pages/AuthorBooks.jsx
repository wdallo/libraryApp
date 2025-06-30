import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import apiClient from "../utils/apiClient";
import Loading from "../components/Loading";
import BookCard from "../components/BookCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBook } from "@fortawesome/free-solid-svg-icons";

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
          <FontAwesomeIcon icon={faBook} className="fa-3x text-muted mb-3" />
          <h4 className="text-muted">No Books Found</h4>
          <p className="text-muted">
            This author doesn't have any books in the library yet.
          </p>
        </div>
      ) : (
        <div className="books-grid">
          {books
            .filter((book) => book && typeof book === "object")
            .map((book) => (
              <BookCard
                key={book._id || book.id || Math.random()}
                book={book}
              />
            ))}
        </div>
      )}
    </div>
  );
}

export default AuthorBooks;
