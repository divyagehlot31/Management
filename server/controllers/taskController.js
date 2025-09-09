// controllers/taskController.js
import Task from "../models/Task.js";
import User from "../models/User.js";
import { Notification } from "../models/Notification.js";

// Create notification helper function
const createNotification = async (recipient, sender, type, title, message, relatedId = null, relatedModel = null) => {
  try {
    await new Notification({
      recipient,
      sender,
      type,
      title,
      message,
      relatedId,
      relatedModel
    }).save();
  } catch (error) {
    console.error("Notification creation error:", error);
  }
};

// Get all tasks (Admin view)
export const getAllTasks = async (req, res) => {
  try {
    const { status, priority, assignedTo } = req.query;
    let filter = {};

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignedTo) filter.assignedTo = assignedTo;

    const tasks = await Task.find(filter)
      .populate("assignedTo", "name email employeeId")
      .populate("assignedBy", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      tasks,
      count: tasks.length
    });
  } catch (error) {
    console.error("Get all tasks error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch tasks"
    });
  }
};

// Get tasks for specific user (Employee view)
export const getUserTasks = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status } = req.query;
    
    let filter = { assignedTo: userId };
    if (status) filter.status = status;

    const tasks = await Task.find(filter)
      .populate("assignedBy", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      tasks,
      count: tasks.length
    });
  } catch (error) {
    console.error("Get user tasks error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch tasks"
    });
  }
};

// Create new task (Admin only)
export const createTask = async (req, res) => {
  try {
    const { title, description, assignedTo, priority, dueDate, category } = req.body;
    const assignedBy = req.user._id;

    // Validate required fields
    if (!title || !description || !assignedTo || !dueDate) {
      return res.status(400).json({
        success: false,
        error: "Title, description, assigned user, and due date are required"
      });
    }

    // Check if assigned user exists and is an employee
    const employee = await User.findById(assignedTo);
    if (!employee || employee.role !== "employee") {
      return res.status(400).json({
        success: false,
        error: "Invalid employee selected"
      });
    }

    const task = new Task({
      title,
      description,
      assignedTo,
      assignedBy,
      priority: priority || "medium",
      dueDate,
      category: category || "General"
    });

    await task.save();

    // Populate the task for response
    await task.populate("assignedTo", "name email employeeId");
    await task.populate("assignedBy", "name email");

    // Create notification for employee
    await createNotification(
      assignedTo,
      assignedBy,
      "task_assigned",
      "New Task Assigned",
      `You have been assigned a new task: ${title}`,
      task._id,
      "Task"
    );

    res.status(201).json({
      success: true,
      task,
      message: "Task created successfully"
    });
  } catch (error) {
    console.error("Create task error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create task"
    });
  }
};

// Get single task
export const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const task = await Task.findById(id)
      .populate("assignedTo", "name email employeeId")
      .populate("assignedBy", "name email")
      .populate("comments.user", "name email");

    if (!task) {
      return res.status(404).json({
        success: false,
        error: "Task not found"
      });
    }

    // Check access rights
    const isAdmin = req.user.role === "admin";
    const isAssignedUser = task.assignedTo._id.toString() === req.user._id.toString();
    
    if (!isAdmin && !isAssignedUser) {
      return res.status(403).json({
        success: false,
        error: "Access denied"
      });
    }

    res.json({
      success: true,
      task
    });
  } catch (error) {
    console.error("Get task error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch task"
    });
  }
};

// Update task (Admin can update any field, Employee can only update status and add comments)
export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const userId = req.user._id;
    const isAdmin = req.user.role === "admin";

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        error: "Task not found"
      });
    }

    const isAssignedUser = task.assignedTo.toString() === userId.toString();
    
    if (!isAdmin && !isAssignedUser) {
      return res.status(403).json({
        success: false,
        error: "Access denied"
      });
    }

    // If employee, restrict what they can update
    if (!isAdmin && isAssignedUser) {
      const allowedFields = ["status", "submissionNote", "submissionFiles"];
      const updateKeys = Object.keys(updates);
      const invalidFields = updateKeys.filter(key => !allowedFields.includes(key));
      
      if (invalidFields.length > 0) {
        return res.status(400).json({
          success: false,
          error: `Employees can only update: ${allowedFields.join(", ")}`
        });
      }
      
      // If marking as completed, set completedAt
      if (updates.status === "completed") {
        updates.completedAt = new Date();
      }
    }

    const updatedTask = await Task.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true
    })
      .populate("assignedTo", "name email employeeId")
      .populate("assignedBy", "name email");

    // Create notification if status changed
    if (updates.status && updates.status !== task.status) {
      let notificationTitle = "";
      let notificationMessage = "";
      let recipientId = null;

      if (isAdmin) {
        // Admin updated task, notify employee
        recipientId = task.assignedTo;
        notificationTitle = "Task Updated";
        notificationMessage = `Task "${task.title}" status changed to ${updates.status}`;
      } else {
        // Employee updated task, notify admin
        recipientId = task.assignedBy;
        notificationTitle = "Task Status Updated";
        notificationMessage = `${req.user.name} updated task "${task.title}" status to ${updates.status}`;
      }

      await createNotification(
        recipientId,
        userId,
        "task_updated",
        notificationTitle,
        notificationMessage,
        task._id,
        "Task"
      );
    }

    res.json({
      success: true,
      task: updatedTask,
      message: "Task updated successfully"
    });
  } catch (error) {
    console.error("Update task error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update task"
    });
  }
};

// Delete task (Admin only)
export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        error: "Task not found"
      });
    }

    await Task.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Task deleted successfully"
    });
  } catch (error) {
    console.error("Delete task error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete task"
    });
  }
};

// Add comment to task
export const addTaskComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const userId = req.user._id;

    if (!message || message.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "Comment message is required"
      });
    }

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        error: "Task not found"
      });
    }

    // Check access
    const isAdmin = req.user.role === "admin";
    const isAssignedUser = task.assignedTo.toString() === userId.toString();
    
    if (!isAdmin && !isAssignedUser) {
      return res.status(403).json({
        success: false,
        error: "Access denied"
      });
    }

    task.comments.push({
      user: userId,
      message: message.trim()
    });

    await task.save();

    // Populate the new comment
    await task.populate("comments.user", "name email");

    // Notify the other party
    const recipientId = isAdmin ? task.assignedTo : task.assignedBy;
    await createNotification(
      recipientId,
      userId,
      "task_updated",
      "New Comment on Task",
      `${req.user.name} commented on task "${task.title}"`,
      task._id,
      "Task"
    );

    res.json({
      success: true,
      task,
      message: "Comment added successfully"
    });
  } catch (error) {
    console.error("Add comment error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to add comment"
    });
  }
};

// Get task statistics
export const getTaskStats = async (req, res) => {
  try {
    const isAdmin = req.user.role === "admin";
    let matchFilter = {};
    
    // If employee, only show their tasks
    if (!isAdmin) {
      matchFilter.assignedTo = req.user._id;
    }

    const stats = await Task.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    const statusCounts = {
      pending: 0,
      in_progress: 0,
      completed: 0,
      cancelled: 0
    };

    stats.forEach(stat => {
      statusCounts[stat._id] = stat.count;
    });

    const totalTasks = Object.values(statusCounts).reduce((sum, count) => sum + count, 0);

    res.json({
      success: true,
      stats: {
        ...statusCounts,
        total: totalTasks
      }
    });
  } catch (error) {
    console.error("Get task stats error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch task statistics"
    });
  }
};