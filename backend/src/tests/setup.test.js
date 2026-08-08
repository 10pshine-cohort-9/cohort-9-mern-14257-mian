const { pool, connectDB } = require("../config/db");
require("dotenv").config();

before(async () => {
  if (!process.env.DB_NAME || !process.env.DB_NAME.includes("test")) {
    throw new Error(
      "❌ Aborting tests: DB_NAME does not contain 'test'. Protects production data!",
    );
  }

  try {
    await connectDB();
    await pool.query("DELETE FROM notes");
    await pool.query("DELETE FROM users");
    console.log("✅ Test database connected and cleaned.");
  } catch (error) {
    console.error("❌ Global test setup failed:", error.message);
    throw error;
  }
});

after(async () => {
  try {
    await pool.end();
    console.log("✅ MySQL pool closed after all tests completed.");
  } catch (error) {
    console.error("❌ Failed to close MySQL pool:", error.message);
    throw error;
  }
});
