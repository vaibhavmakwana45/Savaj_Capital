const mongoose = require("mongoose");

const BankSchema = new mongoose.Schema({
  bank_id: { type: String, required: true, unique: true },
  bank_name: { type: String, required: true },
  state: { type: String, required: true },
  city: { type: String, required: true },
  branch_name: { type: String, required: true },
  createdAt: { type: String },
  updatedAt: { type: String },
});

module.exports = mongoose.model("Bank", BankSchema);
