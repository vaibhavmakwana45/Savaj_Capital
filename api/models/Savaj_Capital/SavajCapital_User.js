const mongoose = require("mongoose");

const SavajCapital_UserSchema = new mongoose.Schema({
  branchuser_id: { type: String },
  role_id: { type: String },
  branch_id: { type: String },
  email: { type: String },
  password: { type: String },
  createdAt: { type: String },
  updatedAt: { type: String },
});

module.exports = mongoose.model("Savaj_Capital-users", SavajCapital_UserSchema);
