const mongoose = require("mongoose");

const SavajCapitalUserSchema = new mongoose.Schema({
  savajcapitaluser_id: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  savajcapitalbranch_id: { type: String, required: true },
  createdAt: { type: String },
  updatedAt: { type: String },
});

module.exports = mongoose.model("Savaj_Capital_User", SavajCapitalUserSchema);
