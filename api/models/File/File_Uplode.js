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
  documents: {
    type: Array,
  },
  createdAt: {
    type: String,
  },
  updatedAt: {
    type: String,
  },
});

module.exports = mongoose.model("file-uplode", UserSchema);