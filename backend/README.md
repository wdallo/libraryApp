# Library Management System API

A RESTful API for managing a library system with books, authors, categories, and users.

## Features

- User authentication and authorization
- CRUD operations for books, authors, and categories
- File upload for book covers and author pictures
- Admin panel functionality
- Input validation and security middleware

## Installation

1. Clone the repository
2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   - Copy `.env.example` to `.env`
   - Update the MongoDB connection string and other settings

4. Start the server:

   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## API Endpoints

### Authentication

- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login user

### Books

- `GET /api/books` - Get all books
- `GET /api/books/:id` - Get book by ID
- `POST /api/books` - Create book (admin only)
- `PUT /api/books/:id` - Update book (admin only)
- `DELETE /api/books/:id` - Delete book (admin only)

### Authors

- `GET /api/authors` - Get all authors
- `GET /api/authors/:id` - Get author by ID
- `POST /api/authors` - Create author (admin only)
- `PUT /api/authors/:id` - Update author (admin only)
- `DELETE /api/authors/:id` - Delete author (admin only)

### Categories

- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get category by ID
- `POST /api/categories` - Create category (admin only)
- `PUT /api/categories/:id` - Update category (admin only)
- `DELETE /api/categories/:id` - Delete category (admin only)

### Users

- `GET /api/users` - Get all users (protected)
- `PUT /api/users/:id` - Update user (protected)
- `DELETE /api/users/:id` - Delete user (protected)

### Admin

- `GET /api/admin/dashboard` - Get admin dashboard
- `DELETE /api/admin/users/:id` - Delete user (admin only)

## Project Structure

```
backend/
├── controllers/     # Request handlers
├── middleware/      # Custom middleware
├── models/         # Database models
├── routes/         # API routes
├── uploads/        # File uploads
├── functions/      # Utility functions
├── app.js          # Main application file
└── package.json    # Dependencies and scripts
```

## Environment Variables

```env
PORT=3000
NODE_ENVIRONMENT=development
MONGO_URI=mongodb://localhost:27017/library
JWT_SALT=your_jwt_secret_here
```

## Technologies Used

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- Multer for file uploads
- Express-validator for input validation
- Helmet for security
- Morgan for logging
- Rate limiting for API protection
