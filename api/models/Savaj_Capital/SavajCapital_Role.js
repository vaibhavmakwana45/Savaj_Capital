const mongoose = require("mongoose");

const SavajCapital_BranchUserSchema = new mongoose.Schema({
  role_id: { type: String, required: true, unique: true },
  role: { type: String },
  createdAt: { type: String },
  updatedAt: { type: String },
});

module.exports = mongoose.model(
  "Savaj_Capital-role",
  SavajCapital_BranchUserSchema
);
