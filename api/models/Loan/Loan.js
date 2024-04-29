const mongoose = require("mongoose");

const LoanSchema = new mongoose.Schema({
  loan_id: { type: String },
  loan: { type: String },
  is_subtype: { type: Boolean },
  loan_step_id: { type: Array },
  createdAt: { type: String },
  updatedAt: { type: String },
});

module.exports = mongoose.model("loan", LoanSchema);
