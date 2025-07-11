import { Link } from "react-router-dom";
import RecentBooks from "../components/RecentBooks";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBook,
  faLayerGroup,
  faUser,
} from "@fortawesome/free-solid-svg-icons";

function Home() {
  return (
    <div className="container mt-4 bg-white">
      {/* Hero Section */}
      <div className="jumbotron bg-dark text-white p-5 rounded mb-4 border border-white shadow">
        <h1 className="display-4">Welcome to Library Management System</h1>
        <p className="lead">
          Manage your books, authors, and categories efficiently with our modern
          library system.
        </p>
        <Link to="/books" className="btn btn-outline-light btn-lg">
          Get Started
        </Link>
      </div>

      {/* Features Cards */}
      <div className="row">
        <div className="col-md-4 mb-4">
          <div className="card h-100 bg-dark text-white border-white border-2 shadow">
            <div className="card-body text-center">
              <FontAwesomeIcon
                icon={faBook}
                size="3x"
                className="text-white mb-3"
              />
              <h5 className="card-title">Books Collection</h5>
              <p className="card-text">
                Browse the catalog and reserve books for pickup or reading.
              </p>
              <Link to="/books" className="btn btn-outline-light">
                View Books
              </Link>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-4">
          <div className="card h-100 bg-dark text-white border-white border-2 shadow">
            <div className="card-body text-center">
              <FontAwesomeIcon
                icon={faUser}
                size="3x"
                className="text-white mb-3"
              />
              <h5 className="card-title">Authors</h5>
              <p className="card-text">
                Keep track of authors and their biographical information.
              </p>
              <Link to="/authors" className="btn btn-outline-light">
                View Authors
              </Link>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-4">
          <div className="card h-100 bg-dark text-white border-white border-2 shadow">
            <div className="card-body text-center">
              <i className="fas fa-tags fa-3x text-white mb-3"></i>
              <FontAwesomeIcon
                icon={faLayerGroup}
                size="3x"
                className="text-white mb-3"
              />
              <h5 className="card-title">Categories</h5>
              <p className="card-text ">
                Organize books by categories for easy browsing and searching.
              </p>
              <Link to="/categories" className="btn btn-outline-light">
                View Categories
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Books Section */}
      <RecentBooks />
    </div>
  );
}

export default Home;
