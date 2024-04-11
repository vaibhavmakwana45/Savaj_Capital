const mongoose = require("mongoose");

const LoanTypeSchema = new mongoose.Schema({
  loan_id: { type: String },
  loan_document_id: { type: String },
  loan_document: { type: String },
  loantype_id: { type: String },
  createdAt: { type: String },
  updatedAt: { type: String },
});

module.exports = mongoose.model("loan-documents", LoanTypeSchema);
