import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faRightFromBracket,
  faRightToBracket,
  faUserPlus,
} from "@fortawesome/free-solid-svg-icons";

function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check both localStorage and sessionStorage for user info
    const storedUser =
      localStorage.getItem("user") || sessionStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      setUser(null);
    }
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    sessionStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  const isActive = (path) => {
    return location.pathname === path ? "active" : "";
  };

  return (
    <div className="App bg-white min-vh-100 d-flex flex-column">
      {/* Bootstrap Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-black border-bottom border-white shadow-sm">
        <div className="container">
          <Link className="navbar-brand" to="/">
            📚 Library Management
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <Link className={`nav-link ${isActive("/")}`} to="/">
                  Home
                </Link>
              </li>
              <li className="nav-item">
                <Link className={`nav-link ${isActive("/books")}`} to="/books">
                  Books
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className={`nav-link ${isActive("/authors")}`}
                  to="/authors"
                >
                  Authors
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className={`nav-link ${isActive("/categories")}`}
                  to="/categories"
                >
                  Categories
                </Link>
              </li>
            </ul>
            <ul className="navbar-nav">
              {user ? (
                <li className="nav-item dropdown">
                  <a
                    className="nav-link dropdown-toggle"
                    href="#"
                    id="userDropdown"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <i className="fas fa-user me-2"></i>
                    {user.userName || user.email || "User"}
                  </a>
                  <ul
                    className="dropdown-menu dropdown-menu-end"
                    aria-labelledby="userDropdown"
                  >
                    <li>
                      <span className="dropdown-item disabled">
                        {user.email}
                      </span>
                    </li>
                    {user.role === "admin" && (
                      <>
                        <li>
                          <hr className="dropdown-divider" />
                        </li>
                        <li>
                          <Link className="dropdown-item" to="/books/new">
                            <FontAwesomeIcon icon={faPlus} className="me-2" />
                            Add Book
                          </Link>
                        </li>
                        <li>
                          <Link className="dropdown-item" to="/categories/new">
                            <FontAwesomeIcon icon={faPlus} className="me-2" />
                            Add Category
                          </Link>
                        </li>
                        <li>
                          <Link className="dropdown-item" to="/authors/new">
                            <FontAwesomeIcon icon={faPlus} className="me-2" />
                            Add Author
                          </Link>
                        </li>
                      </>
                    )}
                    <li>
                      <hr className="dropdown-divider" />
                    </li>
                    <li>
                      <button className="dropdown-item" onClick={handleLogout}>
                        <FontAwesomeIcon icon={faRightFromBracket} /> Logout
                      </button>
                    </li>
                  </ul>
                </li>
              ) : (
                <>
                  <li className="nav-item">
                    <Link
                      className={`nav-link ${isActive("/login")}`}
                      to="/login"
                    >
                      <FontAwesomeIcon icon={faRightToBracket} /> Login
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link
                      className={`nav-link ${isActive("/register")}`}
                      to="/register"
                    >
                      <FontAwesomeIcon icon={faUserPlus} /> Register
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow-1">{children}</main>

      {/* Footer */}
      <footer className="bg-black text-white mt-5 py-4 border-top border-white">
        <div className="container">
          <div className="row">
            <div className="col-md-6">
              <h5>Library Management System</h5>
              <p>Your digital library solution.</p>
            </div>
            <div className="col-md-6 text-md-end">
              <p>&copy; 2025 Library Management. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Layout;
