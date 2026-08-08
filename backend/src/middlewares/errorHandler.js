const logger = require("../utils/logger");

const errorHandler = (err, req, res, next) => {
  const statusCode =
    res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  logger.error({
    err: {
      message: err.message,
      stack: err.stack,
    },
    method: req.method,
    url: req.originalUrl,
  });

  const responsePayload = {
    message: statusCode >= 500 ? "Internal Server Error" : err.message,
  };

  if (process.env.NODE_ENV === "development") {
    responsePayload.stack = err.stack;
  }

  res.status(statusCode).json(responsePayload);
};

module.exports = errorHandler;
