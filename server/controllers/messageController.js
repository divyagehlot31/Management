// controllers/messageController.js
import { Message } from "../models/Notification.js";
import { Notification } from "../models/Notification.js";
import User from "../models/User.js";

// Get all messages between admin and employee
export const getMessages = async (req, res) => {
  try {
    const userId = req.user._id;
    const isAdmin = req.user.role === "admin";
    let filter = {};

    if (isAdmin) {
      // Admin can see messages with specific employee or all
      const { employeeId } = req.query;
      if (employeeId) {
        filter = {
          $or: [
            { sender: userId, recipient: employeeId },
            { sender: employeeId, recipient: userId }
          ]
        };
      } else {
        // Get all conversations for admin
        filter = {
          $or: [
            { sender: userId },
            { recipient: userId }
          ]
        };
      }
    } else {
      // Employee can only see messages with admin
      const admin = await User.findOne({ role: "admin" });
      if (!admin) {
        return res.status(404).json({
          success: false,
          error: "Admin not found"
        });
      }
      
      filter = {
        $or: [
          { sender: userId, recipient: admin._id },
          { sender: admin._id, recipient: userId }
        ]
      };
    }

    const messages = await Message.find(filter)
      .populate("sender", "name email employeeId")
      .populate("recipient", "name email employeeId")
      .sort({ createdAt: 1 });

    res.json({
      success: true,
      messages,
      count: messages.length
    });
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch messages"
    });
  }
};

// Send message
export const sendMessage = async (req, res) => {
  try {
    const { recipientId, content, messageType = "text" } = req.body;
    const senderId = req.user._id;

    if (!recipientId || !content) {
      return res.status(400).json({
        success: false,
        error: "Recipient and content are required"
      });
    }

    // Verify recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({
        success: false,
        error: "Recipient not found"
      });
    }

    // Check if sender can message this recipient
    const isAdmin = req.user.role === "admin";
    const isEmployee = req.user.role === "employee";
    
    if (isEmployee && recipient.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "Employees can only message admin"
      });
    }

    const message = new Message({
      sender: senderId,
      recipient: recipientId,
      content: content.trim(),
      messageType
    });

    await message.save();
    await message.populate("sender", "name email employeeId");
    await message.populate("recipient", "name email employeeId");

    // Create notification for recipient
    await new Notification({
      recipient: recipientId,
      sender: senderId,
      type: "message",
      title: "New Message",
      message: `${req.user.name} sent you a message`,
      relatedId: message._id,
      relatedModel: "Message"
    }).save();

    res.status(201).json({
      success: true,
      message,
      message: "Message sent successfully"
    });
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to send message"
    });
  }
};

// Mark messages as read
export const markMessagesAsRead = async (req, res) => {
  try {
    const { messageIds } = req.body;
    const userId = req.user._id;

    if (!messageIds || !Array.isArray(messageIds)) {
      return res.status(400).json({
        success: false,
        error: "Message IDs array is required"
      });
    }

    await Message.updateMany(
      {
        _id: { $in: messageIds },
        recipient: userId,
        isRead: false
      },
      { isRead: true }
    );

    res.json({
      success: true,
      message: "Messages marked as read"
    });
  } catch (error) {
    console.error("Mark messages as read error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to mark messages as read"
    });
  }
};

// Get chat participants for admin (list of employees they've chatted with)
export const getChatParticipants = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "Admin access required"
      });
    }

    const adminId = req.user._id;

    // Get unique employee IDs from messages
    const participantIds = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: adminId },
            { recipient: adminId }
          ]
        }
      },
      {
        $group: {
          _id: null,
          employees: {
            $addToSet: {
              $cond: [
                { $eq: ["$sender", adminId] },
                "$recipient",
                "$sender"
              ]
            }
          }
        }
      }
    ]);

    let employeeIds = [];
    if (participantIds.length > 0) {
      employeeIds = participantIds[0].employees;
    }

    // Get employee details
    const employees = await User.find({
      _id: { $in: employeeIds },
      role: "employee"
    })
    .select("name email employeeId")
    .sort({ name: 1 });

    // Get last message with each employee
    const participantsWithLastMessage = await Promise.all(
      employees.map(async (employee) => {
        const lastMessage = await Message.findOne({
          $or: [
            { sender: adminId, recipient: employee._id },
            { sender: employee._id, recipient: adminId }
          ]
        })
        .sort({ createdAt: -1 })
        .populate("sender", "name");

        const unreadCount = await Message.countDocuments({
          sender: employee._id,
          recipient: adminId,
          isRead: false
        });

        return {
          employee,
          lastMessage,
          unreadCount
        };
      })
    );

    res.json({
      success: true,
      participants: participantsWithLastMessage
    });
  } catch (error) {
    console.error("Get chat participants error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch chat participants"
    });
  }
};
