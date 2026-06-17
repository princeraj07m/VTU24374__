import express from "express";
import { getNotifications, getPriorityNotifications } from "../controllers/notificationController.js";

const router = express.Router();

router.get("/priority", getPriorityNotifications);
router.get("/", getNotifications);

export default router;
