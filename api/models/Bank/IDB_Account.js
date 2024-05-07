const mongoose = require("mongoose");

const IDBAccountSchema = new mongoose.Schema({
  account_id: { type: String },
  file_id: { type: String },
  user_id: { type: String },
  account_number: { type: String },
  ifc_number: { type: String },
  name: { type: String },
  status: { type: String },
  createdAt: { type: String },
  updatedAt: { type: String },
});

module.exports = mongoose.model("IDB_Account", IDBAccountSchema);
