import express from "express";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification
} from "../controllers/notificationController.js";
import { verifyUser } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", verifyUser, getNotifications);
router.put("/:notificationId/read", verifyUser, markNotificationAsRead);
router.put("/read-all", verifyUser, markAllNotificationsAsRead);
router.delete("/:notificationId", verifyUser, deleteNotification);

export default router;