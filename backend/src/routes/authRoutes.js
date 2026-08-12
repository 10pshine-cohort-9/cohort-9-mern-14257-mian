const express = require("express");
const rateLimit = require("express-rate-limit");
const {
  signup,
  login,
  logout,
  getMe,
} = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    message:
      "Too many authentication attempts from this IP, please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/signup", authLimiter, signup);
router.post("/login", authLimiter, login);

router.post("/logout", logout);

router.get("/me", protect, getMe);

module.exports = router;
