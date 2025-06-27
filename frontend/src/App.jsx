import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Books from "./pages/Books";
import Authors from "./pages/Authors";
import AuthorBooks from "./pages/AuthorBooks";
import Categories from "./pages/Categories";
import CategoryBooks from "./pages/CategoryBooks";
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
          <Route path="/books/new" element={<BookForm />} />
          <Route path="/authors" element={<Authors />} />
          <Route path="/authors/new" element={<AuthorForm />} />
          <Route path="/authors/:authorId/books" element={<AuthorBooks />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/categories/new" element={<CategoryForm />} />
          <Route
            path="/categories/:categoryId/books"
            element={<CategoryBooks />}
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
