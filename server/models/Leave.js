// models/Leave.js - Improved version
import mongoose from "mongoose";

const leaveSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    leaveType: {
      type: String,
      enum: ["sick", "casual", "emergency", "maternity", "vacation", "other"],
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
      validate: {
        validator: function(value) {
          return value >= this.startDate;
        },
        message: 'End date must be greater than or equal to start date'
      }
    },
    totalDays: {
      type: Number,
      required: true,
      min: 1,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
      minlength: [10, 'Reason must be at least 10 characters long'],
      maxlength: [500, 'Reason must not exceed 500 characters']
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    appliedDate: {
      type: Date,
      default: Date.now,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reviewedAt: {
      type: Date,
    },
    adminComments: {
      type: String,
      trim: true,
      maxlength: [500, 'Admin comments must not exceed 500 characters']
    },
  },
  { timestamps: true }
);

// Static method to calculate total days
leaveSchema.statics.calculateTotalDays = function(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Normalize dates to avoid timezone issues
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  
  const timeDiff = end.getTime() - start.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
};

// Pre-save hook to calculate total days
leaveSchema.pre("save", function (next) {
  if (this.startDate && this.endDate) {
    try {
      this.totalDays = this.constructor.calculateTotalDays(this.startDate, this.endDate);
      console.log(`Calculated totalDays: ${this.totalDays} for leave from ${this.startDate} to ${this.endDate}`);
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next(new Error("Start date and end date are required"));
  }
});

// Pre-validation hook to ensure dates are valid
leaveSchema.pre("validate", function (next) {
  if (this.startDate && this.endDate) {
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return next(new Error("Invalid date format"));
    }
    
    if (end < start) {
      return next(new Error("End date cannot be before start date"));
    }
  }
  next();
});

// Index for better query performance
leaveSchema.index({ employee: 1, status: 1 });
leaveSchema.index({ appliedDate: -1 });

export default mongoose.model("Leave", leaveSchema);