
// routes/taskRoutes.js
import express from "express";
import {
  getAllTasks,
  getUserTasks,
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
  addTaskComment,
  getTaskStats
} from "../controllers/taskController.js";
import { verifyUser, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Task statistics
router.get("/stats", verifyUser, getTaskStats);

// Task CRUD operations
router.get("/", verifyUser, (req, res, next) => {
  // Admin gets all tasks, employees get only their tasks
  if (req.user.role === "admin") {
    getAllTasks(req, res, next);
  } else {
    getUserTasks(req, res, next);
  }
});

router.post("/", verifyUser, isAdmin, createTask);
router.get("/:id", verifyUser, getTaskById);
router.put("/:id", verifyUser, updateTask);
router.delete("/:id", verifyUser, isAdmin, deleteTask);

// Task comments
router.post("/:id/comments", verifyUser, addTaskComment);

export default router;