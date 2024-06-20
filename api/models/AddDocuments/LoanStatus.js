const mongoose = require("mongoose");

const LoanStatusSchema = new mongoose.Schema({
  loanstatus_id: { type: String },
  loanstatus: { type: String },
  color: { type: String },
  createdAt: { type: String },
  updatedAt: { type: String },
});

module.exports = mongoose.model("loanstatus", LoanStatusSchema);
