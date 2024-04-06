const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  notification_id: {
    type: String
  },
  userId: {
    type: String
  },
  users_ids: [
    {
      type: String
    }
  ],
  adminId: {
    type: String
  },
  projectId: {
    type: String
  },
  formId: {
    type: String
  },
  actionType: {
    type: String
  },
  isUnRead: {
    type: Boolean,
    default: true
  },
  createAt: {
    type: String
  },
  updateAt: {
    type: String
  }
});

module.exports = mongoose.model('Notification', notificationSchema);
