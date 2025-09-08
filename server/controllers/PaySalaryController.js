// server/controllers/salaryController.js
import Salary from "../models/Salary.js";

export const getSalaries = async (req, res) => {
  try {
    const salaries = await Salary.find().sort({ createdAt: -1 });
    res.status(200).json(salaries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const addSalary = async (req, res) => {
  try {
    const { employeeId, salary, allowance, deduction, total, payDate } = req.body;
    const newSalary = new Salary({
      employeeId,
      salary,
      allowance,
      deduction,
      total,
      payDate,
    });
    await newSalary.save();
    res.status(201).json({ success: true, salary: newSalary });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
