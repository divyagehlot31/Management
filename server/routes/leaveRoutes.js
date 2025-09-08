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






// import express from "express";
// import {
//   applyLeave,
//   getMyLeaves,
//   getAllLeaves,
//   updateLeaveStatus,
//   getLeaveStats
// } from "../controllers/leaveController.js";
// import { verifyUser, isAdmin } from "../middleware/authMiddleware.js";

// const router = express.Router();

// // ✅ FIXED: Add proper middleware to all routes
// // Employee routes
// router.post("/apply", verifyUser, applyLeave);
// router.get("/my-leaves", verifyUser, getMyLeaves);

// // Admin routes
// router.get("/all", verifyUser, isAdmin, getAllLeaves);
// router.put("/update/:leaveId", verifyUser, isAdmin, updateLeaveStatus);
// router.get("/stats", verifyUser, isAdmin, getLeaveStats);

// export default router;