
// models/Message.js
const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    content: {
      type: String,
      required: true,
      trim: true
    },
    messageType: {
      type: String,
      enum: ["text", "file", "image"],
      default: "text"
    },
    attachments: [{
      filename: String,
      originalName: String,
      fileUrl: String,
      fileType: String,
      fileSize: Number,
      uploadedAt: { type: Date, default: Date.now }
    }],
    isRead: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: true
    },
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message"
    }
  },
  {
    timestamps: true
  }
);

// Index for chat queries
messageSchema.index({ sender: 1, recipient: 1, createdAt: -1 });
messageSchema.index({ recipient: 1, isRead: 1 });

export const Message = mongoose.model("Message", messageSchema);