const errorHandler = (err, _req, res, _next) => {
  const setStatusCode = res.statusCode ? res.statusCode : 500;

  res.status(setStatusCode);

  res.json({
    message: err.message,
    stack: process.env.NODE_ENVIRONMENT === "production" ? null : err.stack,
  });
};

module.exports = { errorHandler };
