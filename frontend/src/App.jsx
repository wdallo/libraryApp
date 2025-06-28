import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Books from "./pages/Books";
import Authors from "./pages/Authors";
import AuthorBooks from "./pages/AuthorBooks";
import Categories from "./pages/Categories";
import CategoryBooks from "./pages/CategoryBooks";
import MyReservations from "./pages/MyReservations";
import AdminReservations from "./pages/AdminReservations";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import UserProtectedRoute from "./components/UserProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import BookForm from "./components/BookForm";
import AuthorForm from "./components/AuthorForm";
import CategoryForm from "./components/CategoryForm";

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/books" element={<Books />} />
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
            path="/admin/reservations"
            element={
              <AdminProtectedRoute>
                <AdminReservations />
              </AdminProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
