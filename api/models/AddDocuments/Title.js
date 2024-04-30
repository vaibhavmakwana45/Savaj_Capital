const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  title_id: {
    type: String,
  },
  title: {
    type: String,
  },
  createdAt: {
    type: String,
  },
  updatedAt: {
    type: String,
  },
});

module.exports = mongoose.model("title", UserSchema);
