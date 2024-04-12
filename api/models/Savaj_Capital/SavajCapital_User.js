const mongoose = require("mongoose");

const SavajCapital_UserSchema = new mongoose.Schema({
  branchuser_id: { type: String },
  role_id: { type: String },
  branch_id: { type: String },
  full_name: { type: String },
  email: { type: String },
  password: { type: String },

  mobile: { type: Number },
  dob: { type: String },
  address: { type: String },
  email: { type: String },
  aadhar: { type: Number },

  createdAt: { type: String },
  updatedAt: { type: String },
});

module.exports = mongoose.model("Savaj_Capital-users", SavajCapital_UserSchema);
