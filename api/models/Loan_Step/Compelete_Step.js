const mongoose = require("mongoose");

const compeleteStepSchema = new mongoose.Schema({
  compelete_step_id: { type: String },
  loan_step_id: { type: String },
  file_id: { type: String },
  loan_step: { type: String },
  inputs: { type: Array },
  status: { type: String },
  createdAt: { type: String },
  updatedAt: { type: String },
});

module.exports = mongoose.model("complete_step", compeleteStepSchema);
