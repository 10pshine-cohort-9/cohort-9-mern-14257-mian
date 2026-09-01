const mysql = require("mysql2/promise");
const logger = require("../utils/logger");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const connectDB = async () => {
  let connection;
  try {
    connection = await pool.getConnection();
    logger.info("MySQL Database connected successfully");

    const createUserTable = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        avatar_url VARCHAR(255) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await connection.query(createUserTable);
    logger.info("Users table is ready");

    try {
      await connection.query(`
        ALTER TABLE users 
        ADD COLUMN avatar_url VARCHAR(255) DEFAULT NULL AFTER password
      `);
      logger.info("avatar_url column added to users table");
    } catch (migrationError) {
      if (
        migrationError.errno === 1060 ||
        migrationError.code === "ER_DUP_FIELDNAME"
      ) {
      } else {
        throw migrationError;
      }
    }

    const createNotesTable = `
      CREATE TABLE IF NOT EXISTS notes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `;
    await connection.query(createNotesTable);
    logger.info("Notes table is ready");
  } catch (error) {
    logger.error(`MySQL database setup failed: ${error.message}`);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

module.exports = { pool, connectDB };
