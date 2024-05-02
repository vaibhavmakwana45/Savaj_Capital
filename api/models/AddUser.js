const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  user_id: {
    type: String,
    unique: true,
  },
  username: {
    type: String,
  },
  email: {
    type: String,
  },
  number: {
    type: String,
  },
  cibil_score: {
    type: String,
  },
  password: {
    type: String,
  },
  country: {
    type: String,
  },

  unit_address: {
    type: String,
  },
  gst_number: {
    type: String,
  },
  state: {
    type: String,
  },
  city: {
    type: String,
  },
  pan_card: {
    type: String,
  },
  aadhar_card: {
    type: Number,
  },
  dob: {
    type: String,
  },
  country_code: {
    type: String,
  },
  state_code: {
    type: String,
  },
  createdAt: {
    type: String,
  },
  updatedAt: {
    type: String,
  },
});

module.exports = mongoose.model("AllUser", UserSchema);
