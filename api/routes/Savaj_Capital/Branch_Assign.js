const express = require("express");
const router = express.Router();
const moment = require("moment");
const BranchAssign = require("../../models/Savaj_Capital/Branch_Assign");
const File_Uplode = require("../../models/File/File_Uplode");
const User = require("../../models/AddUser");
const Loan = require("../../models/Loan/Loan");
const Loan_Type = require("../../models/Loan/Loan_Type");

router.post("/", async (req, res) => {
  try {
    const timestamp = Date.now();
    const uniqueId = `${timestamp}`;
    const currentDate = moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss");

    req.body["branch_assign_id"] = uniqueId;
    req.body["branch_assign_date"] = moment()
      .utcOffset(330)
      .format("YYYY-MM-DD HH:mm:ss");
    req.body["createdAt"] = currentDate;
    req.body["updatedAt"] = currentDate;
    var data = await BranchAssign.create(req.body);
    res.json({
      success: true,
      data: data,
      message: "Documents assigned to the bank successfully.",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

// router.put("/:bank_assign_id", async (req, res) => {
//   try {
//     const { bank_assign_id } = req.params;

//     // Ensure that updatedAt field is set
//     const result = await BranchAssign.findOneAndUpdate(
//       { bank_assign_id: bank_assign_id },
//       { $push: req.body }, // Use $push to add new objects to the arrays
//       { new: true }
//     );

//     if (result) {
//       res.json({
//         success: true,
//         data: result,
//         message: "New status added successfully.",
//       });
//     } else {
//       res.status(202).json({
//         statusCode: 202,
//         message: "No documents found.",
//       });
//     }
//   } catch (err) {
//     res.status(500).json({
//       statusCode: 500,
//       message: err.message,
//     });
//   }
// });

router.get("/branch_user/:branchuser_id", async (req, res) => {
  try {
    const branchuser_id = req.params.branchuser_id;
    var data = await BranchAssign.aggregate([
      {
        $match: { branchuser_id: branchuser_id },
      },
    ]);

    for (let i = 0; i < data.length; i++) {
      const file_id = data[i].file_id;

      const branchUserData = await File_Uplode.findOne({
        file_id: file_id,
      });

      if (branchUserData) {
        const loan_id = branchUserData.loan_id;
        const loantype_id = branchUserData?.loantype_id;
        const user_id = branchUserData?.user_id;
        const loan_data = await Loan.findOne({ loan_id: loan_id });
        const loan_type_data = await Loan_Type.findOne({
          loantype_id: loantype_id,
        });
        const user_data = await User.findOne({ user_id: user_id });

        if (loan_data) {
          data[i].loan = loan_data.loan;
        }
        if (loan_type_data) {
          data[i].loan_type = loan_type_data.loan_type;
        }
        if (user_data) {
          data[i].username = user_data.username;
        }
      }
    }

    const count = data.length;

    res.json({
      statusCode: 200,
      data: data,
      count: count,
      message: "Read All Request",
    });
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

module.exports = router;
