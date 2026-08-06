const { pool } = require("../config/db");

// @desc    Get all notes for logged-in user
// @route   GET /api/notes
const getNotes = async (req, res, next) => {
  try {
    const [notes] = await pool.query(
      "SELECT * FROM notes WHERE user_id = ? ORDER BY created_at DESC",
      [req.user.id],
    );
    res.status(200).json(notes);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new note
// @route   POST /api/notes
const createNote = async (req, res, next) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      res.status(400);
      throw new Error("Please provide a title and content");
    }

    const [result] = await pool.query(
      "INSERT INTO notes (user_id, title, content) VALUES (?, ?, ?)",
      [req.user.id, title, content],
    );

    res.status(201).json({
      id: result.insertId,
      user_id: req.user.id,
      title,
      content,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a note
// @route   PUT /api/notes/:id
const updateNote = async (req, res, next) => {
  try {
    const { title, content } = req.body;
    const noteId = req.params.id;

    if (!title || !content) {
      res.status(400);
      throw new Error("Please provide a title and content");
    }

    const [existing] = await pool.query(
      "SELECT * FROM notes WHERE id = ? AND user_id = ?",
      [noteId, req.user.id],
    );

    if (existing.length === 0) {
      res.status(404);
      throw new Error("Note not found or unauthorized");
    }

    await pool.query(
      "UPDATE notes SET title = ?, content = ? WHERE id = ? AND user_id = ?",
      [title, content, noteId, req.user.id],
    );

    res.status(200).json({ id: noteId, title, content });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a note
// @route   DELETE /api/notes/:id
const deleteNote = async (req, res, next) => {
  try {
    const noteId = req.params.id;

    const [existing] = await pool.query(
      "SELECT * FROM notes WHERE id = ? AND user_id = ?",
      [noteId, req.user.id],
    );

    if (existing.length === 0) {
      res.status(404);
      throw new Error("Note not found or unauthorized");
    }

    await pool.query("DELETE FROM notes WHERE id = ? AND user_id = ?", [
      noteId,
      req.user.id,
    ]);

    res.status(200).json({ id: noteId, message: "Note deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = { getNotes, createNote, updateNote, deleteNote };
