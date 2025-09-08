// server/controllers/salaryController.js
import Salary from "../models/Salary.js";

// Get all salaries
export const getSalaries = async (req, res) => {
  try {
    const salaries = await Salary.find().sort({ createdAt: -1 });
    res.status(200).json(salaries);
  } catch (error) {
    console.error("Error fetching salaries:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Optional: Add new salary (if needed)
export const addSalary = async (req, res) => {
  try {
    const { employeeId, salary, allowance, deduction, total, payDate } = req.body;
    const newSalary = new Salary({ employeeId, salary, allowance, deduction, total, payDate });
    await newSalary.save();
    res.status(201).json(newSalary);
  } catch (error) {
    console.error("Error adding salary:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
