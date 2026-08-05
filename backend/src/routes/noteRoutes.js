const express = require("express");
const router = express.Router();

const {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
} = require("../controllers/notesController");
const { protect } = require("../middlewares/authMiddleware");

// Protect all notes routes
router.use(protect);

// Routes for /api/notes
router.route("/").get(getNotes).post(createNote);

// Routes for /api/notes/:id
router.route("/:id").put(updateNote).delete(deleteNote);

module.exports = router;
