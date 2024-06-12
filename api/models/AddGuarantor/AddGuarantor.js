const mongoose = require("mongoose");

const GuarantorSchema = new mongoose.Schema({
  guarantor_id: { type: String },
  file_id: { type: String },
  user_id: { type: String },
  username: { type: String },
  number: { type: String },
  email: { type: String },
  aadhar_card: { type: String },
  pan_card: { type: String },
  unit_address: { type: String },
  occupation: { type: String },
  reference: { type: String },
  createdAt: {
    type: String,
  },
  updatedAt: {
    type: String,
  },
});

module.exports = mongoose.model("Guarantor", GuarantorSchema);
