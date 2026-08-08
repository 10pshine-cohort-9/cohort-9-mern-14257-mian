const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  const token = req.cookies?.archive_token;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = { id: decoded.id };
      next();
    } catch (error) {
      res.status(401);
      next(new Error("Not authorized, token failed"));
    }
  } else {
    res.status(401);
    next(new Error("Not authorized, no token provided"));
  }
};

module.exports = { protect };
