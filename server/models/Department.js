// models/Department.js
import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    // ✅ FIXED: Changed from 'head' to 'headOfDepartment' to match controller
    headOfDepartment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to User model
      default: null
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model("Department", departmentSchema);