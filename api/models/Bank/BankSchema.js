const mongoose = require("mongoose");

const BankSchema = new mongoose.Schema({
  bank_id: { type: String },
  country: { type: String },
  country_code: { type: String },
  bank_name: { type: String },
  state: { type: String },
  state_code: { type: String },
  city: { type: String },
  branch_name: { type: String },
  mobile: { type: Number },
  email: { type: String },
  adress: { type: String },
  branch_name: { type: String },
  createdAt: { type: String },
  updatedAt: { type: String },
});

module.exports = mongoose.model("Bank", BankSchema);
