const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  notification_id: { type: String, required: true },
  file_id: { type: String, required: true },
  branchuser_id: { type: String },
  branch_id: { type: String },
  bankuser_id: { type: String },
  bank_id: { type: String },
  loan_id: { type: String, required: true },
  message: {
    type: String,
    required: true,
    default: "You have a new file assign.",
  },
  isUnRead: {
    type: Boolean,
    default: true,
  },
  createdAt: { type: String, required: true },
  updatedAt: { type: String, required: true },
});

module.exports = mongoose.model("Notification", notificationSchema);
