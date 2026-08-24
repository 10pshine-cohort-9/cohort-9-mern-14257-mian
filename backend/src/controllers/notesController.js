const { pool } = require("../config/db");

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

const createNote = async (req, res, next) => {
  try {
    const { title, content } = req.body;
    if (
      !title ||
      typeof title !== "string" ||
      !title.trim() ||
      !content ||
      typeof content !== "string" ||
      !content.trim()
    ) {
      res.status(400);
      throw new Error("Please provide a valid title and content");
    }

    const [result] = await pool.query(
      "INSERT INTO notes (user_id, title, content) VALUES (?, ?, ?)",
      [req.user.id, title.trim(), content.trim()],
    );

    res.status(201).json({
      id: result.insertId,
      user_id: req.user.id,
      title: title.trim(),
      content: content.trim(),
    });
  } catch (error) {
    next(error);
  }
};

const updateNote = async (req, res, next) => {
  try {
    const { title, content } = req.body;
    const noteId = req.params.id;

    if (
      !title ||
      typeof title !== "string" ||
      !title.trim() ||
      !content ||
      typeof content !== "string" ||
      !content.trim()
    ) {
      res.status(400);
      throw new Error("Please provide a valid title and content");
    }

    const [result] = await pool.query(
      "UPDATE notes SET title = ?, content = ? WHERE id = ? AND user_id = ?",
      [title.trim(), content.trim(), noteId, req.user.id],
    );

    if (result.affectedRows === 0) {
      res.status(404);
      throw new Error("Note not found or unauthorized");
    }

    res
      .status(200)
      .json({ id: noteId, title: title.trim(), content: content.trim() });
  } catch (error) {
    next(error);
  }
};

const deleteNote = async (req, res, next) => {
  try {
    const noteId = req.params.id;

    const [result] = await pool.query(
      "DELETE FROM notes WHERE id = ? AND user_id = ?",
      [noteId, req.user.id],
    );

    if (result.affectedRows === 0) {
      res.status(404);
      throw new Error("Note not found or unauthorized");
    }

    res.status(200).json({ id: noteId, message: "Note deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = { getNotes, createNote, updateNote, deleteNote };
