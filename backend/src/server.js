const express = require("express");
const pinoHttp = require("pino-http");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const logger = require("./utils/logger");
const { connectDB } = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const errorHandler = require("./middlewares/errorHandler");

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(pinoHttp({ logger }));

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.status(200).json({ message: "Notes App Backend is running!" });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  app.listen(PORT, async () => {
    logger.info(`Server is listening on port ${PORT}`);
    await connectDB();
  });
}

module.exports = app;
