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

// ✅ IMPORTANT: Public routes MUST come BEFORE parameterized routes
router.get("/public/list", getPublicDepartments);

// ✅ Other specific routes before /:id
router.get("/available-heads", verifyUser, getAvailableHeads);

// ✅ Admin / Authenticated routes
router.get("/", verifyUser, getDepartments); 
router.post("/", verifyUser, isAdmin, createDepartment);

// ✅ Parameterized routes LAST
router.get("/:id", verifyUser, getDepartmentById);
router.put("/:id", verifyUser, isAdmin, updateDepartment);
router.delete("/:id", verifyUser, isAdmin, deleteDepartment);

export default router;