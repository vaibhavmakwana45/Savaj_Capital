const mongoose = require("mongoose");

const loanStepSchema = new mongoose.Schema({
  loan_step_id: { type: String },
  loan_step: { type: String },
  inputs: { type: Array },
  createdAt: { type: String },
  updatedAt: { type: String },
});

module.exports = mongoose.model("loan_step", loanStepSchema);
