import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import { useEffect } from "react";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Books from "./pages/Books";
import BookView from "./pages/BookView";

import Authors from "./pages/Authors";
import AuthorBooks from "./pages/AuthorBooks";
import Categories from "./pages/Categories";
import CategoryBooks from "./pages/CategoryBooks";
import MyReservations from "./pages/MyReservations";
import AdminReservations from "./pages/admin/AdminReservations";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminBooks from "./pages/admin/AdminBooks";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminAuthors from "./pages/admin/AdminAuthors";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import UserProtectedRoute from "./components/UserProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

import Form from "./components/Form";
import {
  setupAxiosInterceptors,
  setNavigateFunction,
} from "./utils/axiosInterceptors";
import { setApiClientNavigate } from "./utils/apiClient";
import RateLimitPage from "./pages/RateLimitPage";

function AppContent() {
  const navigate = useNavigate();

  // Set up axios interceptors when the app loads
  useEffect(() => {
    setupAxiosInterceptors();
    setNavigateFunction(navigate);
    setApiClientNavigate(navigate);
    console.log("🔧 Both global and apiClient interceptors configured");
  }, [navigate]);

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/books" element={<Books />} />
        <Route path="/books/page/:pageNumber" element={<Books />} />

        <Route path="/books/:bookId" element={<BookView />} />
        <Route
          path="/books/new"
          element={
            <AdminProtectedRoute>
              <Form type="book" />
            </AdminProtectedRoute>
          }
        />
        <Route path="/authors" element={<Authors />} />
        <Route path="/authors/page/:pageNumber" element={<Authors />} />
        <Route
          path="/authors/new"
          element={
            <AdminProtectedRoute>
              <Form type="author" />
            </AdminProtectedRoute>
          }
        />
        <Route path="/authors/:authorId/books" element={<AuthorBooks />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/categories/page/:pageNumber" element={<Categories />} />
        <Route
          path="/categories/new"
          element={
            <AdminProtectedRoute>
              <Form type="category" />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/categories/:categoryId/books"
          element={<CategoryBooks />}
        />
        <Route
          path="/my-reservations"
          element={
            <UserProtectedRoute>
              <MyReservations />
            </UserProtectedRoute>
          }
        />
        <Route
          path="/my-reservations/page/:pageNumber"
          element={
            <UserProtectedRoute>
              <MyReservations />
            </UserProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <AdminProtectedRoute>
              <AdminDashboard />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminProtectedRoute>
              <AdminUsers />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/books"
          element={
            <AdminProtectedRoute>
              <AdminBooks />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/categories"
          element={
            <AdminProtectedRoute>
              <AdminCategories />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/authors"
          element={
            <AdminProtectedRoute>
              <AdminAuthors />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/reservations"
          element={
            <AdminProtectedRoute>
              <AdminReservations />
            </AdminProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/rate-limit" element={<RateLimitPage />} />
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
