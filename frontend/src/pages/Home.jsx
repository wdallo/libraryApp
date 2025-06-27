import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="container mt-4 bg-white">
      {/* Hero Section */}
      <div className="jumbotron bg-dark text-white p-5 rounded mb-4 border border-white shadow">
        <h1 className="display-4">Welcome to Library Management System</h1>
        <p className="lead text-muted">
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
              <i className="fas fa-book fa-3x text-white mb-3"></i>
              <h5 className="card-title">Manage Books</h5>
              <p className="card-text">
                Add, edit, and organize your book collection with detailed
                information.
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
              <i className="fas fa-user fa-3x text-white mb-3"></i>
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
      <div className="row mt-5">
        <div className="col-12">
          <h2 className="mb-4 text-black">Recent Books</h2>
          <div className="row">
            <div className="col-md-3 mb-3">
              <div className="card bg-white text-black border-dark border-2 shadow">
                <img
                  src="https://via.placeholder.com/200x300"
                  className="card-img-top"
                  alt="Book Cover"
                />
                <div className="card-body">
                  <h6 className="card-title">Sample Book Title</h6>
                  <p className="card-text text-muted">Author Name</p>
                  <button className="btn btn-dark btn-sm">View Details</button>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="card bg-white text-black border-dark border-2 shadow">
                <img
                  src="https://via.placeholder.com/200x300"
                  className="card-img-top"
                  alt="Book Cover"
                />
                <div className="card-body">
                  <h6 className="card-title">Another Book</h6>
                  <p className="card-text text-muted">Another Author</p>
                  <button className="btn btn-dark btn-sm">View Details</button>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="card bg-white text-black border-dark border-2 shadow">
                <img
                  src="https://via.placeholder.com/200x300"
                  className="card-img-top"
                  alt="Book Cover"
                />
                <div className="card-body">
                  <h6 className="card-title">Third Book</h6>
                  <p className="card-text text-muted">Third Author</p>
                  <button className="btn btn-dark btn-sm">View Details</button>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="card bg-white text-black border-dark border-2 shadow">
                <img
                  src="https://via.placeholder.com/200x300"
                  className="card-img-top"
                  alt="Book Cover"
                />
                <div className="card-body">
                  <h6 className="card-title">Fourth Book</h6>
                  <p className="card-text text-muted">Fourth Author</p>
                  <button className="btn btn-dark btn-sm">View Details</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
