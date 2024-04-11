const mongoose = require("mongoose");

const LoanType_Schema = new mongoose.Schema({
  loantype_id: { type: String },
  loan_id: { type: String },
  loan_type: { type: String },
  createdAt: { type: String },
  updatedAt: { type: String },
});

module.exports = mongoose.model("loan-type", LoanType_Schema);
