const mongoose = require("mongoose");

const DocumentSchema = new mongoose.Schema({
  document_id: { type: String },
  document: { type: String },
  createdAt: { type: String },
  updatedAt: { type: String },
});
      
module.exports = mongoose.model("documents", DocumentSchema);
