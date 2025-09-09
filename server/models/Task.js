import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium"
    },
    status: {
      type: String,
      enum: ["pending", "in_progress", "completed", "cancelled"],
      default: "pending"
    },
    dueDate: {
      type: Date,
      required: true
    },
    category: {
      type: String,
      trim: true,
      default: "General"
    },
    attachments: [{
      filename: String,
      originalName: String,
      fileUrl: String,
      uploadedAt: { type: Date, default: Date.now }
    }],
    comments: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      message: String,
      createdAt: { type: Date, default: Date.now }
    }],
    completedAt: {
      type: Date,
      default: null
    },
    submissionNote: {
      type: String,
      trim: true
    },
    submissionFiles: [{
      filename: String,
      originalName: String,
      fileUrl: String,
      uploadedAt: { type: Date, default: Date.now }
    }],
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Index for better query performance
taskSchema.index({ assignedTo: 1, status: 1 });
taskSchema.index({ assignedBy: 1 });
taskSchema.index({ dueDate: 1 });

export default mongoose.model("Task", taskSchema);