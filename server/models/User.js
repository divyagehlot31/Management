// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "employee"], default: "employee" },
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
    employeeId: { type: String, unique: true, sparse: true },
    dateOfBirth: { type: Date },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    salary: { type: Number, default: 0 },
    joinDate: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Generate employee ID before saving
userSchema.pre("save", async function (next) {
  // Only generate ID for new employee records without existing employeeId
  if (this.isNew && this.role === "employee" && !this.employeeId) {
    try {
      const count = await mongoose.model("User").countDocuments({ role: "employee" });
      this.employeeId = `EMP${String(count + 1).padStart(3, "0")}`;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

export default mongoose.model("User", userSchema);