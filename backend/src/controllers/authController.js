const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { pool } = require("../config/db");

// Dynamically evaluate environment variables when the function is called
const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});

// @desc    Register a new user
// @route   POST /api/auth/signup
const signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // 1. Check for missing or invalid fields
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

    // 2. Check password strength
    if (password.length < 6) {
      res.status(400);
      throw new Error("Password must be at least 6 characters long");
    }

    // 3. Check for valid email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400);
      throw new Error("Please provide a valid email format");
    }

    // 4. Check if user already exists
    const [existingUsers] = await pool.query(
      "SELECT * FROM users WHERE email = ?",
      [email],
    );
    if (existingUsers.length > 0) {
      res.status(400);
      throw new Error("User already exists");
    }

    // 5. Hash password and save user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const [result] = await pool.query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashedPassword],
    );

    // 6. Generate token and set cookie
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

// @desc    Authenticate a user
// @route   POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1. Check for missing fields
    if (
      !email ||
      typeof email !== "string" ||
      !password ||
      typeof password !== "string"
    ) {
      res.status(400);
      throw new Error("Please provide a valid email and password");
    }

    // 2. Check for valid email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400);
      throw new Error("Please provide a valid email format");
    }

    // 3. Find user in database
    const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    const user = users[0];

    // 4. Verify password and set cookie
    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      res.cookie("archive_token", token, getCookieOptions());

      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
      });
    } else {
      res.status(401);
      throw new Error("Invalid email or password");
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user & clear cookie
// @route   POST /api/auth/logout
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

// @desc    Get current logged in user profile
// @route   GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    const [users] = await pool.query(
      "SELECT id, name, email FROM users WHERE id = ?",
      [req.user.id],
    );

    if (users.length === 0) {
      res.status(404);
      throw new Error("User not found");
    }

    res.status(200).json(users[0]);
  } catch (error) {
    next(error);
  }
};

module.exports = { signup, login, logout, getMe };
