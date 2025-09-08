// controllers/authController.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import bcrypt from "bcrypt";

// REGISTER
export const register = async (req, res) => {
  try {
    const { name, email, password, role, department, phone, dateOfBirth } = req.body;
    if (!name || !email || !password) return res.status(400).json({ success: false, error: "All fields required" });

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ success: false, error: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name, email, password: hashedPassword,
      role: role || "employee",
      department: department || null, // ✅ FIXED: Ensure department is saved properly
      phone, dateOfBirth
    });

    await user.save();
    res.json({ success: true, message: "User registered successfully" });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // ✅ FIXED: Populate department during login
    const user = await User.findOne({ email }).populate('department', 'name description');
    if (!user) return res.status(404).json({ success: false, error: "No user found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ success: false, error: "Invalid password" });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });

    // ✅ FIXED: Include populated department in response
    const safeUser = {
      id: user._id, 
      name: user.name, 
      email: user.email,
      role: user.role, 
      department: user.department, // This will now include populated data
      phone: user.phone, 
      dateOfBirth: user.dateOfBirth,
      employeeId: user.employeeId,
      joinDate: user.joinDate,
      address: user.address,
      salary: user.salary,
      isActive: user.isActive
    };

    res.json({ success: true, user: safeUser, token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// VERIFY
export const verify = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ success: false, error: "No token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // ✅ FIXED: Populate department during token verification
    const user = await User.findById(decoded.id)
      .populate('department', 'name description')
      .select("-password");
      
    if (!user) return res.status(404).json({ success: false, error: "User not found" });

    res.json({ success: true, user });
  } catch (err) {
    res.status(401).json({ success: false, error: "Invalid token" });
  }
};

// CHANGE PASSWORD
export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ success: false, error: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ success: false, error: "User not found" });

    if (!oldPassword || !newPassword) return res.status(400).json({ success: false, error: "Old and new password required" });
    if (newPassword.length < 6) return res.status(400).json({ success: false, error: "Password must be 6+ characters" });

    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPasswordValid) return res.status(400).json({ success: false, error: "Current password incorrect" });

    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) return res.status(400).json({ success: false, error: "New password must differ" });

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    await user.save();

    res.json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to change password" });
  }
};

// UPDATE PROFILE
export const updateProfile = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ success: false, error: "No token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    if (!name || !email) return res.status(400).json({ success: false, error: "Name and email required" });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return res.status(400).json({ success: false, error: "Invalid email" });

    const existingUser = await User.findOne({ email: email.toLowerCase(), _id: { $ne: userId } });
    if (existingUser) return res.status(400).json({ success: false, error: "Email already registered" });

    // ✅ FIXED: Populate department after profile update
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name: name.trim(), email: email.toLowerCase().trim(), phone: phone?.trim() || "", updatedAt: new Date() },
      { new: true, runValidators: true }
    )
    .populate('department', 'name description')
    .select("-password");

    res.json({ success: true, message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ success: false, error: "Failed to update profile" });
  }
};

// GET CURRENT USER PROFILE
export const getProfile = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ success: false, error: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // ✅ FIXED: Populate department when getting profile
    const user = await User.findById(decoded.id)
      .populate('department', 'name description')
      .select("-password");
      
    if (!user) return res.status(404).json({ success: false, error: "User not found" });

    res.json({ success: true, user });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch profile" });
  }
};