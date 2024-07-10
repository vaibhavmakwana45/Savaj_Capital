const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  user_id: {
    type: String,
  },
  loan_id: {
    type: String,
  },
  loantype_id: {
    type: String,
  },
  loan_document_id: {
    type: String,
  },
  file_id: {
    type: String,
  },
  branchuser_id: {
    type: String,
  },
  documents: {
    type: Array,
  },
  branch_id: {
    type: String,
  },
  amount: {
    type: String,
  },
  note: {
    type: String,
  },
  start_date: {
    type: String,
  },
  end_date: {
    type: String,
  },
  createdAt: {
    type: String,
  },
  updatedAt: {
    type: String,
  },
  logs: { type: Array },
  status: {
    type: String,
    // enum: ["running", "approved", "rejected"],
    default: "1718861587262",
  },
});

module.exports = mongoose.model("file-uplode", UserSchema);
