// routes/PaySalaryRoutes.js - FIXED VERSION
import express from "express";
import { getSalaries, addSalary } from "../controllers/PaySalaryController.js";
import { verifyUser, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ FIXED: Add proper auth middleware
router.get("/", verifyUser, getSalaries);
router.post("/", verifyUser, isAdmin, addSalary); // Only admin can add salary

export default router;