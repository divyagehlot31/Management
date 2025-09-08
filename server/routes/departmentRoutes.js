// routes/departmentRoutes.js
import express from "express";
import {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getAvailableHeads,
  getPublicDepartments
} from "../controllers/departmentController.js";

import { verifyUser, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ PUBLIC ROUTE FIRST - No authentication needed
router.get("/public/list", getPublicDepartments);

// ✅ PROTECTED ROUTES - Authentication required
router.get("/", verifyUser, getDepartments); 
router.get("/available-heads", verifyUser, getAvailableHeads);
router.get("/:id", verifyUser, getDepartmentById);
router.post("/", verifyUser, isAdmin, createDepartment);
router.put("/:id", verifyUser, isAdmin, updateDepartment);
router.delete("/:id", verifyUser, isAdmin, deleteDepartment);

export default router;