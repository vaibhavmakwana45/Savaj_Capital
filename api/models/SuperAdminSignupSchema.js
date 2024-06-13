const mongoose = require("mongoose");

const SuperAdminSignupSchema = new mongoose.Schema({
  superadmin_id: {
    type: String,
    unique: true,
  },
  firstname: {
    type: String,
  },
  lastname: {
    type: String,
  },
  phonenumber: {
    type: Number,
  },
  email: {
    type: String,
    lowercase: true,
  },
  password: {
    type: String,
  },
  createAt: {
    type: String,
  },
  updateAt: {
    type: String,
  },
});

module.exports = mongoose.model("SuperAdminSignup", SuperAdminSignupSchema);
