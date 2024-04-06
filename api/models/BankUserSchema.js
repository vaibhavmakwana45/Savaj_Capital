const mongoose = require("mongoose");

const BankUserSchema = new mongoose.Schema({
  bankuser_id: { type: String },
  email: { type: String },
  password: { type: String },
  bank_id: { type: String },
  createdAt: { type: String },
  updatedAt: { type: String },
});

module.exports = mongoose.model("bank-users", BankUserSchema);
