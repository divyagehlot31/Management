// routes/leaveRoutes.js
import express from "express";
import {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  updateLeaveStatus,
  getLeaveStats
} from "../controllers/leaveController.js";

const router = express.Router();

// Employee routes
router.post("/apply", applyLeave);
router.get("/my-leaves", getMyLeaves);

// Admin routes
router.get("/all", getAllLeaves);
router.put("/update/:leaveId", updateLeaveStatus);
router.get("/stats", getLeaveStats);

export default router;