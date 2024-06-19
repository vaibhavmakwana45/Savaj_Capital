const mongoose = require("mongoose");
const moment = require("moment");

const BranchSchema = new mongoose.Schema({
  branch_assign_id: { type: String },
  file_id: { type: String },
  user_id: { type: String },
  loan_id: { type: String },
  loantype_id: { type: String },
  branch_assign_date: { type: String },
  branch_id: { type: String },
  branchuser_id: { type: String },
  loan_status: {
    type: Array,
    default: function () {
      return [
        {
          message: "Your file is assign to branch",
          date: moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss"),
          is_bank_assing: true,
        },
      ];
    },
  },
  reason: { type: String },
  createdAt: { type: String },
  updatedAt: { type: String },
});

module.exports = mongoose.model("ScBranch-Assign", BranchSchema);
