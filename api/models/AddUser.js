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
  password: {
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
