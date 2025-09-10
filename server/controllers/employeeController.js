// controllers/employeeController.js
import User from "../models/User.js";
import Department from "../models/Department.js";

// Add new employee
export const addEmployee = async (req, res) => {
  try {
    const { name, email, password, phone, dateOfBirth, department, salary } = req.body;

    // Check required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: "Name, Email, and Password are required",
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: "Email already exists",
      });
    }

    const newEmployee = new User({
      name,
      email,
      password, // You might want to hash it
      role: "employee",
      phone,
      dateOfBirth,
      department,
      salary,
    });

    await newEmployee.save();

    res.status(201).json({
      success: true,
      employee: newEmployee,
      message: "Employee added successfully",
    });
  } catch (error) {
    console.error("Add employee error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to add employee",
    });
  }
};


// Get all employees
export const getEmployees = async (req, res) => {
  try {
    const employees = await User.find({ role: "employee" })
      .populate("department", "name description")
      .select("-password")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      employees,
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

    // Remove fields that shouldn't be updated directly
    delete updates.password;
    delete updates._id;
    delete updates.role;

    const employee = await User.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    })
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

// Delete employee
export const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await User.findById(id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        error: "Employee not found",
      });
    }

    await User.findByIdAndDelete(id);

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

// Get departments for employee assignment
export const getDepartmentsForEmployees = async (req, res) => {
  try {
    const departments = await Department.find({ isActive: { $ne: false } })
      .select("name description")
      .sort({ name: 1 });

    res.json({
      success: true,
      departments,
    });
  } catch (error) {
    console.error("Get departments error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch departments",
    });
  }
};