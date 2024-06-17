const mongoose = require("mongoose");

const BankUserSchema = new mongoose.Schema({
  bankuser_id: { type: String },
  bankuser_name: { type: String },
  bank_id: { type: String },
  email: { type: String },
  state: { type: String },
  city: { type: String },
  country_code: { type: String },
  state_code: { type: String },
  password: { type: String, default: "" },
  adress: { type: String, default: "" },
  dob: { type: String, default: "" },
  mobile: { type: Number, default: null },
  adhar: { type: Number, default: null },
  emergancy_contact: { type: Number, default: null },
  createdAt: { type: String },
  updatedAt: { type: String },
});

module.exports = mongoose.model("bank-users", BankUserSchema);
