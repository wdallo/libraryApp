import { useState } from "react";

function BookForm() {
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    description: "",
    category: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // Here you would typically send the data to your API
  };

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">Add New Book</h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="title" className="form-label">
                      Book Title *
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      placeholder="Enter book title"
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="author" className="form-label">
                      Author *
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="author"
                      name="author"
                      value={formData.author}
                      onChange={handleChange}
                      required
                      placeholder="Enter author name"
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="category" className="form-label">
                    Category
                  </label>
                  <select
                    className="form-select"
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                  >
                    <option value="">Select a category</option>
                    <option value="fiction">Fiction</option>
                    <option value="non-fiction">Non-Fiction</option>
                    <option value="mystery">Mystery</option>
                    <option value="romance">Romance</option>
                    <option value="sci-fi">Science Fiction</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label htmlFor="description" className="form-label">
                    Description
                  </label>
                  <textarea
                    className="form-control"
                    id="description"
                    name="description"
                    rows="4"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Enter book description"
                  ></textarea>
                </div>

                <div className="mb-3">
                  <label htmlFor="bookCover" className="form-label">
                    Book Cover
                  </label>
                  <input
                    type="file"
                    className="form-control"
                    id="bookCover"
                    accept="image/*"
                  />
                  <div className="form-text">
                    Upload a cover image for the book (optional)
                  </div>
                </div>

                <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                  <button type="button" className="btn btn-secondary me-md-2">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Add Book
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Example of Bootstrap Modal */}
          <div className="mt-3">
            <button
              type="button"
              className="btn btn-info"
              data-bs-toggle="modal"
              data-bs-target="#exampleModal"
            >
              Show Modal Example
            </button>
          </div>

          {/* Modal */}
          <div
            className="modal fade"
            id="exampleModal"
            tabIndex="-1"
            aria-labelledby="exampleModalLabel"
            aria-hidden="true"
          >
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title" id="exampleModalLabel">
                    Book Details
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                  ></button>
                </div>
                <div className="modal-body">
                  <p>This is an example of a Bootstrap modal in React.</p>
                  <div className="alert alert-info" role="alert">
                    You can use modals for confirmations, detailed views, or
                    forms!
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    data-bs-dismiss="modal"
                  >
                    Close
                  </button>
                  <button type="button" className="btn btn-primary">
                    Save changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookForm;
