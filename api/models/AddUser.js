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
    lowercase: true,
  },
  number: {
    type: String,
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

module.exports = mongoose.model("AllUser", UserSchema);
