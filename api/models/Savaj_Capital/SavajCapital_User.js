const mongoose = require("mongoose");

const SavajCapital_UserSchema = new mongoose.Schema({
  branchuser_id: { type: String },
  role_id: { type: String },
  loan_ids: [{ type: String }],
  branch_id: { type: String },
  full_name: { type: String },
  aadhar_card: { type: String },
  state: { type: String },
  city: { type: String },
  pan_card: { type: String },
  email: { type: String },
  number: { type: String },
  password: { type: String },
  mobile: { type: Number },
  dob: { type: String },
  address: { type: String },
  email: { type: String },
  aadhar: { type: Number },
  createdAt: { type: String },
  updatedAt: { type: String },
  add_customers: { type: Boolean, default: false },
  add_files: { type: Boolean, default: false },
  view_files: { type: Boolean, default: false },
  edit_files: { type: Boolean, default: false },
  delete_files: { type: Boolean, default: false },
  status_change_files: { type: Boolean, default: false },
  assign_files: { type: Boolean, default: false },
});

module.exports = mongoose.model("Savaj_Capital-users", SavajCapital_UserSchema);
