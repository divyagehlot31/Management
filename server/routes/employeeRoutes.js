// routes/employeeRoutes.js
import express from "express";
import {
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  getDepartmentsForEmployees
} from "../controllers/employeeController.js";
import { verifyUser, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ FIXED: Add route for getting departments for employee assignment
router.get("/departments", verifyUser, getDepartmentsForEmployees);

// Employee management routes
router.get("/", verifyUser, getEmployees);
router.get("/:id", verifyUser, getEmployeeById);
router.put("/:id", verifyUser, updateEmployee);
router.delete("/:id", verifyUser, isAdmin, deleteEmployee);

export default router;