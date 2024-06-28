const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  notification_id: { type: String },
  file_id: { type: String },
  branchuser_id: { type: String },
  branch_id: { type: String },
  superadmin_id: { type: String },
  bankuser_id: { type: String },
  bank_id: { type: String },
  loan_id: { type: String },
  message: {
    type: String,
    default: "You have a new file assign.",
  },
  isUnRead: {
    type: Boolean,
    default: true,
  },
  createdAt: { type: String },
  updatedAt: { type: String },
});

module.exports = mongoose.model("Notification", notificationSchema);
