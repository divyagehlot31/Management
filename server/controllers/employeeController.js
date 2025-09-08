// controllers/employeeController.js
import User from "../models/User.js";
import Department from "../models/Department.js";

// Get all departments (for employees assignment)
export const getDepartmentsForEmployees = async (req, res) => {
  try {
    const departments = await Department.find().select("name description");

    res.json({
      success: true,
      departments,
      count: departments.length,
    });
  } catch (error) {
    console.error("Get departments error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch departments",
    });
  }
};


// Get all employees
export const getEmployees = async (req, res) => {
  try {
    const employees = await User.find({ role: "employee" })
      .populate("department", "name description") // Populate department info
      .select("-password")
      .sort({ createdAt: -1 });

    // ✅ FIXED: Keep consistent format - don't transform to string
    // Frontend will handle department display logic
    res.json({
      success: true,
      employees: employees,  // Return populated objects as-is
      count: employees.length,
    });
  } catch (error) {
    console.error("Get employees error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch employees",
    });
  }
};

// Get single employee by ID
export const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Admin can view any employee, employee can only view self
    if (req.user.role !== "admin" && req.user._id.toString() !== id) {
      return res.status(403).json({
        success: false,
        error: "Access denied",
      });
    }

    const employee = await User.findById(id)
      .populate("department", "name description")
      .select("-password");
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        error: "Employee not found",
      });
    }

    res.json({
      success: true,
      employee,
    });
  } catch (error) {
    console.error("Get employee error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch employee",
    });
  }
};

// Update employee
export const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    console.log("Update request for employee:", id);
    console.log("Update data received:", updates);

    // Admin can update any employee, employee can only update self
    if (req.user.role !== "admin" && req.user._id.toString() !== id) {
      return res.status(403).json({
        success: false,
        error: "Access denied",
      });
    }

    // Don't allow password updates through this route
    if (updates.password) {
      delete updates.password;
    }

    // Don't allow role changes by non-admin users
    if (req.user.role !== "admin" && updates.role) {
      delete updates.role;
    }

    // ✅ FIXED: Better department handling
    if (updates.department !== undefined) {
      if (updates.department === "" || updates.department === null) {
        updates.department = null; // Allow removing department
      } else if (typeof updates.department === 'string') {
        // Check if it's a valid ObjectId format
        const mongoose = await import('mongoose');
        if (mongoose.default.Types.ObjectId.isValid(updates.department)) {
          // It's already an ObjectId, keep as-is
          console.log("Department is valid ObjectId:", updates.department);
        } else {
          // It's a department name, find the ObjectId
          const department = await Department.findOne({ name: updates.department });
          if (!department) {
            return res.status(400).json({
              success: false,
              error: "Department not found",
            });
          }
          updates.department = department._id;
        }
      }
    }

    console.log("Final update data:", updates);

    const employee = await User.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    )
    .populate("department", "name description") // ✅ Always populate after update
    .select("-password");

    if (!employee) {
      return res.status(404).json({
        success: false,
        error: "Employee not found",
      });
    }

    console.log("Updated employee:", employee);

    res.json({
      success: true,
      employee,
      message: "Employee updated successfully",
    });
  } catch (error) {
    console.error("Update employee error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update employee",
    });
  }
};

// Delete employee (admin only)
export const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await User.findByIdAndDelete(id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        error: "Employee not found",
      });
    }

    res.json({
      success: true,
      message: "Employee deleted successfully",
    });
  } catch (error) {
    console.error("Delete employee error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete employee",
    });
  }
};