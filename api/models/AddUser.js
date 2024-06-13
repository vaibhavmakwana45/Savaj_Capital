const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  user_id: {
    type: String,
    unique: true,
  },
  username: {
    type: String,
  },
  businessname: {
    type: String,
  },
  usertype: {
    type: String,
  },
  businessnumber: {
    type: String,
  },
  businessaddress: {
    type: String,
  },
  businessextranumber: {
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
  reference: {
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
  status: {
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
  isActivate: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model("AllUser", UserSchema);
