// controllers/leaveController.js
import Leave from "../models/Leave.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

// Helper function to verify token and get user
const verifyTokenAndGetUser = async (req) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) throw new Error("No token provided");
  
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id);
  if (!user) throw new Error("User not found");
  
  return user;
};

// APPLY FOR LEAVE (Employee)
export const applyLeave = async (req, res) => {
  try {
    const user = await verifyTokenAndGetUser(req);
    
    if (user.role !== "employee") {
      return res.status(403).json({ success: false, error: "Only employees can apply for leave" });
    }

    const { leaveType, startDate, endDate, reason } = req.body;

    if (!leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({ success: false, error: "All fields are required" });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ success: false, error: "Invalid date format" });
    }

    if (start < today) {
      return res.status(400).json({ success: false, error: "Start date cannot be in the past" });
    }

    if (end < start) {
      return res.status(400).json({ success: false, error: "End date cannot be before start date" });
    }

    // Calculate totalDays manually as a backup
    const timeDiff = end.getTime() - start.getTime();
    const totalDays = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;

    const leave = new Leave({
      employee: user._id,
      leaveType,
      startDate: start,
      endDate: end,
      reason: reason.trim(),
      totalDays, // Explicitly set totalDays
    });

    await leave.save();
    
    // Populate employee details for response
    await leave.populate('employee', 'name email employeeId');

    res.json({ 
      success: true, 
      message: "Leave application submitted successfully",
      leave 
    });
  } catch (error) {
    console.error("Apply leave error:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to apply for leave" });
  }
};

// GET EMPLOYEE'S LEAVES
export const getMyLeaves = async (req, res) => {
  try {
    const user = await verifyTokenAndGetUser(req);
    
    if (user.role !== "employee") {
      return res.status(403).json({ success: false, error: "Access denied" });
    }

    const leaves = await Leave.find({ employee: user._id })
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, leaves });
  } catch (error) {
    console.error("Get my leaves error:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to fetch leaves" });
  }
};

// GET ALL LEAVES (Admin)
export const getAllLeaves = async (req, res) => {
  try {
    const user = await verifyTokenAndGetUser(req);
    
    if (user.role !== "admin") {
      return res.status(403).json({ success: false, error: "Admin access required" });
    }

    const { status } = req.query;
    const filter = status ? { status } : {};

    const leaves = await Leave.find(filter)
      .populate('employee', 'name email employeeId department')
      .populate('reviewedBy', 'name')
      .populate('employee.department', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, leaves });
  } catch (error) {
    console.error("Get all leaves error:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to fetch leaves" });
  }
};

// UPDATE LEAVE STATUS (Admin)
export const updateLeaveStatus = async (req, res) => {
  try {
    const user = await verifyTokenAndGetUser(req);
    
    if (user.role !== "admin") {
      return res.status(403).json({ success: false, error: "Admin access required" });
    }

    const { leaveId } = req.params;
    const { status, adminComments } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ success: false, error: "Invalid status" });
    }

    const leave = await Leave.findById(leaveId);
    if (!leave) {
      return res.status(404).json({ success: false, error: "Leave not found" });
    }

    if (leave.status !== "pending") {
      return res.status(400).json({ success: false, error: "Leave has already been reviewed" });
    }

    leave.status = status;
    leave.reviewedBy = user._id;
    leave.reviewedAt = new Date();
    if (adminComments) leave.adminComments = adminComments.trim();

    await leave.save();
    
    // Populate for response
    await leave.populate('employee', 'name email employeeId');
    await leave.populate('reviewedBy', 'name');

    res.json({ 
      success: true, 
      message: `Leave ${status} successfully`,
      leave 
    });
  } catch (error) {
    console.error("Update leave status error:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to update leave status" });
  }
};

// GET LEAVE STATISTICS (Admin)
export const getLeaveStats = async (req, res) => {
  try {
    const user = await verifyTokenAndGetUser(req);
    
    if (user.role !== "admin") {
      return res.status(403).json({ success: false, error: "Admin access required" });
    }

    const stats = await Leave.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    const formattedStats = {
      pending: 0,
      approved: 0,
      rejected: 0,
      total: 0
    };

    stats.forEach(stat => {
      formattedStats[stat._id] = stat.count;
      formattedStats.total += stat.count;
    });

    res.json({ success: true, stats: formattedStats });
  } catch (error) {
    console.error("Get leave stats error:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to fetch leave statistics" });
  }
};