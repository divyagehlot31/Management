import jwt from "jsonwebtoken";
import User from "../models/User.js";

// ✅ Verify Logged-in User
export const verifyUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ success: false, error: "Token not provided" });
    }

    const token = authHeader.split(" ")[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ success: false, error: "Token not valid" });
    }

const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, error: "User not found" });
    }

    req.user = user; // Attach user to request
    next();
  } catch (error) {
    console.error("Auth error:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

// ✅ Check Admin
export const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ success: false, error: "Access denied: Admins only" });
  }
  next();
};
