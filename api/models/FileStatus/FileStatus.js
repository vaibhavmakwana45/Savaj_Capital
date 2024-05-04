const mongoose = require("mongoose");

const StatusSchema = new mongoose.Schema({
  file_id: { type: String },
  user_id: { type: String},
  loan_status: [
    {
      status_id: { type: String },
      reason: { type: String},
      status_img: { type: String },
    },
  ],
  createdAt: {
    type: String,
  },
  updatedAt: {
    type: String,
  },
});

module.exports = mongoose.model("File-Status", StatusSchema);
