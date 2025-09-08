// controllers/departmentController.js
import Department from "../models/Department.js";
import User from "../models/User.js";

// Add this function to your departmentController.js

// Get departments for public registration (no auth required)
export const getPublicDepartments = async (req, res) => {
  try {
    const departments = await Department.find({ isActive: { $ne: false } })
      .select("name description")
      .sort({ name: 1 });

    res.json({
      success: true,
      data: departments,
      departments: departments, // For compatibility
    });
  } catch (error) {
    console.error("Get public departments error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch departments",
    });
  }
};

// Get all departments
export const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find()
      .populate("headOfDepartment", "name email")
      .sort({ createdAt: -1 })
      .lean();

    // Calculate employee count dynamically
    const departmentsWithCount = await Promise.all(
      departments.map(async (dept) => {
        const employeeCount = await User.countDocuments({
          department: dept._id,
          role: "employee",
        });
        return { ...dept, employeeCount };
      })
    );

    // ✅ FIXED: Return consistent response structure
    res.json({
      success: true,
      data: departmentsWithCount,          // For frontend compatibility
      departments: departmentsWithCount,   // For alternative usage
      count: departmentsWithCount.length,
    });
  } catch (error) {
    console.error("Get departments error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch departments",
    });
  }
};

// Get single department by ID
export const getDepartmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const department = await Department.findById(id)
      .populate("headOfDepartment", "name email employeeId")
      .lean();

    if (!department) {
      return res.status(404).json({
        success: false,
        error: "Department not found",
      });
    }

    const employees = await User.find({
      department: id,
      role: "employee",
    }).select("name email employeeId");

    res.json({
      success: true,
      department: {
        ...department,
        employees,
        employeeCount: employees.length,
      },
    });
  } catch (error) {
    console.error("Get department error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch department",
    });
  }
};

// Create new department
export const createDepartment = async (req, res) => {
  try {
    const { name, description, headOfDepartment } = req.body;

    const existingDepartment = await Department.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });

    if (existingDepartment) {
      return res.status(400).json({
        success: false,
        error: "Department already exists",
      });
    }

    if (headOfDepartment) {
      const user = await User.findById(headOfDepartment);
      if (!user) {
        return res.status(400).json({
          success: false,
          error: "Selected head of department not found",
        });
      }
    }

    const department = await Department.create({
      name,
      description,
      headOfDepartment: headOfDepartment || null,
    });

    await department.populate("headOfDepartment", "name email");

    res.status(201).json({
      success: true,
      department,
      message: "Department created successfully",
    });
  } catch (error) {
    console.error("Create department error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create department",
    });
  }
};

// Update department
export const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.name) {
      const existingDepartment = await Department.findOne({
        name: { $regex: new RegExp(`^${updates.name}$`, "i") },
        _id: { $ne: id },
      });

      if (existingDepartment) {
        return res.status(400).json({
          success: false,
          error: "Department name already exists",
        });
      }
    }

    if (updates.headOfDepartment) {
      const user = await User.findById(updates.headOfDepartment);
      if (!user) {
        return res.status(400).json({
          success: false,
          error: "Selected head of department not found",
        });
      }
    }

    const department = await Department.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).populate("headOfDepartment", "name email");

    if (!department) {
      return res.status(404).json({
        success: false,
        error: "Department not found",
      });
    }

    res.json({
      success: true,
      department,
      message: "Department updated successfully",
    });
  } catch (error) {
    console.error("Update department error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update department",
    });
  }
};

// Delete department
export const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;

    const department = await Department.findById(id);
    if (!department) {
      return res.status(404).json({
        success: false,
        error: "Department not found",
      });
    }

    const employeeCount = await User.countDocuments({
      department: id,
      role: "employee",
    });

    if (employeeCount > 0) {
      return res.status(400).json({
        success: false,
        error: `Cannot delete department. ${employeeCount} employee(s) are assigned.`,
      });
    }

    await Department.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Department deleted successfully",
    });
  } catch (error) {
    console.error("Delete department error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete department",
    });
  }
};

// Get available employees for head of department
export const getAvailableHeads = async (req, res) => {
  try {
    const currentHeads = await Department.find({
      headOfDepartment: { $ne: null },
    }).distinct("headOfDepartment");

    const availableEmployees = await User.find({
      role: { $in: ["employee", "admin"] },
      _id: { $nin: currentHeads },
    }).select("name email employeeId");

    res.json({
      success: true,
      employees: availableEmployees,
    });
  } catch (error) {
    console.error("Get available heads error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch available employees",
    });
  }
};