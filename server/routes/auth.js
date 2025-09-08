import express from "express";
import { 
  login, 
  verify, 
  register, 
  changePassword, 
  updateProfile, 
  getProfile 
} from "../controllers/authController.js";

const router = express.Router();

// Authentication routes
router.post("/register", register);
router.post("/login", login);

// ✅ verify route ke liye middleware hata diya, kyunki yaha andar hi token verify kar rahe hain
router.get("/verify", verify);

// Settings related routes - token verification handled inside functions
router.get("/profile", getProfile);
router.put("/change-password", changePassword);
router.put("/update-profile", updateProfile);

export default router;