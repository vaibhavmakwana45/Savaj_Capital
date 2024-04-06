const mongoose = require("mongoose");

const BankSchema = new mongoose.Schema({
  bank_id: { type: String },
  bank_name: { type: String },
  state: { type: String },
  city: { type: String },
  branch_name: { type: String },
  createdAt: { type: String },
  updatedAt: { type: String },
});

module.exports = mongoose.model("Bank", BankSchema);
