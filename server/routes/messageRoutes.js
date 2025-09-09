import express from "express";
import {
  getMessages,
  sendMessage,
  markMessagesAsRead,
  getChatParticipants
} from "../controllers/messageController.js";
import { verifyUser, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", verifyUser, getMessages);
router.post("/", verifyUser, sendMessage);
router.put("/read", verifyUser, markMessagesAsRead);
router.get("/participants", verifyUser, isAdmin, getChatParticipants);

export default router;