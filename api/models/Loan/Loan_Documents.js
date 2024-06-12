const mongoose = require("mongoose");

const LoanTypeSchema = new mongoose.Schema({
  loan_document_id: { type: String },
  title_id: { type: String },
  loan_id: { type: String },
  loantype_id: { type: String },
  title: { type: String },
  index: { type: String },
  document_ids: [{ type: String }],
  createdAt: { type: String },
  updatedAt: { type: String },
  index: { type: String },
});

module.exports = mongoose.model("loan-documents", LoanTypeSchema);
