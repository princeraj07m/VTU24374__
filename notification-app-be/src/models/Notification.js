import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  student_id: {
    type: String,
    required: true,
    trim: true,
  },
  notification_type: {
    type: String,
    required: true,
    enum: ["Placement", "Result", "Event"],
  },
  message: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  is_read: {
    type: Boolean,
    default: false,
  },
});

notificationSchema.index({ notification_type: 1, timestamp: -1 });
notificationSchema.index({ timestamp: -1 });
notificationSchema.index({ message: "text" });

export default mongoose.model("Notification", notificationSchema, "notifications");
