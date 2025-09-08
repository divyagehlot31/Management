import express from "express";
import { getSalaries } from "../controllers/salaryController.js";
import { verifyUser } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ FIXED: Add auth middleware
router.get("/", verifyUser, getSalaries);

export default router;

