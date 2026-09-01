const express = require("express");
const rateLimit = require("express-rate-limit");
const multer = require("multer");
const {
  signup,
  login,
  logout,
  getMe,
  updateProfile,
} = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

const MIME_TYPE_MAP = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const ext = MIME_TYPE_MAP[file.mimetype] || ".jpg";
    cb(null, `${req.user.id}-${Date.now()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (MIME_TYPE_MAP[file.mimetype]) {
    cb(null, true);
  } else {
    cb(
      new Error("Only .jpg, .png, and .webp image formats are allowed!"),
      false,
    );
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter,
});

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
router.put("/profile", protect, upload.single("avatar"), updateProfile);

module.exports = router;
