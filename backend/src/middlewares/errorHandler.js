const logger = require("../utils/logger");

const errorHandler = (err, req, res, next) => {
  // Log the exception using Pino
  logger.error(`Error: ${err.message}`);

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: statusCode === 500 ? "Internal Server Error" : err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

module.exports = errorHandler;
