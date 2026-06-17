import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import Notification from "./models/Notification.js";
import log from "../../logging-middleware/logger.js";
import notificationRoutes from "./routes/notificationRoutes.js";

const app = express();
const PORT = process.env.PORT || 8000;

connectDB().then(() => Notification.createIndexes());

app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  res.on("finish", () => {
    log(
      "notification-app-be",
      "info",
      "notification-app-be",
      `${req.method} ${req.originalUrl} ${timestamp} ${res.statusCode}`
    );
  });
  next();
});

app.use("/notifications", notificationRoutes);

app.use((err, req, res, next) => {
  res.status(500).json({ error: "Internal server error", details: err.message });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
