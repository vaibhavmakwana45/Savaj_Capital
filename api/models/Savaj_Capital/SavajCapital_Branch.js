const mongoose = require("mongoose");

const SavajCapital_BranchUserSchema = new mongoose.Schema({
  branch_id: { type: String, required: true, unique: true },
  state: { type: String },
  state_code: { type: String },
  city: { type: String },
  branch_name: { type: String },
  mobile: { type: Number },
  email: { type: String },
  adress: { type: String },
  createdAt: { type: String },
  updatedAt: { type: String },
});

module.exports = mongoose.model(
  "Savaj_Capital-Branch",
  SavajCapital_BranchUserSchema
);
