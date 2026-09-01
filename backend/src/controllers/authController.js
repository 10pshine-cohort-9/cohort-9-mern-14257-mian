const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { pool } = require("../config/db");

const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

const signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (
      !name ||
      typeof name !== "string" ||
      !email ||
      typeof email !== "string" ||
      !password ||
      typeof password !== "string"
    ) {
      res.status(400);
      throw new Error("Please provide all required fields as valid text");
    }

    if (password.length < 6) {
      res.status(400);
      throw new Error("Password must be at least 6 characters long");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400);
      throw new Error("Please provide a valid email format");
    }

    const [existingUsers] = await pool.query(
      "SELECT * FROM users WHERE email = ?",
      [email],
    );
    if (existingUsers.length > 0) {
      res.status(400);
      throw new Error("User already exists");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const [result] = await pool.query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashedPassword],
    );

    const token = jwt.sign({ id: result.insertId }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("archive_token", token, getCookieOptions());

    res.status(201).json({
      id: result.insertId,
      name,
      email,
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (
      !email ||
      typeof email !== "string" ||
      !password ||
      typeof password !== "string"
    ) {
      res.status(400);
      throw new Error("Please provide a valid email and password");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400);
      throw new Error("Please provide a valid email format");
    }

    const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    const user = users[0];

    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      res.cookie("archive_token", token, getCookieOptions());

      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        avatar_url: user.avatar_url,
      });
    } else {
      res.status(401);
      throw new Error("Invalid email or password");
    }
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    res.cookie("archive_token", "", {
      ...getCookieOptions(),
      maxAge: 0,
    });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const [users] = await pool.query(
      "SELECT id, name, email, avatar_url FROM users WHERE id = ?",
      [req.user.id],
    );

    if (users.length === 0) {
      res.status(404);
      throw new Error("User not found");
    }

    const [notes] = await pool.query(
      "SELECT COUNT(*) as count FROM notes WHERE user_id = ?",
      [req.user.id],
    );

    res.status(200).json({
      ...users[0],
      total_notes: notes[0].count,
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { name } = req.body;
    let avatar_url = req.file ? `/uploads/${req.file.filename}` : null;

    if (!name || !name.trim()) {
      res.status(400);
      throw new Error("Name is required");
    }

    let query = "UPDATE users SET name = ?";
    let params = [name.trim()];

    if (avatar_url) {
      query += ", avatar_url = ?";
      params.push(avatar_url);
    }

    query += " WHERE id = ?";
    params.push(req.user.id);

    await pool.query(query, params);

    res.status(200).json({
      message: "Profile updated successfully",
      name: name.trim(),
      ...(avatar_url && { avatar_url }),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { signup, login, logout, getMe, updateProfile };
