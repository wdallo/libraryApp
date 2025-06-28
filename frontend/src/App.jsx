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
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import UserProtectedRoute from "./components/UserProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

import BookForm from "./components/BookForm";
import AuthorForm from "./components/AuthorForm";
import CategoryForm from "./components/CategoryForm";
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

        <Route path="/books/:bookId" element={<BookView />} />
        <Route
          path="/books/new"
          element={
            <AdminProtectedRoute>
              <BookForm />
            </AdminProtectedRoute>
          }
        />
        <Route path="/authors" element={<Authors />} />
        <Route
          path="/authors/new"
          element={
            <AdminProtectedRoute>
              <AuthorForm />
            </AdminProtectedRoute>
          }
        />
        <Route path="/authors/:authorId/books" element={<AuthorBooks />} />
        <Route path="/categories" element={<Categories />} />
        <Route
          path="/categories/new"
          element={
            <AdminProtectedRoute>
              <CategoryForm />
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
