const mongoose = require("mongoose");

const BankUserSchema = new mongoose.Schema({
  bankuser_id: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  bank_id: { type: String },
  createdAt: { type: Date },
  updatedAt: { type: Date },
});

module.exports = mongoose.model("bank_users", BankUserSchema);
