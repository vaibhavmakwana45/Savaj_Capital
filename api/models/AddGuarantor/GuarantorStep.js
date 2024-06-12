const mongoose = require("mongoose");

const GuarantorStepSchema = new mongoose.Schema({
  guarantor_id: { type: String },
  compelete_step_id: { type: String },
  guarantor_id: { type: String },
  loan_step_id: { type: String },
  file_id: { type: String },
  user_id: { type: String },
  loan_step: { type: String },
  status: { type: String },
  inputs: { type: Array },
  createdAt: { type: String },
  updatedAt: { type: String },
});

module.exports = mongoose.model("guarantor_step", GuarantorStepSchema);
