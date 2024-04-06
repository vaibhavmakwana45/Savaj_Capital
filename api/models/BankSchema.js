const mongoose = require("mongoose");

const BankSchema = new mongoose.Schema({
  bank_id: { type: String, required: true, unique: true },
  bank_name: { type: String, required: true },
  state: { type: String, required: true },
  city: { type: String, required: true },
  branch_name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Bank", BankSchema);
