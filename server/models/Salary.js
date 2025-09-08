import mongoose from "mongoose";

const salarySchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
  },
  salary: {
    type: Number,
    required: true,
  },
  allowance: {
    type: Number,
    default: 0,
  },
  deduction: {
    type: Number,
    default: 0,
  },
  total: {
    type: Number,
    required: true,
  },
  payDate: {
    type: String, // you can change to Date if you prefer
    required: true,
  },
}, { timestamps: true });

const Salary = mongoose.model("Salary", salarySchema);

export default Salary;
