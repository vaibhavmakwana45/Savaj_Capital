const mongoose = require("mongoose");
const moment = require("moment");

const BankSchema = new mongoose.Schema({
  bank_assign_id: { type: String },
  file_id: { type: String },
  loan_id: { type: String },
  loantype_id: { type: String },
  bank_assign_date: { type: String },
  bank_id: { type: String },
  bankuser_id: { type: String },
  bank_status: { type: Array },
  loan_status: {
    type: Array,
    default: function () {
      return [
        {
          message: "Your file is assign to bank",
          date: moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss"),
          is_bank_assing: true,
        },
      ];
    },
  },
  reason: { type: String },
});

module.exports = mongoose.model("Bank-Approval", BankSchema);
