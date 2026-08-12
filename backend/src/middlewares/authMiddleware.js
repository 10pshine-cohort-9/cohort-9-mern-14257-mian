const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  const token = req.cookies?.archive_token;

  if (!token) {
    res.status(401);
    return next(new Error("Not authorized, no token provided"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id };

    next();
  } catch (error) {
    res.status(401);
    return next(new Error("Not authorized, token failed"));
  }
};

module.exports = { protect };
