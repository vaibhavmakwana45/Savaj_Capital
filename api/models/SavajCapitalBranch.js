const mongoose = require("mongoose");

const SavajCapitalSchema = new mongoose.Schema({
  savajcapitalbranch_id: { type: String, required: true, unique: true },
  savajcapitalbranch_name: { type: String, required: true },
  state: { type: String, required: true },
  city: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Savaj_Capital_Branch", SavajCapitalSchema);
